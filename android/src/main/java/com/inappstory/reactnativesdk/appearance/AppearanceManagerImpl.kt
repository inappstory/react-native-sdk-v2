package com.inappstory.reactnativesdk.appearance

import com.inappstory.sdk.AppearanceManager;

object AppearanceManagerImpl {
  private var appearanceManager: AppearanceManager? = null

  var goodsCloseIconResId: Int = 0

  @Synchronized
  fun getAppearanceManager(): AppearanceManager {
    if (appearanceManager == null) {
      appearanceManager = AppearanceManager().also {
        AppearanceManager.setCommonInstance(it)
      }
    }
    return appearanceManager!!
  }
}
