package com.inappstorysdk

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import android.util.Log

import com.inappstory.sdk.InAppStoryManager;

class InappstorySdkModule(var reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNInAppStorySDKModule"
  var ias: InAppStoryManager? = null
  @ReactMethod
  fun initWith(apiKey: String, userID: String) {
      Log.d("InappstorySdkModule", "initWith")
      InAppStoryManager.initSDK(reactContext.getApplicationContext())
      this.ias = this.createInAppStoryManager(apiKey, userID)
  }

  @ReactMethod
  fun showGame(gameID: String) {
      Log.d("InappstorySdkModule", "showGame")
      this.ias?.openGame(gameID, reactContext.getApplicationContext())
  }

  @ReactMethod
  fun showSingle(storyID: String) {
      Log.d("InappstorySdkModule", "storyID")
      this.ias?.showSingle(storyID, reactContext.getApplicationContext())
  }

  @ReactMethod
  fun removeFromFavorite(storyID: String) {
      Log.d("InappstorySdkModule", "removeFromFavorite")
      //TODO
  }

  @ReactMethod
  fun removeAllFavorites() {
      Log.d("InappstorySdkModule", "removeAllFavorites")
      //TODO
  }

  @ReactMethod
  fun setTags() {
      Log.d("InappstorySdkModule", "setTags")
      //TODO
  }

  @ReactMethod
  fun addTags() {
      Log.d("InappstorySdkModule", "addTags")
      //TODO
  }

  @ReactMethod
  fun removeTags() {
      Log.d("InappstorySdkModule", "removeTags")
      //TODO
  }

  @ReactMethod
  fun setPlaceholders() {
      Log.d("InappstorySdkModule", "setPlaceholders")
      //TODO
  }

  @ReactMethod
  fun setImagesPlaceholders() {
      Log.d("InappstorySdkModule", "setImagesPlaceholders")
      //TODO
  }

  @ReactMethod
  fun changeSound() {
      Log.d("InappstorySdkModule", "changeSound")
      //TODO
  }

  @ReactMethod
  fun setHasLike() {
      Log.d("InappstorySdkModule", "setHasLike")
      //TODO
  }

  @ReactMethod
  fun setHasFavorites() {
      Log.d("InappstorySdkModule", "setHasFavorites")
      //TODO
  }

  @ReactMethod
  fun setHasShare() {
      Log.d("InappstorySdkModule", "setHasShare")
      //TODO
  }

  @ReactMethod
  fun setUserID() {
      Log.d("InappstorySdkModule", "setUserID")
      //TODO
  }

  @ReactMethod
  fun getFavoritesCount() {
      Log.d("InappstorySdkModule", "getFavoritesCount")
      //TODO
  }

  @ReactMethod
  fun getFrameworkInfo() {
      Log.d("InappstorySdkModule", "getFrameworkInfo")
      //TODO
  }

  @ReactMethod
  fun getBuildNumber() {
      Log.d("InappstorySdkModule", "getBuildNumber")
      //TODO
  }

  @ReactMethod
  fun getVersion() {
      Log.d("InappstorySdkModule", "getVersion")
      //TODO
  }

  @ReactMethod
  fun setTimerGradientEnable() {
      Log.d("InappstorySdkModule", "setTimerGradientEnable")
      //TODO
  }

  @ReactMethod
  fun setSwipeToClose() {
      Log.d("InappstorySdkModule", "setSwipeToClose")
      //TODO
  }

  @ReactMethod
  fun setOverScrollToClose() {
      Log.d("InappstorySdkModule", "setOverScrollToClose")
      //TODO
  }

  @ReactMethod
  fun setTimerGradient() {
      Log.d("InappstorySdkModule", "setTimerGradient")
      //TODO
  }

  @ReactMethod
  fun setPlaceholderElementColor() {
      Log.d("InappstorySdkModule", "setPlaceholderElementColor")
      //TODO
  }

  @ReactMethod
  fun setPlaceholderBackgroundColor() {
      Log.d("InappstorySdkModule", "setPlaceholderBackgroundColor")
      //TODO
  }

  @ReactMethod
  fun setReaderBackgroundColor() {
      Log.d("InappstorySdkModule", "setReaderBackgroundColor")
      //TODO
  }

  @ReactMethod
  fun setReaderCornerRadius() {
      Log.d("InappstorySdkModule", "setReaderCornerRadius")
      //TODO
  }

  @ReactMethod
  fun setCoverQuality() {
      Log.d("InappstorySdkModule", "setCoverQuality")
      //TODO
  }

  @ReactMethod
  fun setShowCellTitle() {
      Log.d("InappstorySdkModule", "setShowCellTitle")
      //TODO
  }

  @ReactMethod
  fun setCellGradientEnabled() {
      Log.d("InappstorySdkModule", "setCellGradientEnabled")
      //TODO
  }

  @ReactMethod
  fun setCellGradientRadius() {
      Log.d("InappstorySdkModule", "setCellGradientRadius")
      //TODO
  }

  @ReactMethod
  fun setCellBorderColor() {
      Log.d("InappstorySdkModule", "setCellBorderColor")
      //TODO
  }

  @ReactMethod
  fun setGoodsCellImageBackgroundColor() {
      Log.d("InappstorySdkModule", "setGoodsCellImageBackgroundColor")
      //TODO
  }

  @ReactMethod
  fun setGoodsCellImageCornerRadius() {
      Log.d("InappstorySdkModule", "setGoodsCellImageCornerRadius")
      //TODO
  }

  @ReactMethod
  fun setGoodsCellMainTextColor() {
      Log.d("InappstorySdkModule", "setGoodsCellMainTextColor")
      //TODO
  }

  @ReactMethod
  fun setGoodsCellOldPriceTextColor() {
      Log.d("InappstorySdkModule", "setGoodsCellOldPriceTextColor")
      //TODO
  }

  @ReactMethod
  fun setPresentationStyle() {
      Log.d("InappstorySdkModule", "setPresentationStyle")
      //TODO
  }

  @ReactMethod
  fun setScrollStyle() {
      Log.d("InappstorySdkModule", "setScrollStyle")
      //TODO
  }

  @ReactMethod
  fun setCloseButtonPosition() {
      Log.d("InappstorySdkModule", "setCloseButtonPosition")
      //TODO
  }

  @ReactMethod
  fun closeReader() {
      Log.d("InappstorySdkModule", "closeReader")
      //TODO
  }

  @ReactMethod
  fun clearCache() {
      Log.d("InappstorySdkModule", "clearCache")
      //TODO
  }

  @ReactMethod
  fun showOnboardings() {
      Log.d("InappstorySdkModule", "showOnboardings")
      //TODO
  }

  @ReactMethod
  fun setLogging() {
      Log.d("InappstorySdkModule", "setLogging")
      //TODO
  }

  @ReactMethod
  fun useDeviceID() {
      Log.d("InappstorySdkModule", "useDeviceID")
      //TODO
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