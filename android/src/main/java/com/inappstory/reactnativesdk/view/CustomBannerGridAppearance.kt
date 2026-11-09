package com.inappstory.reactnativesdk.view

import android.content.Context
import android.view.View
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
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

    override fun loadingPlaceholder(context: Context): View? =
        AppearanceManagerImpl.bannerLoadingPlaceholder?.createView(context)
            ?: super.loadingPlaceholder(context)
}
