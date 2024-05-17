package com.inappstorysdk

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import android.util.Log

import com.inappstory.sdk.InAppStoryManager;
import com.inappstory.sdk.AppearanceManager;
import com.inappstory.sdk.stories.outercallbacks.common.errors.ErrorCallback;
import com.inappstory.sdk.stories.outercallbacks.common.gamereader.GameReaderCallback;
import com.inappstory.sdk.game.reader.GameStoryData;
import com.inappstory.sdk.stories.outercallbacks.common.reader.StoryWidgetCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.SlideData;
import com.inappstory.sdk.stories.outercallbacks.common.single.SingleLoadCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.StoryData;
import com.inappstory.sdk.stories.outercallbacks.common.onboarding.OnboardingLoadCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.ClickOnShareStoryCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.LikeDislikeStoryCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.FavoriteStoryCallback;

import com.inappstory.sdk.stories.outercallbacks.common.reader.CallToActionCallback;

import com.inappstory.sdk.stories.outercallbacks.common.reader.ClickAction;
import android.content.Context;
import com.inappstory.sdk.stories.outercallbacks.common.reader.CloseStoryCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowStoryCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowSlideCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.ShowStoryAction;
import com.inappstory.sdk.stories.outercallbacks.common.reader.CloseReader;

/*
idgetEventName,
                     Map<String, String> widgetData,
                     int storyId,
                     String storyTitle,
                     String feed,
                     int slidesCount,
                     int slideIndex,
                     String tags) */

