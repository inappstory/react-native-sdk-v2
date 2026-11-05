package com.inappstory.reactnativesdk.view

import com.inappstory.sdk.banners.ui.grid.DefaultBannerGridAppearance

class CustomBannerGridAppearance(
    private val horizontalGap: Int,
    private val verticalGap: Int,
    private val cornerRadius: Int? = null
) : DefaultBannerGridAppearance() {
    override fun columnCount(): Int = 2
    override fun horizontalGap(): Int = horizontalGap
    override fun verticalGap(): Int = verticalGap
    override fun cornerRadius(): Int = cornerRadius ?: super.cornerRadius()
}
