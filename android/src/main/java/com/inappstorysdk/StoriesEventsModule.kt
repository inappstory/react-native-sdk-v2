package com.inappstory.reactnativesdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.stories.outercallbacks.common.reader.ClickOnShareStoryCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.CloseReader
import com.inappstory.sdk.stories.outercallbacks.common.reader.CloseStoryCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.FavoriteStoryCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.LikeDislikeStoryCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowSlideCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowStoryAction
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowStoryCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.SlideData
import com.inappstory.sdk.stories.outercallbacks.common.reader.StoryData

@ReactModule(name = StoriesEventsModule.NAME)
class StoriesEventsModule(reactContext: ReactApplicationContext) :
  NativeStoriesEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeStoriesEvents"
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
      "showStory" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitShowStory(payload) else sendLegacyEvent(name, payload)
      "closeStory" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitCloseStory(payload) else sendLegacyEvent(name, payload)
      "showSlide" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitShowSlide(payload) else sendLegacyEvent(name, payload)
      "likeStory" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitLikeStory(payload) else sendLegacyEvent(name, payload)
      "dislikeStory" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitDislikeStory(payload) else sendLegacyEvent(name, payload)
      "favoriteStory" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitFavoriteStory(payload) else sendLegacyEvent(name, payload)
      "clickOnShareStory" -> if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitClickOnShareStory(payload) else sendLegacyEvent(name, payload)
      else -> sendLegacyEvent(name, payload)
    }
  }

  private fun storyBody(slide: SlideData): WritableMap = Arguments.createMap().apply {
    putInt("id", slide.story().id())
    putString("feed", slide.story().feed())
    putInt("index", slide.index())
  }

  override fun setupStoriesEvents() {
    Log.d(NAME, "setupStoriesEvents")
    val manager = InAppStoryManager.getInstance() ?: return

    manager.setShowStoryCallback(object : ShowStoryCallback {
      override fun showStory(storyData: StoryData, action: ShowStoryAction) {
        emit("showStory", Arguments.createMap().apply {
          putInt("id", storyData.id())
          putString("feed", storyData.feed())
          putString("action", when (action) {
            ShowStoryAction.OPEN -> "open"
            ShowStoryAction.TAP -> "tap"
            ShowStoryAction.SWIPE -> "swipe"
            ShowStoryAction.AUTO -> "auto"
            ShowStoryAction.CUSTOM -> "custom"
            else -> "unknown"
          })
          putInt("slidesCount", storyData.slidesCount())
        })
      }
    })

    manager.setCloseStoryCallback(object : CloseStoryCallback {
      override fun closeStory(slideData: SlideData, action: CloseReader) {
        emit("closeStory", storyBody(slideData).apply {
          putString("action", when (action) {
            CloseReader.AUTO -> "auto"
            CloseReader.CLICK -> "click"
            CloseReader.SWIPE -> "swipe"
            CloseReader.CUSTOM -> "custom"
            else -> "unknown"
          })
        })
      }
    })

    manager.setShowSlideCallback(object : ShowSlideCallback {
      override fun showSlide(slideData: SlideData) {
        emit("showSlide", Arguments.createMap().apply {
          putInt("id", slideData.story().id())
          putInt("index", slideData.index())
        })
      }
    })

    manager.setLikeDislikeStoryCallback(object : LikeDislikeStoryCallback {
      override fun likeStory(slideData: SlideData, value: Boolean) {
        emit("likeStory", storyBody(slideData).apply { putBoolean("value", value) })
      }

      override fun dislikeStory(slideData: SlideData, value: Boolean) {
        emit("dislikeStory", storyBody(slideData).apply { putBoolean("value", value) })
      }
    })

    manager.setFavoriteStoryCallback(object : FavoriteStoryCallback {
      override fun favoriteStory(slideData: SlideData, value: Boolean) {
        emit("favoriteStory", storyBody(slideData).apply { putBoolean("value", value) })
      }
    })

    manager.setClickOnShareStoryCallback(object : ClickOnShareStoryCallback {
      override fun shareClick(slideData: SlideData) {
        emit("clickOnShareStory", storyBody(slideData))
      }
    })
  }
}
