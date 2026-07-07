package com.inappstory.reactnativesdk

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule

import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowStoryAction
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowStoryCallback
import com.inappstory.sdk.stories.outercallbacks.common.reader.StoryData

@ReactModule(name = StoriesEventsModule.NAME)
class StoriesEventsModule(reactContext: ReactApplicationContext) :
  NativeStoriesEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeStoriesEvents"
  }

  override fun getName(): String = NAME

  // Mirrors iOS NativeStoriesEventsImpl: wires the SDK story callback to the
  // codegen-generated emit* methods. Only showStory is wired (iOS parity);
  // the rest are emit-only stubs until the callbacks are ported (#4).
  override fun setupStoriesEvents() {
    Log.d(NAME, "setupStoriesEvents")
    InAppStoryManager.getInstance()?.setShowStoryCallback(object : ShowStoryCallback {
      override fun showStory(storyData: StoryData, action: ShowStoryAction) {
        val body: WritableMap = Arguments.createMap().apply {
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
        }
        val payload: WritableMap = Arguments.createMap().apply {
          putString("withName", "showStory")
          putMap("body", body)
        }
        emitShowStory(payload)
      }
    })
  }
}
