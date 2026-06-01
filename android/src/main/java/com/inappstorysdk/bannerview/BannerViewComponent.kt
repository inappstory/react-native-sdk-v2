package com.inappstorysdk.bannerview


import com.inappstory.sdk.AppearanceManager
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.banners.BannerCarouselNavigationCallback
import com.inappstory.sdk.banners.BannerData
import com.inappstory.sdk.banners.BannerPlaceLoadCallback
import com.inappstory.sdk.banners.BannerPlaceLoadSettings
import com.inappstory.sdk.banners.BannerPlacePreloadCallback
import com.inappstory.sdk.banners.ui.carousel.BannerCarousel
import com.inappstory.sdk.banners.ui.carousel.DefaultBannerCarouselAppearance

import android.annotation.SuppressLint
import android.widget.LinearLayout
import com.facebook.react.uimanager.ThemedReactContext

@SuppressLint("ViewConstructor")
class BannerViewComponent(context: ThemedReactContext) : LinearLayout(context) {
    private var rContext: ThemedReactContext = context

    private val bannerCarousel: BannerCarousel = BannerCarousel(rContext)

    init {
        addView(bannerCarousel)
    }

    fun setPlaceId(placeId: String) {
        bannerCarousel.setPlaceId(placeId)
    }

    fun pause() {
        bannerCarousel.pause()
    }

    fun resume() {
        bannerCarousel.resume()
    }

    fun showNext() {
        bannerCarousel.showNext()
    }

    fun showPrevious() {
        bannerCarousel.showPrevious()
    }

    fun showBannerWith(index: Int) {
        bannerCarousel.showBannerWith(index)
    }
}
