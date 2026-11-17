package com.inappstory.reactnativesdk.view

import android.view.View
import android.widget.FrameLayout
import androidx.recyclerview.widget.RecyclerView
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
import com.inappstory.sdk.banners.ui.banner.BannerView
import com.inappstory.sdk.banners.ui.list.BannerList
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotSame
import org.junit.Assert.assertSame
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class BannerListLayoutTest {
    @Test
    fun retiresSdkRequestIdentityBeforeReloadAndDisposal() {
        val operations = mutableListOf<String>()
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val reactContext = bannerTestReactContext(context)
            val list = object : BannerList(checkNotNull(reactContext.currentActivity)) {
                override fun uniqueId(uniqueId: String) {
                    operations.add("retire")
                }

                override fun setPlaceId(placeId: String?) {
                    operations.add("place:$placeId")
                }
            }
            val host = BannerListViewComponent(reactContext, list)
            host.placeId = "list-test"
            host.applyAppearanceAndLoad()
            measureAndLayout(host, 240)
            assertEquals(listOf("retire", "place:null", "place:list-test"), operations)

            operations.clear()
            host.refresh()
            assertEquals(listOf("retire", "place:null", "place:list-test"), operations)

            operations.clear()
            host.dispose()
            host.dispose()
            assertEquals(listOf("retire", "place:null"), operations)
        }
    }

    @Test
    fun usesOneVerticalColumnAndConfiguredAppearance() {
        val appearance = CustomBannerListAppearance(12, 24)
        assertEquals(RecyclerView.VERTICAL, appearance.orientation())
        assertEquals(1, appearance.columnCount())
        assertEquals(12, appearance.bannersGap())
        assertEquals(24, appearance.cornerRadius())
        assertEquals(4, appearance.edgeBannersPadding())
    }

    @Test
    fun fillsOnlyTheViewportAllocatedByReactNative() {
        withList { host, list ->
            for (height in listOf(0, 150, 320)) {
                measureAndLayout(host, height)
                assertEquals(600, list.measuredWidth)
                assertEquals(height, list.measuredHeight)
                assertEquals(height, host.height)
            }
        }
    }

    @Test
    fun waitsForWidthAndDoesNotReapplyAppearanceForSizeOnlyUpdates() {
        withList { host, _ ->
            val manager = AppearanceManagerImpl.getAppearanceManager()
            val before = manager.csBannerListInterface()
            host.interItemSpacing = 12f
            host.cornerRadius = 24f
            host.applyAppearanceAndLoad()
            assertSame(before, manager.csBannerListInterface())

            measureAndLayout(host, 150)
            val configured = manager.csBannerListInterface()
            assertNotSame(before, configured)
            assertEquals(12, configured.bannersGap())
            assertEquals(24, configured.cornerRadius())

            host.applyAppearanceAndLoad()
            measureAndLayout(host, 320)
            assertSame(configured, manager.csBannerListInterface())
        }
    }

    @Test
    fun appliesAsymmetricHorizontalPaddingInPhysicalPixels() {
        withList { host, list ->
            host.sideInset = 20f
            host.leadingInset = 0f
            host.trailingInset = 30f
            host.applyAppearanceAndLoad()
            measureAndLayout(host, 240)
            val density = host.resources.displayMetrics.density
            assertEquals(0, list.paddingLeft)
            assertEquals((30f * density).toInt(), list.paddingRight)
        }
    }

    @Test
    fun reappliesConfiguredRadiusToRecycledBannerCards() {
        withList { host, list ->
            var appliedRadius = -1f
            val banner = object : BannerView(list.context) {
                override fun setBannerRadius(radius: Float) {
                    super.setBannerRadius(radius)
                    appliedRadius = radius
                }
            }.apply { id = com.inappstory.sdk.R.id.bannerView }
            val item = FrameLayout(list.context).apply { addView(banner) }
            val density = host.resources.displayMetrics.density
            host.cornerRadius = 24f
            host.applyBannerRadius(item)
            assertEquals(24f * density, appliedRadius, 0.01f)

            host.cornerRadius = 0f
            host.applyBannerRadius(item)
            assertEquals(0f, appliedRadius, 0.01f)
        }
    }

    @Test
    fun disposalCancelsConfigurationWaitingForWidth() {
        withList { host, _ ->
            val manager = AppearanceManagerImpl.getAppearanceManager()
            val before = manager.csBannerListInterface()
            host.interItemSpacing = 30f
            host.applyAppearanceAndLoad()
            host.dispose()
            measureAndLayout(host, 240)
            host.applyAppearanceAndLoad()
            host.refresh()
            assertSame(before, manager.csBannerListInterface())
        }
    }

    private fun measureAndLayout(host: View, height: Int) {
        host.measure(
            View.MeasureSpec.makeMeasureSpec(600, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
        )
        host.layout(0, 0, 600, height)
    }

    private fun withList(test: (BannerListViewComponent, BannerList) -> Unit) {
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val reactContext = bannerTestReactContext(context)
            val host = BannerListViewComponent(reactContext)
            try {
                test(host, host.getChildAt(0) as BannerList)
            } finally {
                host.dispose()
            }
        }
    }
}
