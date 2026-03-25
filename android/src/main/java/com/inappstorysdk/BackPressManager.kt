package com.inappstorysdk

import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

class BackPressManager {
  fun interface OverlayHandler {
    fun handleBackPress(): Boolean
  }

  var overlayHandler: OverlayHandler? = null
  var isManagerEnabled = false

  fun shouldInterceptBackPress(): Boolean =
    isManagerEnabled && overlayHandler?.handleBackPress() == true
}

interface BackPressManagerHost : DefaultHardwareBackBtnHandler {

  val backPressManager: BackPressManager
    get() = managers.getOrPut(this) { BackPressManager() }

  companion object {
    private val managers = java.util.WeakHashMap<BackPressManagerHost, BackPressManager>()
  }
}
