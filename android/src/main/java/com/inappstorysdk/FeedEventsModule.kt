package com.inappstory.reactnativesdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = FeedEventsModule.NAME)
class FeedEventsModule(reactContext: ReactApplicationContext) :
  NativeFeedEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeFeedEvents"

    // Bridge so StoryManagerModule's list subscriber (where the Android SDK
    // surfaces reader open/close) can reach this module's codegen emit*.
    // Mirrors iOS NativeFeedEventsImpl.shared.
    @Volatile
    var instance: FeedEventsModule? = null
  }

  init {
    instance = this
  }

  override fun getName(): String = NAME

  private fun sendLegacyEvent(name: String, payload: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, payload)
  }

  override fun setupFeedEvents() {
    Log.d(NAME, "setupFeedEvents")
  }

  override fun invalidate() {
    if (instance === this) instance = null
    super.invalidate()
  }

  fun emitReaderWillShow(feed: String?) {
    val body: WritableMap = Arguments.createMap().apply {
      putString("feed", feed)
      putString("type", "list")
    }
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", "storyReaderWillShow")
      putMap("body", body)
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitStoryReaderWillShow(payload)
    else sendLegacyEvent("storyReaderWillShow", payload)
  }

  fun emitReaderDidClose(feed: String?) {
    val body: WritableMap = Arguments.createMap().apply {
      putString("feed", feed)
      putString("type", "list")
    }
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", "storyReaderDidClose")
      putMap("body", body)
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitStoryReaderDidClose(payload)
    else sendLegacyEvent("storyReaderDidClose", payload)
  }
}
