package com.inappstory.reactnativesdk.view

import android.app.Activity
import android.content.Context
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.facebook.react.bridge.BridgeReactContext
import com.facebook.react.uimanager.ThemedReactContext
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertThrows
import org.junit.Test
import org.junit.runner.RunWith

internal fun bannerTestReactContext(context: Context): ThemedReactContext {
    val activity = object : Activity() {
        init {
            attachBaseContext(context)
        }
    }
    val bridge = BridgeReactContext(context)
    bridge.onHostResume(activity)
    return ThemedReactContext(bridge, activity, null, -1)
}

@RunWith(AndroidJUnit4::class)
class BannerActivityContextTest {
    @Test
    fun createsSdkWidgetsWithTheCurrentActivity() {
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val reactContext = bannerTestReactContext(context)
            val activity = checkNotNull(reactContext.currentActivity)

            val carousel = BannerViewComponentViewManager().createViewInstance(reactContext)
            val list = BannerListViewComponentViewManager().createViewInstance(reactContext)
            val grid = BannerGridViewComponentViewManager().createViewInstance(reactContext)
            try {
                assertSame(reactContext, carousel.context)
                assertSame(activity, carousel.getChildAt(0).context)
                assertSame(activity, list.getChildAt(0).context)
                assertSame(activity, (grid.getChildAt(0) as BannerGridContentLayout).getChildAt(0).context)
            } finally {
                list.dispose()
                grid.dispose()
            }
        }
    }

    @Test
    fun rejectsBannerCreationWithoutAnActivity() {
        InstrumentationRegistry.getInstrumentation().runOnMainSync {
            val context = InstrumentationRegistry.getInstrumentation().targetContext
            val reactContext = ThemedReactContext(BridgeReactContext(context), context, null, -1)
            val error = assertThrows(IllegalStateException::class.java) {
                BannerViewComponentViewManager().createViewInstance(reactContext)
            }
            assertEquals("An Activity is required to create a banner view", error.message)
        }
    }
}
