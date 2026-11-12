package com.inappstory.reactnativesdk.view

import android.content.Context
import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
import com.inappstory.sdk.banners.ui.list.DefaultBannerListAppearance

class CustomBannerListAppearance(
    private val gap: Int,
    private val radius: Int
) : DefaultBannerListAppearance() {
    override fun orientation(): Int = RecyclerView.VERTICAL
    override fun bannersGap(): Int = gap
    override fun cornerRadius(): Int = radius

    override fun loadingPlaceholder(context: Context): View? =
        AppearanceManagerImpl.bannerLoadingPlaceholder?.createView(context)
            ?: super.loadingPlaceholder(context)
}
