package com.inappstory.reactnativesdk

import com.inappstory.sdk.InAppStoryManager;
import android.app.Application

class InAppStory {
  companion object {
    fun initSDK(application: Application) {
      InAppStoryManager.initSDK(application, false)
    }
  }
}
