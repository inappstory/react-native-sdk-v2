package com.inappstorysdk

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import android.util.Log

class InappstorySdkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "InappstorySdkModule"
  var ias: InAppStoryManager? = null
  @ReactMethod
  fun initWith(apiKey: String, userID: String) {
      Log.d("InappstorySdkModule", "initWith")
      InAppStoryManager.initSdk(reactContext.getApplicationContext())
      this.ias = this.createInAppStoryManager(apiKey, userID)
  }

  @ReactMethod
  fun showGame(gameID: String) {
      Log.d("InappstorySdkModule", "showGame")
      this.ias.openGame(gameID, reactContext.getApplicationContext())
  }

  fun createInAppStoryManager(
    apiKey: String,
    userId: String
  ): InAppStoryManager {
      return InAppStoryManager.Builder()
      .apiKey(apiKey)
      .userId(userId)
      .create()
  }
}