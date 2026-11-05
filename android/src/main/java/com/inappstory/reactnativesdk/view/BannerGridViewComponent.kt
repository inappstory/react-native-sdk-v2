package com.inappstory.reactnativesdk.view

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.uimanager.ThemedReactContext
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
import com.inappstory.sdk.banners.BannerData
import com.inappstory.sdk.banners.BannerPlaceLoadCallback
import com.inappstory.sdk.banners.ui.banner.BannerView
import com.inappstory.sdk.banners.ui.grid.BannerGrid
import kotlin.math.roundToInt

@SuppressLint("ViewConstructor")
class BannerGridViewComponent(context: ThemedReactContext) : BannerPlaceComponent(context) {
    private val bannerGrid = BannerGrid(context)
    private val gridContainer = BannerGridContentLayout(context)
    private val callbackHandler = Handler(Looper.getMainLooper())
    private var loadingPlaceholder: View? = null
    private var configuration: GridConfiguration? = null
    private var boundPlaceId: String? = null
    @Volatile private var disposed = false
    @Volatile private var generation = 0

    private data class GridConfiguration(
        val placeId: String?,
        val columnSpacing: Int,
        val rowSpacing: Int,
        val leftInset: Int,
        val rightInset: Int,
        val interItemSpacing: Float,
        val cornerRadius: Float
    )

    var placeId: String? = null
    var columnSpacing: Float = 8f
    var rowSpacing: Float = 8f
    var sideInset: Float = 0f
    var leadingInset: Float? = null
    var trailingInset: Float? = null
    var interItemSpacing: Float = 8f
    var cornerRadius: Float = 16f

    init {
        gridContainer.addView(
            bannerGrid,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
        )
        addView(gridContainer, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
        gridContainer.onContentLoaded = { size, height ->
            loadingPlaceholder?.visibility = View.GONE
            val radiusPx = cornerRadius * resources.displayMetrics.density
            applyCornerRadiusToDescendants(bannerGrid, radiusPx)
            emitPlaceLoaded(id, size, height)
        }
        gridContainer.onWidthChanged = {
            configuration?.let(::applyGridAppearance)
        }
        setupHierarchyListener()
        registerLoadCallback()
    }

    private fun setupHierarchyListener() {
        val rowListener = object : ViewGroup.OnHierarchyChangeListener {
            override fun onChildViewAdded(parent: View?, child: View?) {
                if (child != null) {
                    val radiusPx = cornerRadius * resources.displayMetrics.density
                    applyCornerRadiusToDescendants(child, radiusPx)
                }
            }

            override fun onChildViewRemoved(parent: View?, child: View?) {}
        }

        bannerGrid.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
            override fun onChildViewAdded(parent: View?, child: View?) {
                if (child is ViewGroup) {
                    child.setOnHierarchyChangeListener(rowListener)
                }
                if (child != null) {
                    val radiusPx = cornerRadius * resources.displayMetrics.density
                    applyCornerRadiusToDescendants(child, radiusPx)
                }
            }

            override fun onChildViewRemoved(parent: View?, child: View?) {}
        })
    }

    private fun registerLoadCallback() {
        val currentGeneration = generation
        bannerGrid.loadCallback(object : BannerPlaceLoadCallback() {
            override fun bannerPlaceLoaded(
                size: Int,
                bannerData: MutableList<BannerData>,
                widgetHeight: Int
            ) {
                if (disposed) return
                val count = if (size > 0 && bannerData.isNotEmpty()) size else 0
                callbackHandler.post {
                    if (!disposed && generation == currentGeneration) {
                        gridContainer.placeLoaded(count)
                    }
                }
            }

            override fun loadError() {
                if (disposed) return
                callbackHandler.post {
                    if (!disposed && generation == currentGeneration) {
                        gridContainer.reset()
                        loadingPlaceholder?.visibility = View.GONE
                        Log.e("BannerGridView", "Failed to load banner place: $placeId")
                    }
                }
            }
            override fun bannerLoaded(bannerId: Int, isFirst: Boolean) {}
            override fun bannerLoadError(bannerId: Int, isFirst: Boolean) {}
        })
    }

    fun applyAppearanceAndLoad() {
        if (disposed) return
        val density = resources.displayMetrics.density
        val next = GridConfiguration(
            placeId,
            columnSpacing.roundToInt().coerceAtLeast(0),
            rowSpacing.roundToInt().coerceAtLeast(0),
            ((leadingInset ?: sideInset) * density).toInt(),
            ((trailingInset ?: sideInset) * density).toInt(),
            interItemSpacing,
            cornerRadius
        )
        // A native height event updates Yoga props too; it must not start another load.
        if (next == configuration) return
        configuration = next
        prepareForLoad()
        setPadding(next.leftInset, paddingTop, next.rightInset, paddingBottom)
        gridContainer.whenWidthReady {
            loadBanners(next, false)
        }
    }

    private fun loadBanners(config: GridConfiguration, refresh: Boolean) {
        if (boundPlaceId != config.placeId) {
            bannerGrid.setPlaceId(null)
            boundPlaceId = config.placeId
        }
        applyGridAppearance(config)
        bannerGrid.setPlaceId(config.placeId)
        if (config.placeId != null) bannerGrid.loadBanners(refresh)
    }

    private fun applyGridAppearance(config: GridConfiguration) {
        val appearance = CustomBannerGridAppearance(
            config.columnSpacing,
            config.rowSpacing,
            config.cornerRadius.roundToInt()
        )
        val manager = AppearanceManagerImpl.getAppearanceManager()
        manager.csBannerGridInterface(appearance)
        bannerGrid.setAppearanceManager(manager)
        applyCornerRadiusToDescendants(
            bannerGrid,
            config.cornerRadius * resources.displayMetrics.density
        )
    }

    internal fun applyCornerRadiusToDescendants(view: View, radiusPx: Float) {
        if (view is BannerView) {
            view.setBannerRadius(radiusPx)
        }
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                applyCornerRadiusToDescendants(view.getChildAt(i), radiusPx)
            }
        }
    }

    override fun refresh() {
        if (disposed) return
        prepareForLoad()
        gridContainer.whenWidthReady {
            configuration?.let { loadBanners(it, true) }
        }
    }

    private fun prepareForLoad() {
        generation++
        callbackHandler.removeCallbacksAndMessages(null)
        gridContainer.reset()
        registerLoadCallback()
        updateLoadingPlaceholder()
        loadingPlaceholder?.visibility = View.VISIBLE
    }

    fun dispose() {
        disposed = true
        callbackHandler.removeCallbacksAndMessages(null)
        gridContainer.dispose()
        bannerGrid.setPlaceId(null)
        bannerGrid.pauseBanners()
    }

    private fun updateLoadingPlaceholder() {
        loadingPlaceholder?.let(gridContainer::removeView)
        loadingPlaceholder = AppearanceManagerImpl.bannerLoadingPlaceholder
            ?.createView(context)
        loadingPlaceholder?.let { placeholder ->
            gridContainer.addView(
                placeholder,
                FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT,
                    Gravity.CENTER
                )
            )
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!disposed) bannerGrid.resumeBanners()
    }

    override fun onDetachedFromWindow() {
        bannerGrid.pauseBanners()
        super.onDetachedFromWindow()
    }
}
