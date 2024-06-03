package com.inappstorysdk

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import android.util.Log

import com.inappstory.sdk.InAppStoryManager;
import com.inappstory.sdk.AppearanceManager;
import com.inappstory.sdk.ugc.UGCInAppStoryManager;

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

import com.inappstory.sdk.stories.ui.views.goodswidget.ICustomGoodsItem;
import com.inappstory.sdk.stories.ui.views.goodswidget.ICustomGoodsWidget;

import com.facebook.react.bridge.ReadableArray;

import com.facebook.react.bridge.Promise;
import com.inappstory.sdk.stories.ui.views.goodswidget.GetGoodsDataCallback;
import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsItemData;
import com.inappstory.sdk.stories.ui.views.goodswidget.IGoodsWidgetAppearance;
import com.facebook.react.modules.core.DeviceEventManagerModule
import androidx.recyclerview.widget.RecyclerView

import java.util.Locale
import android.view.View
import com.facebook.react.bridge.WritableMap;

import com.inappstory.sdk.externalapi.InAppStoryAPI;

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
  var api:InAppStoryAPI?  = null;
    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, params)
    }

    private var listenerCount = 0

    @ReactMethod
    fun addListener(eventName: String) {
    if (listenerCount == 0) {
        // Set up any upstream listeners or background tasks as necessary
    }

    listenerCount += 1
    }

    @ReactMethod
    fun removeListeners(count: Int) {
    listenerCount -= count
    if (listenerCount == 0) {
        // Remove upstream listeners, stop unnecessary background tasks
    }
    }
  @ReactMethod
  fun initWith(apiKey: String, userID: String) {
      Log.d("InappstorySdkModule", "initWith")
      this.ias = this.createInAppStoryManager(apiKey, userID)
      this.appearanceManager = AppearanceManager()
      this.api = InAppStoryAPI().init(reactContext.getApplicationContext());
  }

  @ReactMethod
  fun setUserID(userId: String) {
      Log.d("InappstorySdkModule", "setUserID")
      this.ias?.setUserId(userId)
  }
  @ReactMethod
  fun setLang(lang: String) {
      Log.d("InappstorySdkModule", "setLang")
      this.ias?.setLang(Locale.forLanguageTag("en-US"))
    }

  fun setupListeners() {
    //Goods widget
    this.appearanceManager?.csCustomGoodsWidget(object : ICustomGoodsWidget {
        override fun getWidgetView(context: Context): View? {
            return null;
        }

        override fun getItem(): ICustomGoodsItem? {
            return null;
        }

        override fun getWidgetAppearance(): IGoodsWidgetAppearance? {
            return null;
        }

        override fun getDecoration(): RecyclerView.ItemDecoration? {
            return null;
        }

        public override fun getSkus(skus: ArrayList<String>, callback: GetGoodsDataCallback) {
            val goodsItemData: ArrayList<GoodsItemData> = ArrayList<GoodsItemData>()
            for (sku: String in skus) {
                val data = GoodsItemData(
                    sku,
                    "title_$sku",
                    "desc_$sku",
                    "https://media.istockphoto.com/photos/big-and-small-picture-id172759822",
                    "10",
                    "20",
                    sku
                )
                goodsItemData.add(data)
            }
            callback.onSuccess(goodsItemData)
        }

        override fun onItemClick(
            goodsItemView: View,
            goodsItemData: GoodsItemData,
            callback: GetGoodsDataCallback
        ) {
            return;
        }
    });
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
  fun showGame(gameID: String, promise: Promise) {
      Log.d("InappstorySdkModule", "showGame")
      try {
        this.ias?.openGame(gameID, getCurrentActivity() as Context)
        promise.resolve(gameID)
      } catch (e: Throwable) {
        promise.reject("showGame error", e)
      }
  }

  @ReactMethod
  fun showSingle(storyID: String, promise: Promise) {
      Log.d("InappstorySdkModule", "showSingle")
      try {
        this.ias?.showStory(storyID, getCurrentActivity(), this.appearanceManager)
        promise.resolve(true)
      } catch (e: Throwable) {
        promise.reject("showGame error", e)
      }
  }

  @ReactMethod
  fun setTags(tags: ReadableArray) {
    Log.d("InappstorySdkModule", "setTags")
    val list: ArrayList<String> = tags.toArrayList() as ArrayList<String>
    this.ias?.setTags(list)
  }
  
  @ReactMethod
  fun setPlaceholders(placeholders: ReadableArray) {
      Log.d("InappstorySdkModule", "setPlaceholders")
      //FIXME: this.ias?.setPlaceholders(placeholders)
  }

  @ReactMethod
  fun setImagesPlaceholders(imagePlaceholders: ReadableArray) {
      Log.d("InappstorySdkModule", "setImagesPlaceholders")
      //FIXME: this.ias?.setImagePlaceholders(imagePlaceholders)
  }

  @ReactMethod
  fun changeSound(value: Boolean) {
      Log.d("InappstorySdkModule", "changeSound")
      this.ias?.soundOn(value)
  }

  @ReactMethod
  fun setHasLike(value: Boolean) {
      Log.d("InappstorySdkModule", "setHasLike")
      this.appearanceManager?.csHasLike(value);
  }

  @ReactMethod
  fun setHasFavorites(value: Boolean) {
      Log.d("InappstorySdkModule", "setHasFavorites")
      this.appearanceManager?.csHasFavorite(value);
  }

  @ReactMethod
  fun setHasShare(value: Boolean) {
      Log.d("InappstorySdkModule", "setHasShare")
      this.appearanceManager?.csHasShare(value);
  }

  @ReactMethod
  fun setPresentationStyle(style: String) {
      Log.d("InappstorySdkModule", "setPresentationStyle")
      if (style == "zoom") {
        this.appearanceManager?.csStoryReaderPresentationStyle(0)
      }
      if (style == "fade") {
        this.appearanceManager?.csStoryReaderPresentationStyle(1)
      }
      if (style == "popup") {
        this.appearanceManager?.csStoryReaderPresentationStyle(2)
      }
      if (style == "disable") {
        this.appearanceManager?.csStoryReaderPresentationStyle(-1)
      }
  }

  @ReactMethod
  fun setScrollStyle(scrollStyle: String) {
      Log.d("InappstorySdkModule", "setScrollStyle")
      if (scrollStyle == "depth") {
        this.appearanceManager?.csStoryReaderAnimation(1)
      }
      if (scrollStyle == "cube") {
        this.appearanceManager?.csStoryReaderAnimation(2)
      }
      if (scrollStyle == "cover") {
        this.appearanceManager?.csStoryReaderAnimation(3)
      }
      if (scrollStyle == "flat") {
        this.appearanceManager?.csStoryReaderAnimation(4)
      }
  }

  @ReactMethod
  fun setSwipeToClose(value: Boolean) {
      Log.d("InappstorySdkModule", "setSwipeToClose")
      this.appearanceManager?.csCloseOnSwipe(value)
  }

  @ReactMethod
  fun setOverScrollToClose(value: Boolean) {
      Log.d("InappstorySdkModule", "setOverScrollToClose")
      this.appearanceManager?.csCloseOnOverscroll(value)
  }

  @ReactMethod
  fun setCloseButtonPosition(value: String) {
      Log.d("InappstorySdkModule", "setCloseButtonPosition")
      if (value == "left") {
        this.appearanceManager?.csClosePosition(1)
      }
      if (value == "right") {
        this.appearanceManager?.csClosePosition(2)
      }
      if (value == "bottomLeft") {
        this.appearanceManager?.csClosePosition(3)
      }
      if (value == "bottomRight") {
        this.appearanceManager?.csClosePosition(4)
      }
      
  }

  @ReactMethod
  fun setReaderCornerRadius(radius: Int) {
      Log.d("InappstorySdkModule", "setReaderCornerRadius")
      this.appearanceManager?.csReaderRadius(radius);
  }

  @ReactMethod
  fun setReaderBackgroundColor(color: String) {
      Log.d("InappstorySdkModule", "setReaderBackgroundColor")
      //TODO
  }

  @ReactMethod
  fun setTimerGradientEnable(value: Boolean) {
      Log.d("InappstorySdkModule", "setTimerGradientEnable")
      this.appearanceManager?.csTimerGradientEnable(value)
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
    @ReactMethod
    fun showOnboardings(feed: String, tags: ReadableArray, promise: Promise) {
        var limit: Int? = null;
        var success: Boolean = true;
        var tags: List<String>? = null; //FIXME
        Log.d("InappstorySdkModule", "showOnboardings")
        if (limit != null) {
            this.ias?.showOnboardingStories(limit, feed, tags, reactContext.currentActivity, this.appearanceManager)
        } else {
            this.ias?.showOnboardingStories(feed, tags, reactContext.currentActivity, this.appearanceManager)
        }
        promise.resolve(feed)
    }
    @ReactMethod
    fun showEditor() {
        this.appearanceManager?.csHasUGC(true)
        UGCInAppStoryManager.openEditor(reactContext)
        //promise.resolve(true)
    }
    fun subscribeLists(inAppStoryAPI: InAppStoryAPI) {
/*
        inAppStoryAPI.addSubscriber(new InAppStoryAPIListSubscriber(uniqueId1) {
            @Override
            public void updateFavoriteItemData(List<StoryFavoriteItemAPIData> favorites) {
                Log.e(TAG, getUniqueId() + " updateFavoriteItemData: " + favorites);
            }

            @Override
            public void updateStoryData(StoryAPIData story) {
                Log.e(TAG, getUniqueId() + " updateStoryData: " + story);
            }

            @Override
            public void updateStoriesData(List<StoryAPIData> stories) {
                Log.e(TAG, getUniqueId() + " updateStoriesData: " + stories);
                MainActivity.this.stories.clear();
                MainActivity.this.stories.addAll(stories);
                List<Integer> ids = new ArrayList<>();
                for (StoryAPIData storyAPIData : stories) {
                    ids.add(storyAPIData.id);
                }
                new Handler(Looper.getMainLooper()).post(new Runnable() {
                    @Override
                    public void run() {
                        inAppStoryAPI.storyList.updateVisiblePreviews(ids, getUniqueId());
                        inAppStoryAPI.storyList.showFavoriteItem(getUniqueId());
                    }
                });

            }

            @Override
            public void storyIsOpened(int storyId) {
                Log.e(TAG, getUniqueId() + " storyIsOpened: " + storyId);
            }

            @Override
            public void readerIsClosed() {
                Log.e(TAG, getUniqueId() + " readerIsClosed");
            }

            @Override
            public void readerIsOpened() {
                Log.e(TAG, getUniqueId() + " readerIsOpened");
            }
        });
        inAppStoryAPI.storyList.load(
                "extrafeed",
                uniqueId1,
                true,
                false,
                new ArrayList<>()
        );
         */
    }
  fun createInAppStoryManager(
    apiKey: String,
    userId: String
  ): InAppStoryManager {
      Log.d("InAppStoryManager", "createInAppStoryManager");
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
  :*/