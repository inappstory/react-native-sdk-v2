package com.inappstory.reactnativesdk.view

import android.content.Context
import android.view.View
import android.widget.FrameLayout

internal class BannerGridContentLayout(context: Context) : FrameLayout(context) {
    var onContentLoaded: ((Int, Int) -> Unit)? = null
    var onWidthChanged: (() -> Unit)? = null
    private var pendingLoad: (() -> Unit)? = null
    private var bannerCount: Int? = null
    private var lastNotification: Pair<Int, Int>? = null
    private var contentWidth = 0

    fun whenWidthReady(load: () -> Unit) {
        val hostNeedsLayout = (parent as? View)?.isLayoutRequested == true
        if (!isLayoutRequested && !hostNeedsLayout && (getChildAt(0)?.measuredWidth ?: 0) > 0) {
            load()
        } else {
            pendingLoad = load
            requestLayout()
        }
    }

    fun placeLoaded(size: Int) {
        bannerCount = size
        if (size == 0) {
            notifyLoaded(0, 0)
        } else {
            requestLayout()
        }
    }

    fun reset() {
        pendingLoad = null
        bannerCount = null
        lastNotification = null
    }

    fun dispose() {
        reset()
        onContentLoaded = null
        onWidthChanged = null
    }

    private fun notifyLoaded(size: Int, height: Int) {
        val notification = Pair(size, height)
        if (notification != lastNotification) {
            lastNotification = notification
            onContentLoaded?.invoke(size, height)
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val content = getChildAt(0)
        if (content == null) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
            return
        }
        // Yoga may give the host zero/loading height. Measure every native row.
        content.measure(
            MeasureSpec.makeMeasureSpec(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
        )
        for (index in 1 until childCount) {
            measureChildWithMargins(getChildAt(index), widthMeasureSpec, 0, heightMeasureSpec, 0)
        }
        setMeasuredDimension(
            resolveSize(content.measuredWidth, widthMeasureSpec),
            resolveSize(content.measuredHeight, heightMeasureSpec)
        )
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        val content = getChildAt(0) ?: return
        content.layout(0, 0, content.measuredWidth, content.measuredHeight)
        if (content.measuredWidth <= 0) return
        val widthChanged = contentWidth > 0 && contentWidth != content.measuredWidth
        contentWidth = content.measuredWidth
        val load = pendingLoad
        pendingLoad = null
        val size = bannerCount ?: 0
        when {
            load != null -> load()
            widthChanged && onWidthChanged != null -> onWidthChanged?.invoke()
            size > 0 && content.measuredHeight > 0 ->
                notifyLoaded(size, content.measuredHeight)
        }
    }
}
