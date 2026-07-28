package com.inappstory.reactnativesdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.stories.outercallbacks.common.gamereader.GameReaderCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.ContentData
import com.inappstory.sdk.stories.outercallbacks.common.reader.SlideData

@ReactModule(name = GameEventsModule.NAME)
class GameEventsModule(reactContext: ReactApplicationContext) :
  NativeGameEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeGameEvents"
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
      "startGame" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitStartGame(payload) else sendLegacyEvent(name, payload)
      "closeGame" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitCloseGame(payload) else sendLegacyEvent(name, payload)
      "eventGame" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitEventGame(payload) else sendLegacyEvent(name, payload)
      "gameFailure" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitGameFailure(payload) else sendLegacyEvent(name, payload)
      else -> sendLegacyEvent(name, payload)
    }
  }

  // Body mirrors iOS NativeGameEventsImpl (gameID + story id/feed when launched from a story).
  private fun gameBody(data: ContentData?, gameId: String?): WritableMap =
    Arguments.createMap().apply {
      putString("gameID", gameId)
      val slide = data as? SlideData
      putInt("id", slide?.story()?.id() ?: -1)
      putString("feed", slide?.story()?.feed() ?: "")
    }

  override fun setupGameEvents() {
    Log.d(NAME, "setupGameEvents")
    val manager = InAppStoryManager.getInstance() ?: return

    manager.setGameReaderCallback(object : GameReaderCallback {
      override fun startGame(data: ContentData?, gameId: String?) {
        emit("startGame", gameBody(data, gameId))
      }

      override fun closeGame(data: ContentData?, gameId: String?) {
        emit("closeGame", gameBody(data, gameId))
      }

      override fun eventGame(
        data: ContentData?,
        gameId: String?,
        eventName: String?,
        payload: String?
      ) {
        emit("eventGame", gameBody(data, gameId).apply {
          putString("name", eventName)
          putString("payload", payload)
        })
      }

      // Android has two error callbacks; both map to the shared gameFailure event,
      // with the original name in `message` (mirrors SystemEventsModule mapping).
      override fun gameLoadError(data: ContentData?, gameId: String?) {
        emit("gameFailure", gameBody(data, gameId).apply {
          putString("message", "gameLoadError")
        })
      }

      override fun gameOpenError(data: ContentData?, gameId: String?) {
        emit("gameFailure", gameBody(data, gameId).apply {
          putString("message", "gameOpenError")
        })
      }
    })
  }
}
