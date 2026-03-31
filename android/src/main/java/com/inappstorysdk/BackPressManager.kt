package com.inappstorysdk

import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

abstract class BackPressManagerHandler {
    abstract fun handleBackPress(): Boolean
}

class BackPressManager {
  var overlayHandler: BackPressManagerHandler? = null
  var isManagerEnabled = false

  fun shouldInterceptBackPress(): Boolean {
        if (isManagerEnabled) {
            if (overlayHandler?.handleBackPress() == true) {
                return true
            }
            return false
        }
        return false
    }
}

interface BackPressManagerHost : DefaultHardwareBackBtnHandler {

  val backPressManager: BackPressManager
    get() = managers.getOrPut(this) { BackPressManager() }

  companion object {
    private val managers = java.util.WeakHashMap<BackPressManagerHost, BackPressManager>()
  }
}
