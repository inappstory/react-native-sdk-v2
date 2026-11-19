package com.inappstory.reactnativesdk.appearance

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.bridge.JavaOnlyMap
import com.inappstory.reactnativesdk.modules.AppearanceManagerModule
import com.inappstory.reactnativesdk.view.CustomBannerViewAppearance
import com.inappstory.reactnativesdk.view.CustomBannerGridAppearance
import com.inappstory.reactnativesdk.view.CustomBannerListAppearance
import com.inappstory.sdk.AppearanceManager
import com.inappstory.sdk.banners.ui.banner.BannerView
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LoadingPlaceholderTest {
    @Test
    fun bannerFactoriesFillSdkCellsAndRestoreDefaultsForCarouselAndGrid() = onMain {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val carousel = CustomBannerViewAppearance(null, null, null, null, null)
        val grid = CustomBannerGridAppearance(8, 8)
        val list = CustomBannerListAppearance(8, 16)
        val factories = listOf<(Context) -> View?>(
            carousel::loadingPlaceholder,
            grid::loadingPlaceholder,
            list::loadingPlaceholder
        )
        AppearanceManagerImpl.bannerLoadingPlaceholder = LoadingPlaceholderOptions(Color.BLUE, Color.YELLOW)
        try {
            for (createView in factories) {
                val banner = BannerView(context)
                val loader = createView(context) as FrameLayout
                banner.setLoadingPlaceholder(loader)
                banner.measure(
                    View.MeasureSpec.makeMeasureSpec(600, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(240, View.MeasureSpec.EXACTLY)
                )
                banner.layout(0, 0, 600, 240)
                val container = loader.parent as ViewGroup
                assertTrue(container.width > 0 && container.height > 0)
                assertGeometry(container, loader, container.width, container.height)
                assertGeometry(container, loader, 240, 600)
                assertEquals(Color.BLUE, (loader.background as ColorDrawable).color)
                assertEquals(Color.YELLOW, (loader.getChildAt(0) as ProgressBar).indeterminateTintList!!.defaultColor)
            }
            AppearanceManagerImpl.bannerLoadingPlaceholder = null
            for (createView in factories) assertNull(createView(context))
        } finally {
            AppearanceManagerImpl.bannerLoadingPlaceholder = null
        }
    }

    @Test
    fun readerLoaderFillsTheHostDespiteSdkWrapContentAndResizesOnReopen() = onMain {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val module = AppearanceManagerModule(BridgeReactContext(context))
        try {
            module.setLoadingPlaceholders(JavaOnlyMap.of(
                "storyReader", JavaOnlyMap.of("backgroundColor", "#ff0000", "indicatorColor", "#00ff00")
            ))
            val host = FrameLayout(context)
            val loader = AppearanceManager.getLoader(context, Color.WHITE) as FrameLayout
            host.addView(loader)
            assertGeometry(host, loader, 600, 900)
            assertGeometry(host, loader, 900, 600)
            assertEquals(Color.RED, (loader.background as ColorDrawable).color)
            assertEquals(Color.GREEN, (loader.getChildAt(0) as ProgressBar).indeterminateTintList!!.defaultColor)
            host.removeView(loader)
            val reopened = AppearanceManager.getLoader(context, Color.WHITE) as FrameLayout
            assertNotSame(loader, reopened)
            host.addView(reopened)
            assertGeometry(host, reopened, 320, 480)
            module.setLoadingPlaceholders(JavaOnlyMap.of("storyReader", null))
            assertNull(AppearanceManagerImpl.getAppearanceManager().csStoryLoaderView())
        } finally {
            module.setLoadingPlaceholders(JavaOnlyMap())
        }
    }

    @Test
    fun iamAndBannerOptionsHaveIndependentColorsAndResetToNull() = onMain {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val module = AppearanceManagerModule(BridgeReactContext(context))
        try {
            module.setLoadingPlaceholders(JavaOnlyMap.of(
                "iam", JavaOnlyMap.of("backgroundColor", "#ff0000", "indicatorColor", "#00ff00"),
                "banners", JavaOnlyMap.of("backgroundColor", "#0000ff", "indicatorColor", "#ffff00")
            ))
            for ((options, background, indicator) in listOf(
                Triple(AppearanceManagerImpl.iamLoadingPlaceholder!!, Color.RED, Color.GREEN),
                Triple(AppearanceManagerImpl.bannerLoadingPlaceholder!!, Color.BLUE, Color.YELLOW)
            )) {
                val host = FrameLayout(context)
                val loader = options.createView(context) as FrameLayout
                host.addView(loader, FrameLayout.LayoutParams(-1, -1))
                assertGeometry(host, loader, 600, 900)
                assertGeometry(host, loader, 900, 600)
                assertEquals(background, (loader.background as ColorDrawable).color)
                assertEquals(indicator, (loader.getChildAt(0) as ProgressBar).indeterminateTintList!!.defaultColor)
            }
            module.setLoadingPlaceholders(JavaOnlyMap.of("iam", null, "banners", null))
            assertNull(AppearanceManagerImpl.iamLoadingPlaceholder)
            assertNull(AppearanceManagerImpl.bannerLoadingPlaceholder)
        } finally {
            module.setLoadingPlaceholders(JavaOnlyMap())
        }
    }

    private fun assertGeometry(host: ViewGroup, loader: FrameLayout, width: Int, height: Int) {
        host.measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
        )
        host.layout(0, 0, width, height)
        assertEquals(0, loader.left)
        assertEquals(0, loader.top)
        assertEquals(width, loader.width)
        assertEquals(height, loader.height)
        val indicator = loader.getChildAt(0)
        assertEquals(width / 2f, (loader.left + indicator.left + indicator.right) / 2f, 1f)
        assertEquals(height / 2f, (loader.top + indicator.top + indicator.bottom) / 2f, 1f)
    }

    private fun onMain(test: () -> Unit) {
        InstrumentationRegistry.getInstrumentation().runOnMainSync(test)
    }
}
