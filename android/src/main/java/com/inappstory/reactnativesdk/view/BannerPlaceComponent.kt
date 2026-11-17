package com.inappstory.reactnativesdk.view

import android.util.TypedValue
import android.widget.LinearLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

abstract class BannerPlaceComponent(context: ThemedReactContext) : LinearLayout(context) {
    protected val rContext: ThemedReactContext = context
    protected val activityContext = checkNotNull(context.currentActivity) {
        "An Activity is required to create a banner view"
    }

    // RN/Yoga does not remeasure native children automatically after the outer
    // host view is laid out, so explicitly measure the SDK widget.
    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    protected fun emitPlaceLoaded(viewId: Int, size: Int, widgetHeightPx: Int) {
        val heightDp = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_PX,
            widgetHeightPx.toFloat(),
            resources.displayMetrics
        ) / resources.displayMetrics.density
        val payload = Arguments.createMap().apply {
            putInt("size", size)
            putDouble("widgetHeight", heightDp.toDouble())
        }
        emitEvent(viewId, "onPlaceLoaded", payload)
    }

    protected fun emitEvent(viewId: Int, eventName: String, payload: WritableMap) {
        // SDK callbacks may arrive on a worker thread; RN direct events belong
        // on the UI thread.
        post {
            rContext.getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(viewId, eventName, payload)
        }
    }

    abstract fun refresh()
}
