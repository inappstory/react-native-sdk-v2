package com.inappstory.reactnativesdk.view

import android.view.View
import android.widget.LinearLayout
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.inappstory.sdk.banners.ui.banner.BannerView
import androidx.test.platform.app.InstrumentationRegistry
import com.inappstory.reactnativesdk.appearance.AppearanceManagerImpl
import com.inappstory.sdk.banners.ui.grid.BannerGrid
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class BannerGridLayoutTest {
    @Test
    fun measuresAllRowsEvenWhenReactConstrainsTheHostHeight() {
        withGrid { host, _, grid ->
            measureAndLayout(host, 150)

            assertEquals(282, grid.measuredHeight)
            assertEquals(282, grid.height)
            assertEquals(268, grid.getChildAt(1).bottom)
        }
    }

    @Test
    fun reportsMeasuredHeightOnceAndReportsContentSizeChanges() {
        withGrid { host, container, grid ->
            val notifications = mutableListOf<Pair<Int, Int>>()
            container.onContentLoaded = { size, height -> notifications.add(size to height) }
            container.placeLoaded(4)
            assertTrue(notifications.isEmpty())

            measureAndLayout(host, 0)
            repeat(10) { measureAndLayout(host, 282) }
            assertEquals(listOf(4 to 282), notifications)

            grid.getChildAt(1).layoutParams.height = 180
            grid.requestLayout()
            measureAndLayout(host, 282)
            assertEquals(listOf(4 to 282, 4 to 342), notifications)
        }
    }

    @Test
    fun waitsForWidthAndUsesOnlyTheLatestPendingLoad() {
        withGrid { host, container, grid ->
            val widths = mutableListOf<Int>()
            container.whenWidthReady { widths.add(-1) }
            container.whenWidthReady { widths.add(grid.measuredWidth) }
            assertTrue(widths.isEmpty())

            measureAndLayout(host, 0)
            repeat(10) { measureAndLayout(host, 282) }
            assertEquals(listOf(600), widths)

            container.whenWidthReady { widths.add(grid.measuredWidth) }
            assertEquals(listOf(600, 600), widths)
        }
    }

    @Test
    fun emitsZeroForEmptyResultsAndDoesNotResurrectOldContent() {
        withGrid { host, container, _ ->
            val notifications = mutableListOf<Pair<Int, Int>>()
            container.onContentLoaded = { size, height -> notifications.add(size to height) }
            container.placeLoaded(0)
            measureAndLayout(host, 150)
            assertEquals(listOf(0 to 0), notifications)
        }
    }

    @Test
    fun cancelsPendingLoadsAndNotificationsOnResetOrDispose() {
        withGrid { host, container, _ ->
            var loads = 0
            val notifications = mutableListOf<Pair<Int, Int>>()
            container.onContentLoaded = { size, height -> notifications.add(size to height) }
            container.whenWidthReady { loads++ }
            container.placeLoaded(4)
            container.reset()
            measureAndLayout(host, 0)
            assertEquals(0, loads)
            assertTrue(notifications.isEmpty())

            container.requestLayout()
            container.whenWidthReady { loads++ }
            container.placeLoaded(4)
            container.dispose()
            measureAndLayout(host, 150)
            assertEquals(0, loads)
            assertTrue(notifications.isEmpty())
        }
    }

    @Test
    fun reportsTheSameHeightAgainOnlyAfterNewMetadataOnReload() {
        withGrid { host, container, _ ->
            val notifications = mutableListOf<Pair<Int, Int>>()
            container.onContentLoaded = { size, height -> notifications.add(size to height) }
            container.placeLoaded(4)
            measureAndLayout(host, 150)
            container.reset()
            measureAndLayout(host, 150)
            assertEquals(listOf(4 to 282), notifications)

            container.placeLoaded(4)
            measureAndLayout(host, 150)
            assertEquals(listOf(4 to 282, 4 to 282), notifications)
        }
    }

    @Test
    fun doesNotReloadForHeightOnlyPropTransactions() {
        withGrid { host, container, grid ->
            host.placeId = "grid-test"
            host.applyAppearanceAndLoad()
            measureAndLayout(host, 0)
            val notifications = mutableListOf<Pair<Int, Int>>()
            container.onContentLoaded = { size, height -> notifications.add(size to height) }
            container.placeLoaded(4)
            measureAndLayout(host, 150)
            assertEquals(listOf(4 to 282), notifications)

            repeat(10) {
                host.applyAppearanceAndLoad()
                measureAndLayout(host, 282)
            }
            grid.getChildAt(1).layoutParams.height = 180
            grid.requestLayout()
            measureAndLayout(host, 282)
            assertEquals(listOf(4 to 282, 4 to 342), notifications)
        }
    }

    @Test
    fun refreshWaitsForWidthAndNewMetadata() {
        withGrid { host, container, _ ->
            val notifications = mutableListOf<Pair<Int, Int>>()
            container.onContentLoaded = { size, height -> notifications.add(size to height) }
            host.placeId = "grid-test"
            host.applyAppearanceAndLoad()
            host.refresh()
            measureAndLayout(host, 0)
            assertTrue(notifications.isEmpty())

            container.placeLoaded(4)
            measureAndLayout(host, 150)
            host.refresh()
            measureAndLayout(host, 282)
            assertEquals(listOf(4 to 282), notifications)

            container.placeLoaded(4)
            measureAndLayout(host, 282)
            assertEquals(listOf(4 to 282, 4 to 282), notifications)
        }
    }

    @Test
    fun appliesGridConfigurationOnlyAfterWidthIsMeasured() {
        withGrid { host, _, _ ->
            val manager = AppearanceManagerImpl.getAppearanceManager()
            manager.csBannerGridInterface(CustomBannerGridAppearance(8, 8, 16))
            host.columnSpacing = 16f
            host.cornerRadius = 24f
            host.applyAppearanceAndLoad()
            assertEquals(8, manager.csBannerGridInterface().horizontalGap())
            assertEquals(16, manager.csBannerGridInterface().cornerRadius())

            measureAndLayout(host, 0)
            assertEquals(16, manager.csBannerGridInterface().horizontalGap())
            assertEquals(24, manager.csBannerGridInterface().cornerRadius())
        }
    }

    @Test
    fun appliesColumnCountAndUpdatesItAfterPropsChange() {
        withGrid { host, _, _ ->
            host.columnCount = 3
            host.applyAppearanceAndLoad()
            measureAndLayout(host, 0)
            val manager = AppearanceManagerImpl.getAppearanceManager()
            assertEquals(3, manager.csBannerGridInterface().columnCount())

            host.columnCount = 1
            host.applyAppearanceAndLoad()
            measureAndLayout(host, 0)
            assertEquals(1, manager.csBannerGridInterface().columnCount())
        }
    }

    @Test
    fun appliesCornerRadiusToBannerCardViewsInHierarchy() {
        withGrid { host, _, grid ->
            val context = grid.context
            var setRadiusCalledWith: Float? = null
            val bannerView = object : BannerView(context) {
                override fun setBannerRadius(radius: Float) {
                    super.setBannerRadius(radius)
                    setRadiusCalledWith = radius
                }
            }
            val row = LinearLayout(context).apply {
                addView(bannerView)
            }
            host.cornerRadius = 20f
            grid.addView(row)
            val density = host.resources.displayMetrics.density
            assertEquals(20f * density, setRadiusCalledWith ?: 0f, 0.01f)

            host.cornerRadius = 10f
            host.applyCornerRadiusToDescendants(grid, 10f * density)
            assertEquals(10f * density, setRadiusCalledWith ?: 0f, 0.01f)
        }
    }

    @Test
    fun measuresAvailableWidthAfterInsetsAndRebuildsOnWidthChanges() {
        withGrid { host, container, grid ->
            val widths = mutableListOf<Int>()
            container.onWidthChanged = { widths.add(grid.measuredWidth) }
            host.setPadding(20, 0, 30, 0)
            container.whenWidthReady { widths.add(grid.measuredWidth) }
            measureAndLayout(host, 0)
            assertEquals(listOf(550), widths)

            host.measure(
                View.MeasureSpec.makeMeasureSpec(800, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(150, View.MeasureSpec.EXACTLY)
            )
            host.layout(0, 0, 800, 150)
            assertEquals(listOf(550, 750), widths)

            host.setPadding(10, 0, 10, 0)
            container.whenWidthReady { widths.add(grid.measuredWidth) }
            assertEquals(listOf(550, 750), widths)
            measureAndLayout(host, 150)
            assertEquals(listOf(550, 750, 580), widths)
        }
    }

    private fun measureAndLayout(host: View, height: Int) {
        host.measure(
            View.MeasureSpec.makeMeasureSpec(600, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
        )
        host.layout(0, 0, 600, height)
    }

    private fun withGrid(
        test: (BannerGridViewComponent, BannerGridContentLayout, BannerGrid) -> Unit
    ) {
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val reactContext = bannerTestReactContext(context)
            val host = BannerGridViewComponent(reactContext)
            val container = host.getChildAt(0) as BannerGridContentLayout
            val grid = container.getChildAt(0) as BannerGrid
            grid.setPadding(0, 10, 0, 14)
            repeat(2) { row ->
                grid.addView(
                    LinearLayout(context).apply {
                        repeat(2) {
                            addView(View(context), LinearLayout.LayoutParams(0, 120, 1f))
                        }
                    },
                    LinearLayout.LayoutParams(-1, -2).apply {
                        topMargin = if (row == 0) 0 else 18
                    }
                )
            }

            try {
                test(host, container, grid)
            } finally {
                // Synthetic rows are plain layouts, not SDK BannerGridRow instances.
                grid.removeAllViews()
                host.dispose()
            }
        }
    }
}
