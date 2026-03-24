package com.inappstorysdk

import android.os.Build
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
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

/**
 * Расширяет DefaultHardwareBackBtnHandler — стандартный интерфейс React Native
 * для перехвата физической кнопки «Назад».
 *
 * invokeDefaultOnBackPressed() вызывается React Native, когда JS-сторона
 * не обработала событие. Здесь мы перехватываем его через BackPressManager,
 * и только если менеджер не обработал — пробрасываем дальше через super.
 *
 * install() регистрирует колбек для API >= 33 (Tiramisu), где onBackPressed() deprecated.
 */
interface BackPressManagerHost : DefaultHardwareBackBtnHandler {

  val backPressManager: BackPressManager
    get() = managers.getOrPut(this) { BackPressManager() }

  /**
   * Точка входа для React Native: вызывается когда JS не перехватил back press.
   * Реализация по умолчанию делегирует в BackPressManager.
   * Activity должна вызвать super (через invokeDefaultOnBackPressedImpl),
   * если менеджер не обработал событие.
   */
  override fun invokeDefaultOnBackPressed() {
    if (!backPressManager.shouldInterceptBackPress()) {
      Log.d("InappstorySdkModule", "BackPressManagerHost: not intercepted, invoking default")
      invokeDefaultOnBackPressedImpl()
    }
  }

  /**
   * Вызывается когда BackPressManager не обработал событие.
   * Activity переопределяет этот метод чтобы вызвать super.onBackPressed() / finish().
   */
  fun invokeDefaultOnBackPressedImpl()

  companion object {
    private val managers = java.util.WeakHashMap<BackPressManagerHost, BackPressManager>()

    /**
     * Регистрирует перехват back press для API >= 33, где onBackPressed() deprecated.
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
