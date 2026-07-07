package com.inappstory.reactnativesdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

import com.inappstory.sdk.AppearanceManager;
import com.inappstory.sdk.core.network.content.models.Image.QUALITY_HIGH
import com.inappstory.sdk.core.network.content.models.Image.QUALITY_MEDIUM
import android.util.Log

@ReactModule(name = AppearanceManagerModule.NAME)
class AppearanceManagerModule(private val reactContext: ReactApplicationContext) :
  NativeAppearanceManagerSpec(reactContext) {

  var appearanceManager: AppearanceManager? = null;

  init {
    appearanceManager = AppearanceManagerImpl.getAppearanceManager();
  }

  companion object {
    const val NAME = "NativeAppearanceManager"
  }

  override fun getName(): String {
    return NAME
  }

  override fun setHasLike(value: Boolean) {
    Log.d("AppearanceManagerModule", "setHasLike")
    this.appearanceManager?.csHasLike(value);
  }

  override fun setHasFavorites(value: Boolean) {
    Log.d("AppearanceManagerModule", "setHasFavorites")
    this.appearanceManager?.csHasFavorite(value);
  }

  override fun setHasShare(value: Boolean) {
    Log.d("AppearanceManagerModule", "setHasShare")
    this.appearanceManager?.csHasShare(value);
  }

  override fun setPresentationStyle(value: String) {
    Log.d("AppearanceManagerModule", "setPresentationStyle")
    when (value) {
      "zoom" -> this.appearanceManager?.csStoryReaderPresentationStyle(0)
      "fade" -> this.appearanceManager?.csStoryReaderPresentationStyle(1)
      "popup" -> this.appearanceManager?.csStoryReaderPresentationStyle(2)
      "disable" -> this.appearanceManager?.csStoryReaderPresentationStyle(-1)
    }
  }

  override fun setScrollStyle(value: String) {
    Log.d("AppearanceManagerModule", "setScrollStyle")
    when (value) {
      "depth" -> this.appearanceManager?.csStoryReaderAnimation(1)
      "cube" -> this.appearanceManager?.csStoryReaderAnimation(2)
      "cover" -> this.appearanceManager?.csStoryReaderAnimation(3)
      "flat" -> this.appearanceManager?.csStoryReaderAnimation(4)
    }
  }

  override fun setSwipeToClose(value: Boolean) {
    Log.d("AppearanceManagerModule", "setSwipeToClose")
    this.appearanceManager?.csCloseOnSwipe(value)
  }

  override fun setOverScrollToClose(value: Boolean) {
    Log.d("AppearanceManagerModule", "setOverScrollToClose")
    this.appearanceManager?.csCloseOnOverscroll(value)
  }

  override fun setCloseButtonPosition(value: String) {
    Log.d("AppearanceManagerModule", "setCloseButtonPosition")
    when (value) {
      "left" -> this.appearanceManager?.csClosePosition(1)
      "right" -> this.appearanceManager?.csClosePosition(2)
      "bottomLeft" -> this.appearanceManager?.csClosePosition(3)
      "bottomRight" -> this.appearanceManager?.csClosePosition(4)
    }
  }

  override fun setReaderCornerRadius(value: Double) {
    Log.d("AppearanceManagerModule", "setReaderCornerRadius")
    this.appearanceManager?.csReaderRadius(value.toInt());
  }

  override fun setTimerGradientEnable(value: Boolean) {
    Log.d("AppearanceManagerModule", "setTimerGradientEnable")
    this.appearanceManager?.csTimerGradientEnable(value)
  }

  override fun setCoverQuality(value: String) {
    Log.d("AppearanceManagerModule", "setCoverQuality")
    when (value) {
      "medium" -> appearanceManager?.csCoverQuality(QUALITY_MEDIUM)
      "high" -> appearanceManager?.csCoverQuality(QUALITY_HIGH)
      else -> appearanceManager?.csCoverQuality(QUALITY_MEDIUM)
    }
  }

  // ponytail: no Android SDK setter for reader background color; iOS-only. No-op for spec parity.
  override fun setReaderBackgroundColor(value: String) {
    Log.d("AppearanceManagerModule", "setReaderBackgroundColor (no-op on Android)")
  }

  override fun setLikeImage(image: String, selected: String) {
    this.appearanceManager?.csLikeIcon(getImageID(image));
  }

  override fun setDislikeImage(image: String, selected: String) {
    this.appearanceManager?.csDislikeIcon(getImageID(image));
  }

  override fun setFavoriteImage(image: String, selected: String) {
    this.appearanceManager?.csFavoriteIcon(getImageID(image));
  }

  override fun setShareImage(image: String, selected: String) {
    this.appearanceManager?.csShareIcon(getImageID(image));
  }

  override fun setSoundImage(image: String, selected: String) {
    this.appearanceManager?.csSoundIcon(getImageID(image));
  }

  override fun setCloseReaderImage(image: String) {
    this.appearanceManager?.csCloseIcon(getImageID(image));
  }

  override fun setRefreshImage(image: String) {
    this.appearanceManager?.csRefreshIcon(getImageID(image));
  }

  // ponytail: Android SDK has no separate goods refresh icon; iOS-only. No-op for spec parity.
  override fun setRefreshGoodsImage(image: String) {
    Log.d("AppearanceManagerModule", "setRefreshGoodsImage (no-op on Android)")
  }

  override fun setCloseGoodsImage(image: String) {
    this.appearanceManager?.csCloseIcon(getImageID(image));
  }

  private fun getImageID(imgName: String): Int {
    return reactContext.resources
      .getIdentifier(imgName, "drawable", reactContext.currentActivity?.packageName)
  }
}
