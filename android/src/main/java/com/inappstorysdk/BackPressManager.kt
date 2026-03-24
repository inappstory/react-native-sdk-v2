package com.inappstorysdk

import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
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
 * Не даём default-реализацию invokeDefaultOnBackPressed(), чтобы не конфликтовать
 * с реализацией в ReactActivity. MainActivity сама решает, что вызвать.
 */
interface BackPressManagerHost : DefaultHardwareBackBtnHandler {

  val backPressManager: BackPressManager
    get() = managers.getOrPut(this) { BackPressManager() }

  companion object {
    private val managers = java.util.WeakHashMap<BackPressManagerHost, BackPressManager>()

    /**
     * Регистрирует перехват back press для API >= 33.
     * Вызвать один раз из Activity.onCreate().
     */
    fun install(activity: ComponentActivity) {
      require(activity is BackPressManagerHost) {
        "${activity::class.simpleName} must implement BackPressManagerHost"
      }
      val host = activity as BackPressManagerHost

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        activity.onBackPressedDispatcher.addCallback(
          activity,
          object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
              if (!host.backPressManager.shouldInterceptBackPress()) {
                isEnabled = false
                activity.onBackPressedDispatcher.onBackPressed()
                isEnabled = true
              }
            }
          }
        )
      }
    }
  }
}
