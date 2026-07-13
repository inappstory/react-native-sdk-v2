package com.inappstory.reactnativesdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstory.sdk.banners.BannerData

@ReactModule(name = BannerEventsModule.NAME)
class BannerEventsModule(reactContext: ReactApplicationContext) :
  NativeBannerEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeBannerEvents"

    // Bridge so StoryManagerModule's setBannerWidgetCallback (registered on the
    // Android SDK) can reach this module's codegen emit*. Mirrors FeedEventsModule.
    @Volatile
    var instance: BannerEventsModule? = null
  }

  init {
    instance = this
  }

  override fun getName(): String = NAME

  override fun setupBannerEvents() {
    Log.d(NAME, "setupBannerEvents")
  }

  override fun invalidate() {
    if (instance === this) instance = null
    super.invalidate()
  }

  fun emitBannerWidget(bannerData: BannerData?, name: String?, data: Map<String, String?>?) {
    val body: WritableMap = Arguments.createMap().apply {
      putString("name", name)
      putMap("data", Arguments.makeNativeMap(data as Map<String, Any>?))
      putMap(
        "bannerData",
        Arguments.createMap().apply {
          bannerData?.id()?.let { putInt("id", it) }
          putString("bannerPlace", bannerData?.bannerPlace())
          putString("payload", bannerData?.payload())
        }
      )
    }
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", "bannerWidgetEvent")
      putMap("body", body)
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitBannerWidgetEvent(payload)
    else reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("bannerWidgetEvent", payload)
  }
}
