package com.inappstorysdk

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import android.util.Log
import android.os.Handler;
import android.os.Looper;

import com.inappstory.sdk.InAppStoryManager;
import com.inappstory.sdk.AppearanceManager;
import com.inappstory.sdk.ugc.UGCInAppStoryManager;

import com.inappstory.sdk.externalapi.InAppStoryAPI;
import com.inappstory.sdk.externalapi.StoryAPIData;
import com.inappstory.sdk.externalapi.StoryFavoriteItemAPIData;
import com.inappstory.sdk.externalapi.subscribers.InAppStoryAPIListSubscriber;
import com.inappstory.sdk.stories.ui.list.FavoriteImage;

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
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;


import com.facebook.react.bridge.Promise;
import com.inappstory.sdk.stories.ui.views.goodswidget.GetGoodsDataCallback;
import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsItemData;
import com.inappstory.sdk.stories.ui.views.goodswidget.IGoodsWidgetAppearance;
import com.facebook.react.modules.core.DeviceEventManagerModule
import androidx.recyclerview.widget.RecyclerView

import java.util.Locale
import android.view.View
import com.facebook.react.bridge.WritableMap;

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableNativeMap

import com.inappstory.sdk.stories.api.models.ImagePlaceholderValue;
import java.lang.reflect.Field;


/*
idgetEventName,
                     Map<String, String> widgetData,
                     int storyId,
                     String storyTitle,
                     String feed,
                     int slidesCount,
                     int slideIndex,
                     String tags) */
fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
    reactContext
    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    .emit(eventName, params)
}
class InappstorySdkModule(var reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "RNInAppStorySDKModule"
    var ias: InAppStoryManager? = null
    var appearanceManager: AppearanceManager? = null;
    var api:InAppStoryAPI?  = null;
    var favoritesApi:InAppStoryAPI?  = null;
    var TAG:String = "IAS_SDK_API";

    var stories: ArrayList<String>? = null;
    private var listenerCount = 0

    @ReactMethod
    fun getStories(feed: String) {
        Log.d("InappstorySdkModule", "getStories");
        this.api?.storyList?.load(
            feed,
            "feed",
            true,
            false,
            this.ias?.getTags()
        )
        //this.api.getStories()
    }
    @ReactMethod
    fun getFavoriteStories(feed: String) {
        Log.d("InappstorySdkModule", "getFavoriteStories");
        this.favoritesApi?.storyList?.load(
            feed,
            "favorites",
            true,
            true,
            this.ias?.getTags()
        )
    }
    @ReactMethod
    fun addListener(eventName: String) {
    if (listenerCount == 0) {
        // Set up any upstream listeners or background tasks as necessary
    }

    listenerCount += 1
    }

    @ReactMethod
    fun selectFavoriteStoryCellWith(storyID: String) {
        this.favoritesApi?.storyList?.openStoryReader(
            reactContext.currentActivity,
            "favorites",
            storyID.toInt(),
            this.appearanceManager
        );
    }
    @ReactMethod
    fun removeListeners(count: Int) {
    listenerCount -= count
    if (listenerCount == 0) {
        // Remove upstream listeners, stop unnecessary background tasks
    }
    }
  @ReactMethod
  fun initWith(apiKey: String, userID: String, sandbox: Boolean, sendStatistics: Boolean) {
      Log.d("InappstorySdkModule", "initWith")
      //this.ias = this.createInAppStoryManager(apiKey, userID)
      this.appearanceManager = AppearanceManager()
      this.api = InAppStoryAPI()
      this.favoritesApi = InAppStoryAPI()
      this.createManager(apiKey, userID, sandbox, sendStatistics, this.api as InAppStoryAPI)
      this.createManager(apiKey, userID, sandbox, sendStatistics, this.favoritesApi as InAppStoryAPI)
      this.subscribeLists(this.api as InAppStoryAPI, "feed")
      this.subscribeLists(this.favoritesApi as InAppStoryAPI, "favorites")
      setupListeners()
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
                val map:WritableMap = Arguments.createMap()

                sendEvent(reactContext,"showStory", map)
                Log.d("InappstorySdkModule","showStory story = $story, showstoryaction = $showStoryAction");
            }
        }
    )
      this.ias?.setShowSlideCallback(
        object : ShowSlideCallback {
            override fun showSlide(
                slide: SlideData?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"showSlide", map)
                Log.d("InappstorySdkModule","showSlide slide = $slide");
            }
        }
    )
      this.ias?.setCloseStoryCallback(
        object : CloseStoryCallback {
            override fun closeStory(
                slide: SlideData?,
                action: CloseReader?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"closeStory", map)
                Log.d("InappstorySdkModule","closeStory slide = $slide action= $action");

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
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"callToAction", map)
                Log.d("InappstorySdkModule","callToAction slide = $slide url = $url action= $action");
            }
        }
    )
      this.ias?.setFavoriteStoryCallback(
        object : FavoriteStoryCallback {
            override fun favoriteStory(
                slide: SlideData?,
                value: Boolean
            ) {
                val map:WritableMap = Arguments.createMap()
                map.putBoolean("favorite", value)
                map.putString("storyID", slide?.story?.id.toString())
                sendEvent(reactContext,"favoriteStory", map)
                Log.d("InappstorySdkModule","favoriteStory slide = $slide value = $value");
            }
        }
    )
      this.ias?.setLikeDislikeStoryCallback(
        object : LikeDislikeStoryCallback {
            override fun likeStory(
                slide: SlideData?,
                value: Boolean
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"setLike", map)
                Log.d("InappstorySdkModule","setLike slide = $slide value = $value");
            }

            override fun dislikeStory(
                slide: SlideData?,
                value: Boolean
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"setDislike", map)
                Log.d("InappstorySdkModule","setDislike slide = $slide value = $value");
            }
        }
    )
      this.ias?.setClickOnShareStoryCallback(
        object : ClickOnShareStoryCallback {
            override fun shareClick(
                slide: SlideData?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"clickOnShare", map)
                Log.d("InappstorySdkModule","clickOnShare slide = $slide");
            }
        }
    )
      this.ias?.setOnboardingLoadCallback(
        object : OnboardingLoadCallback {
            override fun onboardingLoad(count: Int, feed: String?) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"onboardingLoad", map)
                Log.d("InappstorySdkModule","onboardingLoad count = $count, feed = $feed");
            }
        }
    )
      this.ias?.setSingleLoadCallback(
        object : SingleLoadCallback {
            override fun singleLoad(story: StoryData?) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"singleLoad", map)
                Log.d("InappstorySdkModule","singleLoad story = $story");
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
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"storyWidget", map)
                Log.d("InappstorySdkModule","storyWidget story = $slideData, widgetEventName = $widgetEventName, widgetData = $widgetData");
            }
        }
    )
      this.ias?.setGameReaderCallback(
        object : GameReaderCallback {
            override fun startGame(
                gameStoryData: GameStoryData?,
                id: String?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"startGame", map)
                Log.d("InappstorySdkModule","startGame gameStoryData = $gameStoryData, id = $id");
            }

            override fun finishGame(
                gameStoryData: GameStoryData?,
                result: String?,
                id: String?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"finishGame", map)
                Log.d("InappstorySdkModule","startGame gameStoryData = $gameStoryData, result = $result, id = $id");
            }

            override fun closeGame(
                gameStoryData: GameStoryData?,
                id: String?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"closeGame", map)
                Log.d("InappstorySdkModule","closeGame gameStoryData = $gameStoryData, id = $id");
            }
            override fun gameLoadError(
                gameStoryData: GameStoryData?,
                id: String?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"gameLoadError", map)
                Log.d("InappstorySdkModule","gameLoadError gameStoryData = $gameStoryData, id = $id");
            }
            override fun gameOpenError(
              gameStoryData: GameStoryData?,
              id: String?
          ) {
            val map:WritableMap = Arguments.createMap()
            sendEvent(reactContext,"gameOpenError", map)
            Log.d("InappstorySdkModule","gameOpenError gameStoryData = $gameStoryData, id = $id");
          }
            override fun eventGame(
                gameStoryData: GameStoryData?,
                id: String?,
                id2: String?,
                id3: String?
            ) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"eventGame", map)
                Log.d("InappstorySdkModule","eventGame gameStoryData = $gameStoryData, id = $id , id2 = $id2 , id3 = $id3");
            }
        }
    )
      this.ias?.setErrorCallback(
        object : ErrorCallback {
            override fun loadListError(feed: String?) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"loadListError", map)
                Log.d("InappstorySdkModule","loadListError feed = $feed");
            }

            override fun loadOnboardingError(feed: String?) {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"loadOnboardingError", map)
                Log.d("InappstorySdkModule","loadOnboardingError feed = $feed");
            }

            override fun loadSingleError() {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"loadSingleError", map)
                Log.d("InappstorySdkModule","loadSingleError");
            }

            override fun cacheError() {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"cacheError", map)
                Log.d("InappstorySdkModule","cacheError");
            }

            override fun readerError() {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"readerError", map)
                Log.d("InappstorySdkModule","readerError");
            }

            override fun emptyLinkError() {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"emptyLinkError", map)
                Log.d("InappstorySdkModule","emptyLinkError");
            }

            override fun sessionError() {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"sessionError", map)
                Log.d("InappstorySdkModule","sessionError");
            }

            override fun noConnection() {
                val map:WritableMap = Arguments.createMap()
                sendEvent(reactContext,"noConnection", map)
                Log.d("InappstorySdkModule","noConnection");
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
  fun setPlaceholders(placeholders: ReadableMap) {
      Log.d("InappstorySdkModule", "setPlaceholders $placeholders")
      var nativeMap:ReadableNativeMap = placeholders as ReadableNativeMap;
      this.ias?.setPlaceholders(nativeMap.toHashMap() as Map<String, String>)
  }

  @ReactMethod
  fun setImagesPlaceholders(imagePlaceholders: ReadableArray) {
      Log.d("InappstorySdkModule", "setImagesPlaceholders")
      var nativeMap:ReadableNativeMap = imagePlaceholders as ReadableNativeMap;
      var imageMap: Map<String, ImagePlaceholderValue> = nativeMap.toHashMap().mapValues { ImagePlaceholderValue.createByUrl(it.value as String) }
      this.ias?.setImagePlaceholders(imageMap)
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
    fun showOnboardings(feed: String, limit:Int, tags: ReadableArray, promise: Promise) {
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
    fun setVisibleWith(storyIDs: ReadableArray) {
        Log.d("InappstorySdkModule", "setVisibleWith")
        val stringIds: ArrayList<String> = storyIDs.toArrayList() as ArrayList<String>
        var ids: List<Int> = stringIds.map{it.toInt()}
        Log.d("InappstorySdkModule", "ids: $ids")
        this.api?.storyList?.updateVisiblePreviews(ids, "feed")
    }
    @ReactMethod
    fun selectStoryCellWith(storyID: String) {
        Log.d("InappstorySdkModule", "selectStoryCellWith")
        this.api?.storyList?.openStoryReader(
            reactContext.currentActivity,
            "feed",
            storyID.toInt(),
            this.appearanceManager
        );
    }
    @ReactMethod
    fun showEditor() {
        this.appearanceManager?.csHasUGC(true)
        UGCInAppStoryManager.openEditor(reactContext)
        //promise.resolve(true)
    }
    private fun createManager(apiKey: String, userID: String, sandbox: Boolean,sendStatistic: Boolean, inAppStoryAPI: InAppStoryAPI) {
        this.ias = inAppStoryAPI.inAppStoryManager.create(
            apiKey,
            userID,
            null,
            null,
            null,
            null,
            null,
            null,
            true,
            null,
            sandbox, 
        )
        this.ias?.let {
            val f1: Field = it.javaClass.getDeclaredField("sendStatistic")
            f1.isAccessible = true
            f1.set(it, sendStatistic)
        }
    }
    fun subscribeLists(inAppStoryAPI: InAppStoryAPI, feed: String) {
        inAppStoryAPI.addSubscriber(object : InAppStoryAPIListSubscriber(feed) {
            override fun updateFavoriteItemData(favorites: List<StoryFavoriteItemAPIData>) {
                Log.e(TAG, "$feed updateFavoriteItemData: $favorites")
            }

            override fun updateStoryData(story: StoryAPIData) {
                Log.e(TAG, "$feed updateStoryData: $story")
                var storyData = Arguments.makeNativeMap(
                        mutableMapOf(
                            "storyID" to story.id,
                            //"storyData" to item.storyData,
                            "title" to story.title,
                            "coverImagePath" to story.imageFilePath,
                            "coverVideoPath" to story.videoFilePath,
                            "backgroundColor" to story.backgroundColor,
                            "titleColor" to story.titleColor,
                            "opened" to story.opened,
                            "hasAudio" to false, //FIXME
                            "list" to feed,
                            "feed" to story.storyData.feed,
                        ) as Map<String, Any>)
                    Log.e(TAG, "Item = $story")
                sendEvent(reactContext,"storyUpdate", storyData)
            }

            override fun updateStoriesData(stories: List<StoryAPIData>) {
                Log.e(TAG, "$feed updateStoriesData: $stories")
                val storiesList = ArrayList<WritableNativeMap>()
                val iterator = stories.listIterator()
                for (item in iterator) {
                    var storyData = Arguments.makeNativeMap(
                        mutableMapOf(
                            "storyID" to item.id,
                            //"storyData" to item.storyData,
                            "title" to item.title,
                            "coverImagePath" to item.imageFilePath,
                            "coverVideoPath" to item.videoFilePath,
                            "backgroundColor" to item.backgroundColor,
                            "titleColor" to item.titleColor,
                            "opened" to item.opened,
                            "hasAudio" to false, //FIXME
                            "list" to feed,
                            "feed" to item.storyData.feed,
                        ) as Map<String, Any>)
                    Log.e(TAG, "Item = $item")
                    
                    storiesList.add(storyData)
                }

               /* val action = 

                val actionArray = Arguments.makeNativeArray(listOf(action))

                val arguments = Arguments.createMap().apply {
                    putString("path", "general/authentication")
                    putArray("actions",actionArray)
                }
                val array = Array(stories.size) { index ->
                    stories[index]
                }*/
                val map:WritableMap = Arguments.createMap()
                map.putArray("stories", Arguments.makeNativeArray(storiesList));
                map.putString("feed", "default")
                map.putString("list", feed)
                //map.putString("key1", "Value1");
                sendEvent(reactContext,"storyListUpdate", map)
                //stories.clear()
                //stories.addAll(stories)
                /*Handler(Looper.getMainLooper()).post {
                    inAppStoryAPI.storyList.updateVisiblePreviews(ids, uniqueId1)
                    inAppStoryAPI.storyList.showFavoriteItem(uniqueId1)
                }*/
            }

            override fun storyIsOpened(storyId: Int) {
                Log.e(TAG, "$feed storyIsOpened: $storyId")
            }

            override fun readerIsClosed() {
                Log.e(TAG, "$feed readerIsClosed")
            }

            override fun readerIsOpened() {
                Log.e(TAG, "$feed readerIsOpened")
            }
        })
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



appearanceManager.csIsDraggable(true);


appearanceManager.csCloseIcon(settings.closeIcon);
appearanceManager.csDislikeIcon(settings.dislikeIcon);
appearanceManager.csLikeIcon(settings.likeIcon);
appearanceManager.csRefreshIcon(settings.refreshIcon);
appearanceManager.csFavoriteIcon(settings.favoriteIcon);
appearanceManager.csShareIcon(settings.shareIcon);
appearanceManager.csSoundIcon(settings.soundIcon);
  :*/