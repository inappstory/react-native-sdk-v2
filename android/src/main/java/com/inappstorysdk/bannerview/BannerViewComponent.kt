package com.inappstorysdk.bannerview


import com.inappstory.sdk.AppearanceManager
import com.inappstory.sdk.banners.BannerCarouselNavigationCallback
import com.inappstory.sdk.banners.BannerData
import com.inappstory.sdk.banners.BannerPlaceLoadCallback
import com.inappstory.sdk.banners.ui.carousel.BannerCarousel
import android.util.TypedValue

import android.annotation.SuppressLint
import android.widget.LinearLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

@SuppressLint("ViewConstructor")
class BannerViewComponent(context: ThemedReactContext) : LinearLayout(context) {
    private var rContext: ThemedReactContext = context

    private val bannerCarousel: BannerCarousel = BannerCarousel(rContext.currentActivity ?: rContext)

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

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

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
                val payload = Arguments.createMap()
                payload.putInt("index", position)
                emitEvent("onScroll", payload)
            }
        })

        bannerCarousel.loadCallback(object : BannerPlaceLoadCallback() {
            override fun bannerPlaceLoaded(
                size: Int,
                bannerData: MutableList<BannerData>,
                widgetHeight: Int
            ) {
                val payload = Arguments.createMap()
                payload.putInt("size", size)
                payload.putDouble("widgetHeight", toDp(widgetHeight).toDouble())
                emitEvent("onPlaceLoaded", payload)
            }

            override fun loadError() {}

            override fun bannerLoaded(bannerId: Int, isFirst: Boolean) {}

            override fun bannerLoadError(bannerId: Int, isFirst: Boolean) {}
        })
    }

    private fun emitEvent(eventName: String, payload: WritableMap) {
        post {
            rContext.getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(id, eventName, payload)
        }
    }

    private fun toDp(px: Int): Float {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_PX, px.toFloat(), resources.displayMetrics
        ) / resources.displayMetrics.density
    }

    private fun dpToPx(dp: Float?): Int? {
        if (dp == null) return null
        return (dp * resources.displayMetrics.density).toInt()
    }

    fun applyAppearanceAndLoad() {
        val prevOffset = dpToPx(leadingInset ?: sideInset)
        val nextOffset = dpToPx(trailingInset ?: sideInset)

        val appearance = CustomBannerViewAppearance(
            prevBannerOffset = prevOffset,
            nextBannerOffset = nextOffset,
            bannersGap = dpToPx(interItemSpacing),
            cornerRadius = dpToPx(cornerRadius),
            loop = shouldLoop
        )

        AppearanceManager().csBannerCarouselInterface(appearance)

        placeId?.let {
            bannerCarousel.setPlaceId(it)
            bannerCarousel.loadBanners()
        }
    }

    fun refresh() {
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