class InappstorySdkModule(var reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNInAppStorySDKModule"
  var ias: InAppStoryManager? = null
  var appearanceManager: AppearanceManager? = null;

  @ReactMethod
  fun initWith(apiKey: String, userID: String) {
      Log.d("InappstorySdkModule", "initWith")
      InAppStoryManager.initSDK(reactContext.getApplicationContext())
      this.ias = this.createInAppStoryManager(apiKey, userID)
      this.appearanceManager = AppearanceManager()
  }

  fun setupListeners() {
    this.ias?.setShowStoryCallback(
        object : ShowStoryCallback {
            override fun showStory(
                story: StoryData?,
                showStoryAction: ShowStoryAction?
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setShowSlideCallback(
        object : ShowSlideCallback {
            override fun showSlide(
                slide: SlideData?
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setCloseStoryCallback(
        object : CloseStoryCallback {
            override fun closeStory(
                slide: SlideData?,
                action: CloseReader?
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setCallToActionCallback(
        object : CallToActionCallback {
            override fun callToAction(
                context: Context?, //Here context of story reader or context of storiesList if it calls from it's deeplinks
                slide: SlideData?,
                url: String?,
                action: ClickAction
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setFavoriteStoryCallback(
        object : FavoriteStoryCallback {
            override fun favoriteStory(
                slide: SlideData?,
                value: Boolean
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setLikeDislikeStoryCallback(
        object : LikeDislikeStoryCallback {
            override fun likeStory(
                slide: SlideData?,
                value: Boolean
            ) {
                TODO("Not yet implemented")
            }

            override fun dislikeStory(
                slide: SlideData?,
                value: Boolean
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setClickOnShareStoryCallback(
        object : ClickOnShareStoryCallback {
            override fun shareClick(
                slide: SlideData?
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setOnboardingLoadCallback(
        object : OnboardingLoadCallback {
            override fun onboardingLoad(count: Int, feed: String?) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setSingleLoadCallback(
        object : SingleLoadCallback {
            override fun singleLoad(story: StoryData?) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setStoryWidgetCallback(
        object : StoryWidgetCallback {
            override fun widgetEvent(
                slideData: SlideData?,
                widgetEventName: String?,
                widgetData: Map<String, String?>?,
                //feed: String?
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setGameReaderCallback(
        object : GameReaderCallback {
            override fun startGame(
                gameStoryData: GameStoryData?,
                id: String?
            ) {
                TODO("Not yet implemented")
            }

            override fun finishGame(
                gameStoryData: GameStoryData?,
                result: String?,
                id: String?
            ) {
                TODO("Not yet implemented")
            }

            override fun closeGame(
                gameStoryData: GameStoryData?,
                id: String?
            ) {
                TODO("Not yet implemented")
            }
            override fun gameLoadError(
                gameStoryData: GameStoryData?,
                id: String?
            ) {
                TODO("Not yet implemented")
            }
            override fun gameOpenError(
              gameStoryData: GameStoryData?,
              id: String?
          ) {
              TODO("Not yet implemented")
          }
            override fun eventGame(
                gameStoryData: GameStoryData?,
                id: String?,
                id2: String?,
                id3: String?
            ) {
                TODO("Not yet implemented")
            }
        }
    )
      this.ias?.setErrorCallback(
        object : ErrorCallback {
            override fun loadListError(feed: String?) {
                TODO("Not yet implemented")
            }

            override fun loadOnboardingError(feed: String?) {
                TODO("Not yet implemented")
            }

            override fun loadSingleError() {
                TODO("Not yet implemented")
            }

            override fun cacheError() {
                TODO("Not yet implemented")
            }

            override fun readerError() {
                TODO("Not yet implemented")
            }

            override fun emptyLinkError() {
                TODO("Not yet implemented")
            }

            override fun sessionError() {
                TODO("Not yet implemented")
            }

            override fun noConnection() {
                TODO("Not yet implemented")
            }

        }
    )
  }

  @ReactMethod
  fun showGame(gameID: String) {
      Log.d("InappstorySdkModule", "showGame")
      this.ias?.openGame(gameID, reactContext.getApplicationContext())
  }

  @ReactMethod
  fun showSingle(storyID: String) {
      Log.d("InappstorySdkModule", "showSingle")
      this.ias?.showStory(storyID, getCurrentActivity(), this.appearanceManager)
  }
/*
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
  fun setTags(tags: String) {
      Log.d("InappstorySdkModule", "setTags")
      //this.ias?.setTags(tags)
  }

  @ReactMethod
  fun addTags() {
      Log.d("InappstorySdkModule", "addTags")
      //this.ias?.addTags(tags)
  }

  @ReactMethod
  fun removeTags() {
      Log.d("InappstorySdkModule", "removeTags")
      ///this.ias?.removeTags(tags)
  }

  @ReactMethod
  fun setPlaceholders() {
      Log.d("InappstorySdkModule", "setPlaceholders")
      //this.ias?.setPlaceholders(tags)
  }

  @ReactMethod
  fun setImagesPlaceholders() {
      Log.d("InappstorySdkModule", "setImagesPlaceholders")
      //this.ias?.setImagePlaceholders(tags)
  }

  @ReactMethod
  fun changeSound(value: Boolean) {
      Log.d("InappstorySdkModule", "changeSound")
      this.ias?.soundOn(value)
  }

  @ReactMethod
  fun setHasLike() {
      Log.d("InappstorySdkModule", "setHasLike")
      //appearanceManager.csHasLike(settings.hasLike);
  }

  @ReactMethod
  fun setHasFavorites() {
      Log.d("InappstorySdkModule", "setHasFavorites")
      //appearanceManager.csHasFavorite(settings.hasFavorite);
  }

  @ReactMethod
  fun setHasShare() {
      Log.d("InappstorySdkModule", "setHasShare")
      //appearanceManager.csHasShare(settings.hasShare);
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
      this.ias?.clearCache()
  }

  @ReactMethod
  fun showOnboardings(feed: String) {
      Log.d("InappstorySdkModule", "showOnboardings")
      this.ias?.showOnboardingStories(feed, reactContext.getApplicationContext(), this.appearanceManager)
  }

  @ReactMethod
  fun setLogging(value: Boolean) {
      Log.d("InappstorySdkModule", "setLogging")

    //this.ias.enableLogging = value
  }

  @ReactMethod
  fun useDeviceID() {
      Log.d("InappstorySdkModule", "useDeviceID")
      //TODO
  }
*/
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

/*
appearanceManager.csClosePosition(settings.closePosition);
appearanceManager.csCloseOnOverscroll(settings.closeOnOverscroll);
appearanceManager.csCloseOnSwipe(settings.closeOnSwipe);
appearanceManager.csIsDraggable(true);
appearanceManager.csTimerGradientEnable(settings.timerGradientEnable);
appearanceManager.csStoryReaderAnimation(settings.readerAnimation);
appearanceManager.csCloseIcon(settings.closeIcon);
appearanceManager.csDislikeIcon(settings.dislikeIcon);
appearanceManager.csLikeIcon(settings.likeIcon);
appearanceManager.csRefreshIcon(settings.refreshIcon);
appearanceManager.csFavoriteIcon(settings.favoriteIcon);
appearanceManager.csShareIcon(settings.shareIcon);
appearanceManager.csSoundIcon(settings.soundIcon);
  */