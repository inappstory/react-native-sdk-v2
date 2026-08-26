package com.inappstory.reactnativesdk.events

import com.inappstory.reactnativesdk.NativeIamEventsSpec
import com.inappstory.reactnativesdk.BuildConfig

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.inappmessage.CloseInAppMessageCallback
import com.inappstory.sdk.inappmessage.InAppMessageData
import com.inappstory.sdk.inappmessage.InAppMessageWidgetCallback
import com.inappstory.sdk.inappmessage.ShowInAppMessageCallback

@ReactModule(name = IamEventsModule.NAME)
class IamEventsModule(reactContext: ReactApplicationContext) :
  NativeIamEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeIamEvents"
  }

  override fun getName(): String = NAME

  private fun sendLegacyEvent(name: String, payload: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, payload)
  }

  private fun emit(name: String, body: WritableMap) {
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", name)
      putMap("body", body)
    }
    when (name) {
      "showInAppMessage" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitShowInAppMessage(payload) else sendLegacyEvent(name, payload)
      "closeInAppMessage" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitCloseInAppMessage(payload) else sendLegacyEvent(name, payload)
      "inAppMessageWidgetEvent" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitInAppMessageWidgetEvent(payload) else sendLegacyEvent(name, payload)
      else -> sendLegacyEvent(name, payload)
    }
  }

  // Body mirrors iOS NativeIamEventsImpl: {id, title, event}.
  private fun iamBody(data: InAppMessageData?): WritableMap =
    Arguments.createMap().apply {
      data?.let {
        putInt("id", it.id())
        putString("title", it.title())
        putString("event", it.event())
      }
    }

  override fun setupIamEvents() {
    Log.d(NAME, "setupIamEvents")
    val manager = InAppStoryManager.getInstance() ?: return

    manager.setShowInAppMessageCallback(object : ShowInAppMessageCallback {
      override fun showInAppMessage(data: InAppMessageData?) {
        emit("showInAppMessage", iamBody(data))
      }
    })

    manager.setCloseInAppMessageCallback(object : CloseInAppMessageCallback {
      override fun closeInAppMessage(data: InAppMessageData?) {
        emit("closeInAppMessage", iamBody(data))
      }
    })

    manager.setInAppMessageWidgetCallback(object : InAppMessageWidgetCallback {
      override fun inAppMessageWidget(
        data: InAppMessageData?,
        widgetEventName: String?,
        widgetData: Map<String, String>?
      ) {
        emit("inAppMessageWidgetEvent", Arguments.createMap().apply {
          putMap("inAppMessageData", iamBody(data))
          putString("name", widgetEventName)
          putMap("data", Arguments.makeNativeMap(widgetData as Map<String, Any>?))
        })
      }
    })
  }
}
