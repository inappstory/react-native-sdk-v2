package com.inappstory.reactnativesdk.view


import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
import com.inappstory.sdk.banners.BannerCarouselNavigationCallback
import com.inappstory.sdk.banners.BannerData
import com.inappstory.sdk.banners.BannerPlaceLoadCallback
import com.inappstory.sdk.banners.ui.carousel.BannerCarousel
import android.annotation.SuppressLint
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.ThemedReactContext
import kotlin.math.roundToInt

@SuppressLint("ViewConstructor")
class BannerViewComponent(context: ThemedReactContext) : BannerPlaceComponent(context) {
    private val bannerCarousel: BannerCarousel = BannerCarousel(activityContext)

    // Props received from React. Stored as-is and turned into appearance in
    // applyAppearanceAndLoad(), which runs once per update transaction.
    var placeId: String? = null
    var shouldLoop: Boolean? = null
    var sideInset: Float? = null
    var leadingInset: Float? = null
    var trailingInset: Float? = null
    var interItemSpacing: Float? = null
    var cornerRadius: Float? = null

    init {
        bannerCarousel.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
        )
        addView(bannerCarousel)
        registerCallbacks()
    }

    // Bridge the carousel's native callbacks to React direct events. Mirrors the
    // iOS BannerView (onScroll / onPlaceLoaded). onActionWith is not wired yet —
    // the Android SDK only exposes it as a global callback.
    private fun registerCallbacks() {
        bannerCarousel.navigationCallback(object : BannerCarouselNavigationCallback {
            override fun onPageScrolled(
                position: Int,
                total: Int,
                positionOffset: Float,
                positionOffsetPixels: Int
            ) {
            }

            override fun onPageSelected(position: Int, total: Int) {
                val payload = Arguments.createMap().apply { putInt("index", position) }
                emitEvent(id, "onScroll", payload)
            }
        })

        bannerCarousel.loadCallback(object : BannerPlaceLoadCallback() {
            override fun bannerPlaceLoaded(
                size: Int,
                bannerData: MutableList<BannerData>,
                widgetHeight: Int
            ) {
                emitPlaceLoaded(id, size, widgetHeight)
            }

            override fun loadError() {}

            override fun bannerLoaded(bannerId: Int, isFirst: Boolean) {}

            override fun bannerLoadError(bannerId: Int, isFirst: Boolean) {}
        })
    }

    // Called once from the view manager's onAfterUpdateTransaction, after the
    // whole batch of props has been written. The appearance is immutable, so we
    // rebuild it from scratch and (re)load the banners.
    fun applyAppearanceAndLoad() {
        // sideInset applies to both sides; leading/trailing override per side.
        val prevOffset = (leadingInset ?: sideInset)?.roundToInt()
        val nextOffset = (trailingInset ?: sideInset)?.roundToInt()

        val appearance = CustomBannerViewAppearance(
            prevBannerOffset = prevOffset,
            nextBannerOffset = nextOffset,
            bannersGap = interItemSpacing?.roundToInt(),
            cornerRadius = cornerRadius?.roundToInt(),
            loop = shouldLoop
        )

        val appearanceManager = AppearanceManagerImpl.getAppearanceManager()
        appearanceManager.csBannerCarouselInterface(appearance)
        bannerCarousel.setAppearanceManager(appearanceManager)

        placeId?.let {
            bannerCarousel.setPlaceId(it)
            bannerCarousel.loadBanners()
        }
    }

    override fun refresh() {
        bannerCarousel.loadBanners(true)
    }
    
    fun pause() {
        bannerCarousel.pauseAutoscroll()
    }

    fun resume() {
        bannerCarousel.resumeAutoscroll()
    }

    fun showNext() {
        bannerCarousel.showNext()
    }

    fun showPrevious() {
        bannerCarousel.showPrevious()
    }

    fun showBannerWith(index: Int) {
        bannerCarousel.showByIndex(index)
    }
}
