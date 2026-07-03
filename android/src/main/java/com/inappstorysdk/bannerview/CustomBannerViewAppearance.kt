package com.inappstorysdk.bannerview

import com.inappstory.sdk.banners.ui.carousel.DefaultBannerCarouselAppearance
import android.content.Context
import android.view.View

class CustomBannerViewAppearance(
    private val prevBannerOffset: Int?,
    private val nextBannerOffset: Int?,
    private val bannersGap: Int?,
    private val cornerRadius: Int?,
    private val loop: Boolean?
) : DefaultBannerCarouselAppearance() {
    override fun nextBannerOffset(): Int {
        return nextBannerOffset ?: super.nextBannerOffset()
    }

    override fun prevBannerOffset(): Int {
        return prevBannerOffset ?: super.prevBannerOffset()
    }

    override fun bannersGap(): Int {
        return bannersGap ?: super.bannersGap()
    }

    override fun cornerRadius(): Int {
        return cornerRadius ?: super.cornerRadius()
    }

    override fun loop(): Boolean {
        return loop ?: super.loop()
    }

    override fun loadingPlaceholder(context: Context?): View {
        return super.loadingPlaceholder(context)
    }
}
