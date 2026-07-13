package com.inappstory.reactnativesdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.stories.outercallbacks.common.reader.CallToActionCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.ClickAction
import com.inappstory.sdk.stories.outercallbacks.common.reader.ContentData

@ReactModule(name = SystemEventsModule.NAME)
class SystemEventsModule(reactContext: ReactApplicationContext) :
  NativeSystemEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeSystemEvents"
  }

  override fun getName(): String = NAME

  private fun sendLegacyEvent(name: String, payload: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, payload)
  }

  override fun setupSystemEvents() {
    Log.d(NAME, "setupSystemEvents")
    InAppStoryManager.getInstance()?.setCallToActionCallback(object : CallToActionCallback {
      override fun callToAction(
        context: android.content.Context?,
        slideData: ContentData?,
        link: String?,
        action: ClickAction?
      ) {
        val actionString = when (action) {
          ClickAction.BUTTON -> "button"
          ClickAction.SWIPE -> "swipe"
          ClickAction.GAME -> "game"
          ClickAction.DEEPLINK -> "deeplink"
          null -> "unknown"
        }
        val body: WritableMap = Arguments.createMap().apply {
          putString("url", link)
          putString("action", actionString)
        }
        val payload: WritableMap = Arguments.createMap().apply {
          putString("withName", "handleCTA")
          putMap("body", body)
        }
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitHandleCTA(payload)
        else sendLegacyEvent("handleCTA", payload)
      }
    })
  }
}
