package com.inappstory.reactnativesdk

import com.inappstory.sdk.InAppStoryManager;
import android.content.Context;

class InAppStory {
  companion object {
    fun initSDK(context: Context) {
      InAppStoryManager.initSDK(context)
    }
  }
}
