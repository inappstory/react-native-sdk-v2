package com.inappstorysdk

import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

// ─── Менеджер ─────────────────────────────────────────────────────────────────

class BackPressManager {
  fun interface OverlayHandler {
    fun handleBackPress(): Boolean
  }

  var overlayHandler: OverlayHandler? = null
  var isManagerEnabled = false

  fun shouldInterceptBackPress(): Boolean =
    isManagerEnabled && overlayHandler?.handleBackPress() == true
}

// ─── Host ─────────────────────────────────────────────────────────────────────

/**
 * Расширяет DefaultHardwareBackBtnHandler — стандартный интерфейс React Native
 * для перехвата физической кнопки «Назад».
 *
 * Единственная точка входа — invokeDefaultOnBackPressed(), которую React Native
 * вызывает когда JS-сторона не обработала нажатие.
 * MainActivity делает explicit override и делегирует в BackPressManager.
 */
interface BackPressManagerHost : DefaultHardwareBackBtnHandler {

  val backPressManager: BackPressManager
    get() = managers.getOrPut(this) { BackPressManager() }

  companion object {
    private val managers = java.util.WeakHashMap<BackPressManagerHost, BackPressManager>()
  }
}
