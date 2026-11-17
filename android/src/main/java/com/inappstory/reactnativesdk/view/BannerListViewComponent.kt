package com.inappstory.reactnativesdk.view

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
import com.inappstory.sdk.banners.BannerData
import com.inappstory.sdk.banners.BannerPlaceLoadCallback
import com.inappstory.sdk.banners.ui.banner.BannerView
import com.inappstory.sdk.banners.ui.list.BannerList
import java.lang.ref.WeakReference
import java.util.UUID
import kotlin.math.roundToInt

@SuppressLint("ViewConstructor")
class BannerListViewComponent(
    context: ThemedReactContext,
    bannerList: BannerList? = null
) : BannerPlaceComponent(context) {
    private val bannerList = bannerList ?: BannerList(activityContext)
    private val callbackHandler = Handler(Looper.getMainLooper())
    private var configuration: ListConfiguration? = null
    private var pendingLoad = false
    private var skipCache = false
    private var manuallyPaused = false
    @Volatile private var generation = 0
    @Volatile private var disposed = false

    private data class ListConfiguration(
        val placeId: String?,
        val leftInset: Int,
        val rightInset: Int,
        val gap: Int,
        val radius: Int
    )

    var placeId: String? = null
    var sideInset: Float = 16f
    var leadingInset: Float? = null
    var trailingInset: Float? = null
    var interItemSpacing: Float = 8f
    var cornerRadius: Float = 16f

    private val childListener = object : RecyclerView.OnChildAttachStateChangeListener {
        override fun onChildViewAttachedToWindow(view: View) = applyBannerRadius(view)
        override fun onChildViewDetachedFromWindow(view: View) {}
    }

    init {
        addView(bannerList, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        bannerList.addOnChildAttachStateChangeListener(childListener)
    }

    internal fun applyBannerRadius(item: View) {
        // SDK 1.26.0 binds recycled list cards with a hard-coded 16dp radius.
        val banner = if (item is BannerView) item
        else item.findViewById<BannerView>(com.inappstory.sdk.R.id.bannerView)
        banner?.setBannerRadius(cornerRadius * resources.displayMetrics.density)
    }

    fun applyAppearanceAndLoad() {
        if (disposed) return
        val density = resources.displayMetrics.density
        val next = ListConfiguration(
            placeId,
            ((leadingInset ?: sideInset) * density).toInt().coerceAtLeast(0),
            ((trailingInset ?: sideInset) * density).toInt().coerceAtLeast(0),
            interItemSpacing.roundToInt().coerceAtLeast(0),
            cornerRadius.roundToInt().coerceAtLeast(0)
        )
        if (configuration == next) return
        configuration = next
        prepareForLoad()
        loadWhenSized()
    }

    private fun prepareForLoad() {
        generation++
        callbackHandler.removeCallbacksAndMessages(null)
        pendingLoad = true
    }

    private fun loadWhenSized() {
        if (disposed || !pendingLoad || bannerList.width <= 0) return
        val config = configuration ?: return
        pendingLoad = false
        bannerList.pauseBanners()
        unbindPlace()
        val manager = AppearanceManagerImpl.getAppearanceManager()
        manager.csBannerListInterface(CustomBannerListAppearance(config.gap, config.radius))
        bannerList.setAppearanceManager(manager)
        bannerList.setPadding(config.leftInset, bannerList.paddingTop, config.rightInset, bannerList.paddingBottom)
        for (index in 0 until bannerList.childCount) {
            applyBannerRadius(bannerList.getChildAt(index))
        }
        registerLoadCallback()
        bannerList.setPlaceId(config.placeId)
        if (config.placeId != null) bannerList.loadBanners(skipCache)
        skipCache = false
        if (isAttachedToWindow && !manuallyPaused) bannerList.resumeBanners()
    }

    private fun registerLoadCallback() {
        val owner = WeakReference(this)
        val currentGeneration = generation
        bannerList.loadCallback(object : BannerPlaceLoadCallback() {
            private fun dispatch(action: (BannerListViewComponent) -> Unit) {
                val host = owner.get() ?: return
                host.callbackHandler.post {
                    if (!host.disposed && host.generation == currentGeneration) action(host)
                }
            }

            override fun bannerPlaceLoaded(
                size: Int,
                bannerData: MutableList<BannerData>,
                widgetHeight: Int
            ) {
                val count = if (size > 0 && bannerData.isNotEmpty()) size else 0
                dispatch { host ->
                    val payload = Arguments.createMap().apply {
                        putInt("size", count)
                        // Like Flutter: SDK -1/-2 are layout constants, not content heights.
                        putDouble("widgetHeight", 0.0)
                    }
                    host.rContext.getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(host.id, "onPlaceLoaded", payload)
                }
            }

            override fun loadError() {
                dispatch { host ->
                    Log.e("BannerListView", "Failed to load banner place: ${host.placeId}")
                }
            }
            override fun bannerLoaded(bannerId: Int, isFirst: Boolean) {}
            override fun bannerLoadError(bannerId: Int, isFirst: Boolean) {
                dispatch { host ->
                    Log.e("BannerListView", "Failed to load banner $bannerId in place: ${host.placeId}")
                }
            }
        })
    }

    private fun unbindPlace() {
        // SDK teardown nulls a retained model's placeId; retire its pending request identity first.
        bannerList.uniqueId(UUID.randomUUID().toString())
        bannerList.setPlaceId(null)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        loadWhenSized()
    }

    override fun refresh() {
        if (disposed) return
        skipCache = true
        prepareForLoad()
        loadWhenSized()
    }

    fun pause() {
        manuallyPaused = true
        bannerList.pauseBanners()
    }

    fun resume() {
        manuallyPaused = false
        if (!disposed && isAttachedToWindow) bannerList.resumeBanners()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!disposed && !manuallyPaused) bannerList.resumeBanners()
    }

    override fun onDetachedFromWindow() {
        bannerList.pauseBanners()
        super.onDetachedFromWindow()
    }

    fun dispose() {
        if (disposed) return
        disposed = true
        generation++
        pendingLoad = false
        callbackHandler.removeCallbacksAndMessages(null)
        bannerList.pauseBanners()
        bannerList.removeOnChildAttachStateChangeListener(childListener)
        unbindPlace()
    }
}
