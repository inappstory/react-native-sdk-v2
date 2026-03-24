package com.inappstorysdk

import android.os.Build
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class BackPressManager {
  fun interface OverlayHandler {
    fun handleBackPress(): Boolean
  }

  var overlayHandler: OverlayHandler? = null
  var isManagerEnabled = false

  fun shouldInterceptBackPress(): Boolean =
    isManagerEnabled && overlayHandler?.handleBackPress() == true
}

interface BackPressManagerHost {
  val backPressManager: BackPressManager
    get() = managers.getOrPut(this) { BackPressManager() }

  companion object {
    private val managers = java.util.WeakHashMap<BackPressManagerHost, BackPressManager>()

    fun install(activity: ComponentActivity) {
      require(activity is BackPressManagerHost) {
        "${activity::class.simpleName} must implement BackPressManagerHost"
      }
      val manager = (activity as BackPressManagerHost).backPressManager

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        activity.onBackPressedDispatcher.addCallback(
          activity,
          object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
              if (!manager.shouldInterceptBackPress()) {
                isEnabled = false
                activity.onBackPressedDispatcher.onBackPressed()
                isEnabled = true
              }
            }
          }
        )
      }
    }

    @Suppress("DEPRECATION")
    fun handleLegacyBackPress(activity: ComponentActivity): Boolean {
      Log.d("InappstorySdkModule", "onBackPressed Activity")
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
        if (activity is BackPressManagerHost) {
          return activity.backPressManager.shouldInterceptBackPress()
        }
      }
      return false
    }
  }
}
