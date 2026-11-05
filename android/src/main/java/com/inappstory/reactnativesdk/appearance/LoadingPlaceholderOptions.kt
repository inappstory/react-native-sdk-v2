package com.inappstory.reactnativesdk.appearance

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.ProgressBar
import kotlin.math.roundToInt

data class LoadingPlaceholderOptions(
  val backgroundColor: Int?,
  val indicatorColor: Int?
) {
  fun createView(context: Context): View {
    val size = (48 * context.resources.displayMetrics.density).roundToInt()
    val indicatorSize = (32 * context.resources.displayMetrics.density).roundToInt()
    val indicator = ProgressBar(context).apply {
      isIndeterminate = true
      indicatorColor?.let { indeterminateTintList = ColorStateList.valueOf(it) }
    }

    return FrameLayout(context).apply {
      minimumHeight = size
      setBackgroundColor(backgroundColor ?: Color.TRANSPARENT)
      addView(
        indicator,
        FrameLayout.LayoutParams(indicatorSize, indicatorSize, Gravity.CENTER)
      )
    }
  }
}
