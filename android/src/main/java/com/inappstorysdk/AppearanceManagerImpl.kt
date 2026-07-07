package com.inappstory.reactnativesdk

import com.inappstory.sdk.AppearanceManager;

object AppearanceManagerImpl {
  private var appearanceManager: AppearanceManager? = null

  fun getAppearanceManager(): AppearanceManager {
    if (appearanceManager == null) {
      appearanceManager = AppearanceManager()
    }
    return appearanceManager!!
  }
}
