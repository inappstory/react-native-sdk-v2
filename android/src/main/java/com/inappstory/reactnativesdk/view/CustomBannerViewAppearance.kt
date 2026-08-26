package com.inappstory.reactnativesdk.view

import com.inappstory.sdk.banners.ui.carousel.DefaultBannerCarouselAppearance

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
}
