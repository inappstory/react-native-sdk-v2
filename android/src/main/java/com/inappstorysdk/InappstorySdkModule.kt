package com.inappstorysdk

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import android.util.Log
import android.os.Handler;
import android.os.Looper;
import android.app.Application

import com.inappstory.sdk.InAppStoryManager;
import com.inappstory.sdk.AppearanceManager;

import com.inappstory.sdk.externalapi.ExternalPlatforms
import com.inappstory.sdk.externalapi.InAppStoryAPI;
import com.inappstory.sdk.externalapi.StoryAPIData;
import com.inappstory.sdk.externalapi.StoryFavoriteItemAPIData;
import com.inappstory.sdk.externalapi.subscribers.InAppStoryAPIListSubscriber;
import com.inappstory.sdk.externalapi.storylist.IASStoryListSessionData;
import com.inappstory.sdk.stories.ui.list.StoryFavoriteImage;
import com.inappstory.sdk.core.api.IASDataSettingsHolder;
import com.inappstory.sdk.lrudiskcache.CacheSize

import com.inappstory.sdk.stories.outercallbacks.common.errors.ErrorCallback;
import com.inappstory.sdk.stories.outercallbacks.common.gamereader.GameReaderCallback;
import com.inappstory.sdk.game.reader.GameStoryData;

import com.inappstory.sdk.stories.outercallbacks.common.reader.StoryWidgetCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.SlideData;
import com.inappstory.sdk.inappmessage.InAppMessageData;
import com.inappstory.sdk.inappmessage.InAppMessageContainerProvider
import com.inappstory.sdk.inappmessage.InAppMessageContainerSettings
import com.inappstory.sdk.inappmessage.InAppMessageType
import com.inappstory.sdk.inappmessage.InAppMessageViewController
import com.inappstory.sdk.inappmessage.domain.reader.IAMViewController
import com.inappstory.sdk.stories.outercallbacks.common.single.SingleLoadCallback;
import com.inappstory.sdk.stories.outercallbacks.common.reader.StoryData;
import com.inappstory.sdk.stories.outercallbacks.common.reader.ContentData;
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
import com.inappstory.sdk.CancellationToken
import com.inappstory.sdk.inappmessage.InAppMessagePreloadSettings
import com.inappstory.sdk.inappmessage.InAppMessageLoadCallback
import com.inappstory.sdk.inappmessage.InAppMessageOpenSettings
import com.inappstory.sdk.inappmessage.InAppMessageScreenActions
import com.inappstory.sdk.inappmessage.ShowInAppMessageCallback
import com.inappstory.sdk.inappmessage.CloseInAppMessageCallback
import androidx.fragment.app.FragmentActivity

import com.facebook.react.bridge.Promise;
import com.inappstory.sdk.stories.ui.views.goodswidget.GetGoodsDataCallback;
import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsItemData;
import com.inappstory.sdk.stories.ui.views.goodswidget.IGoodsWidgetAppearance;
import com.facebook.react.modules.core.DeviceEventManagerModule
import androidx.recyclerview.widget.RecyclerView

import java.util.Locale
import android.view.View
import com.facebook.react.bridge.WritableMap;
import android.app.Activity
import android.view.ViewGroup
import android.widget.FrameLayout

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableNativeMap

import com.inappstory.sdk.stories.api.models.ImagePlaceholderValue;
import java.lang.reflect.Field;
import com.inappstory.sdk.UseManagerInstanceCallback;
import com.inappstory.sdk.stories.api.models.CachedSessionData;
import com.inappstory.sdk.core.network.content.models.Image.QUALITY_HIGH
import com.inappstory.sdk.core.network.content.models.Image.QUALITY_MEDIUM

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
  Log.d("InappstorySdkModule", "sendEvent: " + eventName);
  reactContext
    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    .emit(eventName, params)
}

class InAppStory {
  companion object {
    fun initSDK(application: Application) {
      InAppStoryManager.initSDK(application, false)
    }
  }
}

class InappstorySdkModule(var reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "RNInAppStorySDKModule"
  var ias: InAppStoryManager? = null
  var appearanceManager: AppearanceManager = AppearanceManager();
  var api: InAppStoryAPI = InAppStoryAPI();
  var favoritesApi: InAppStoryAPI? = null;
  var TAG: String = "IAS_SDK_API";

  // Last favorites set seen via updateFavoriteItemData. Used to avoid reloading
  // (and looping) when the SDK re-reports the same set.
  private var lastFavoriteIds: Set<Int>? = null

  var stories: ArrayList<String>? = null;
  var goodsCache: ArrayList<GoodsItemData> = ArrayList<GoodsItemData>()
  private var listenerCount = 0

  val cancellationTokenMap = mutableMapOf<String, CancellationToken?>()

  @ReactMethod
  fun getStories(feed: String, uniqueId: String) {
    Log.d("InappstorySdkModule", "getStories for feed: " + feed + ", uniqueId: " + uniqueId);
    this.api?.storyList?.load(
      feed,
      uniqueId,
      true,
      false,
      this.ias?.getTags()
    )
    // Also load the favorites list so the favorites cell gets real cover
    // images. updateFavoriteItemData only reports IDs (imageFilePath=null);
    // covers arrive via the favorites subscriber's updateStoryData. Mirrors iOS,
    // where the favorite stories list is loaded for the main screen too.
    this.favoritesApi?.storyList?.load(
      feed,
      "favorites",
      true,
      true,
      this.ias?.getTags()
    )
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
  fun onFavoriteCell() {
    val payload: WritableMap = Arguments.createMap()
    sendEvent(reactContext, "favoriteCellDidSelect", payload)
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
  fun initWith(
    apiKey: String,
    userID: String,
    userIdSign: String?,
    sandbox: Boolean,
    sendStatistics: Boolean
  ) {
    Log.d("InappstorySdkModule", "initWith")
    // this.ias = this.createInAppStoryManager(apiKey, userID)
    // this.appearanceManager = AppearanceManager()
    // AppearanceManager.setCommonInstance(appearanceManager);
    // this.api = InAppStoryAPI()
    // this.favoritesApi = InAppStoryAPI()
    // this.createManager(
    //   apiKey,
    //   userID,
    //   userIdSign,
    //   sandbox,
    //   sendStatistics,
    //   this.favoritesApi as InAppStoryAPI
    // )
    // Favorites must use a SEPARATE api instance (like iOS' favoriteStoriesAPI).
    // Sharing one api with the main feed makes the two list loads fight over the
    // same storyList, so favorites-only covers never download.
    this.favoritesApi = InAppStoryAPI()
    this.createManager(
      apiKey,
      userID,
      userIdSign,
      sandbox,
      sendStatistics,
      this.api as InAppStoryAPI
    )
    //this.subscribeLists(this.api as InAppStoryAPI, "feed")
    this.subscribeLists(this.favoritesApi as InAppStoryAPI, "favorites")
    setupListeners()
  }

  @ReactMethod
  fun setUserID(userId: String, userIdSign: String?) {
    Log.d("InappstorySdkModule", "setUserID")
    this.ias?.setUserId(userId, userIdSign)
  }

  @ReactMethod
  fun closeReader() {
    //this.ias?.closeStoryReader()
    InAppStoryManager.closeStoryReader(true) {}
  }

  @ReactMethod
  fun setLang(lang: String) {
    Log.d("InappstorySdkModule", "setLang")
    this.ias?.setLang(Locale.forLanguageTag("en-US"))
  }

  fun setupListeners() {

    val that: InappstorySdkModule = this;
    //Goods widget
    AppearanceManager.getCommonInstance().csCustomGoodsWidget(object : ICustomGoodsWidget {
      override fun getWidgetView(context: Context): View? {
        print("csCustomGoodsWidget getWidgetView");
        return null;
      }

      override fun getItem(): ICustomGoodsItem? {
        print("csCustomGoodsWidget getItem");
        return null;
      }

      override fun getWidgetAppearance(): IGoodsWidgetAppearance? {
        print("csCustomGoodsWidget getWidgetAppearance");
        return null;
      }

      override fun getDecoration(): RecyclerView.ItemDecoration? {
        print("csCustomGoodsWidget getDecoration");
        return null;
      }

      public override fun getSkus(
        widgetView: View,
        skus: ArrayList<String>,
        callback: GetGoodsDataCallback
      ) {
        print("csCustomGoodsWidget getSkus = $skus")
        var payload = Arguments.makeNativeMap(
          mutableMapOf(
            "skus" to skus,
          ) as Map<String, Any>
        )
        sendEvent(reactContext, "getGoodsObject", payload)
        val handler = Handler()
        val runnableCode: Runnable = Runnable {
          if (that.goodsCache.size > 0) {
            callback.onSuccess(that.goodsCache)
            that.goodsCache.clear();
          } else {
            handler.postDelayed(this as Runnable, 250)
          }
        }
        handler.post(runnableCode)


      }

      override fun onItemClick(
        widgetView: View,
        goodsItemView: View,
        goodsItemData: GoodsItemData,
        callback: GetGoodsDataCallback
      ) {
        var payload = Arguments.makeNativeMap(
          mutableMapOf(
            "sku" to goodsItemData.sku,
          ) as Map<String, Any>
        )
        sendEvent(reactContext, "goodItemSelected", payload)
        callback.onClose()
        InAppStoryManager.closeStoryReader()
        return;
      }
    });

    this.ias?.setShowStoryCallback(
      object : ShowStoryCallback {
        override fun showStory(
          story: StoryData?,
          showStoryAction: ShowStoryAction?
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "action" to when (showStoryAction) {
                ShowStoryAction.OPEN -> "open"
                ShowStoryAction.TAP -> "tap"
                ShowStoryAction.SWIPE -> "swipe"
                ShowStoryAction.AUTO -> "auto"
                ShowStoryAction.CUSTOM -> "custom"
                null -> "unknown"
              },
              "feed" to story?.feed,
              "id" to story?.id,
              "slidesCount" to story?.slidesCount

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "showStory", payload)
        }
      }
    )
    this.ias?.setShowSlideCallback(
      object : ShowSlideCallback {
        override fun showSlide(
          slide: SlideData?
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "id" to slide?.story?.id,
              "index" to slide?.index,
              "slidesCount" to slide?.story?.slidesCount

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "showSlide", payload)
        }
      }
    )
    this.ias?.setCloseStoryCallback(
      object : CloseStoryCallback {
        override fun closeStory(
          slide: SlideData?,
          action: CloseReader?
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "action" to when (action) {
                CloseReader.AUTO -> "auto"
                CloseReader.CLICK -> "click"
                CloseReader.SWIPE -> "swipe"
                CloseReader.CUSTOM -> "custom"
                null -> "unknown"
              },
              "feed" to slide?.story?.feed,
              "id" to slide?.story?.id

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "closeStory", payload)
        }
      }
    )

    this.ias?.setCallToActionCallback(
      object : CallToActionCallback {
        override fun callToAction(
          context: Context?, //Here context of story reader or context of storiesList if it calls from it's deeplinks
          content: ContentData?,
          url: String?,
          action: ClickAction
        ) {

          if (content is SlideData) {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "action" to when (action) {
                  ClickAction.BUTTON -> "button"
                  ClickAction.SWIPE -> "swipe"
                  ClickAction.GAME -> "game"
                  ClickAction.DEEPLINK -> "deeplink"
                },
                "feed" to content?.story?.feed,
                "index" to content?.index,
                "id" to content?.story?.id,
                "url" to url

              ) as Map<String, Any>
            )

            Log.d(
              "InappstorySdkModule",
              "callToAction slide = $content url = $url action= $action"
            );
            // currently not work two sendEvent simultaneously
            //if (action == ClickAction.BUTTON) {
            // just event
            //sendEvent(reactContext, "clickOnButton", payload)
            //}
            // CTA(link) handler
            sendEvent(reactContext, "handleCTA", payload)
          } else if (content is InAppMessageData) {
            //val inAppMessageId: Int = content.id
            //val title: String? = content.title
            //val event: String? = content.event

            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "action" to "unknown",
                "id" to content.id(),
                "url" to url
              ) as Map<String, Any>
            )
            Log.d(
              "InappstorySdkModule",
              "callToAction InAppMessageData = $content url = $url action= $action"
            );
            sendEvent(reactContext, "handleCTA", payload)
          } else {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "action" to "unknown",
                "url" to url
              ) as Map<String, Any>
            )
            Log.d(
              "InappstorySdkModule",
              "callToAction Unknown content = $content url = $url action= $action"
            );
            sendEvent(reactContext, "handleCTA", payload)
          }
        }
      }
    )
    this.ias?.setFavoriteStoryCallback(
      object : FavoriteStoryCallback {
        override fun favoriteStory(
          slide: SlideData?,
          value: Boolean
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to slide?.story?.feed,
              "index" to slide?.index,
              "storyID" to slide?.story?.id,
              "favorite" to value

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "favoriteStory", payload)
        }
      }
    )
    this.ias?.setLikeDislikeStoryCallback(
      object : LikeDislikeStoryCallback {
        override fun likeStory(
          slide: SlideData?,
          value: Boolean
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to slide?.story?.feed,
              "index" to slide?.index,
              "id" to slide?.story?.id,
              "value" to value

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "likeStory", payload)
        }

        override fun dislikeStory(
          slide: SlideData?,
          value: Boolean
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to slide?.story?.feed,
              "index" to slide?.index,
              "id" to slide?.story?.id,
              "value" to value

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "dislikeStory", payload)
        }
      }
    )
    this.ias?.setClickOnShareStoryCallback(
      object : ClickOnShareStoryCallback {
        override fun shareClick(
          slide: SlideData?
        ) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to slide?.story?.feed,
              "index" to slide?.index,
              "id" to slide?.story?.id

            ) as Map<String, Any>
          )
          sendEvent(reactContext, "clickOnShareStory", payload)
          Log.d("InappstorySdkModule", "clickOnShareStory slide = $slide");
        }
      }
    )
    this.ias?.setOnboardingLoadCallback(
      object : OnboardingLoadCallback {
        override fun onboardingLoadSuccess(count: Int, feed: String?) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "count" to count,
              "feed" to feed,

              ) as Map<String, Any>
          )
          sendEvent(reactContext, "onboardingLoad", payload)
          Log.d("InappstorySdkModule", "onboardingLoadSuccess count = $count, feed = $feed");
        }

        override fun onboardingLoadError(feed: String?, reason: String?) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to feed,
              "reason" to reason,
            ) as Map<String, Any>
          )
          sendEvent(reactContext, "loadOnboardingError", payload)
          Log.d("InappstorySdkModule", "loadOnboardingError reason = $reason, feed = $feed");
        }

      }
    )
    this.ias?.setSingleLoadCallback(
      object : SingleLoadCallback {
        override fun singleLoadSuccess(story: StoryData?) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "id" to story?.id,
              "feed" to story?.feed,

              ) as Map<String, Any>
          )
          sendEvent(reactContext, "singleLoad", payload)
          Log.d("InappstorySdkModule", "singleLoadSuccess story = $story");
        }

        override fun singleLoadError(storyId: String?, reason: String?) {
          //val payload:WritableMap = Arguments.createMap()
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "id" to storyId,
              "reason" to reason,

              ) as Map<String, Any>
          )
          sendEvent(reactContext, "loadSingleError", payload)
          Log.d("InappstorySdkModule", "loadSingleError storyId = $storyId, reason = $reason");
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
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to slideData?.story?.feed,
              "id" to slideData?.story?.id,
              "name" to widgetEventName,
              "data" to widgetData
            ) as Map<String, Any>
          )
          sendEvent(reactContext, "storyWidgetEvent", payload)
          Log.d(
            "InappstorySdkModule",
            "storyWidget story = $slideData, widgetEventName = $widgetEventName, widgetData = $widgetData"
          );
        }
      }
    )
    this.ias?.setGameReaderCallback(
      object : GameReaderCallback {
        override fun startGame(
          content: ContentData?,
          id: String?
        ) {
          if (content is GameStoryData) {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "storyID" to content?.slideData?.story?.id,
                "index" to content?.slideData?.index,
                "id" to id
              ) as Map<String, Any>
            )
            sendEvent(reactContext, "startGame", payload)
          }
        }

        override fun closeGame(
          content: ContentData?,
          id: String?
        ) {
          if (content is GameStoryData) {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "storyID" to content?.slideData?.story?.id,
                "index" to content?.slideData?.index,
                "id" to id
              ) as Map<String, Any>
            )
            sendEvent(reactContext, "closeGame", payload)
          }
        }

        override fun gameLoadError(
          content: ContentData?,
          id: String?
        ) {
          if (content is GameStoryData) {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "storyID" to content?.slideData?.story?.id,
                "index" to content?.slideData?.index,
                "id" to id
              ) as Map<String, Any>
            )
            sendEvent(reactContext, "gameFailure", payload)
            Log.d("InappstorySdkModule", "gameLoadError gameStoryData = $content, id = $id");
          }
        }

        override fun gameOpenError(
          content: ContentData?,
          id: String?
        ) {
          if (content is GameStoryData) {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "storyID" to content?.slideData?.story?.id,
                "index" to content?.slideData?.index,
                "id" to id
              ) as Map<String, Any>
            )
            sendEvent(reactContext, "gameFailure", payload)
            Log.d("InappstorySdkModule", "gameOpenError gameStoryData = $content, id = $id");
          }
        }

        override fun eventGame(
          content: ContentData?,
          id: String?,
          id2: String?,
          id3: String?
        ) {
          if (content is GameStoryData) {
            var payload = Arguments.makeNativeMap(
              mutableMapOf(
                "storyID" to content?.slideData?.story?.id,
                "index" to content?.slideData?.index,
                "id" to id,
                "id2" to id2,
                "id3" to id3
              ) as Map<String, Any>
            )
            sendEvent(reactContext, "eventGame", payload)
            Log.d(
              "InappstorySdkModule",
              "eventGame gameStoryData = $content, id = $id , id2 = $id2 , id3 = $id3"
            );
          }
        }
      }
    )
    this.ias?.setErrorCallback(
      object : ErrorCallback {
        override fun loadListError(feed: String?) {
          var payload = Arguments.makeNativeMap(
            mutableMapOf(
              "feed" to feed
            ) as Map<String, Any>
          )
          sendEvent(reactContext, "loadListError", payload)
          Log.d("InappstorySdkModule", "loadListError feed = $feed");
        }

        override fun cacheError() {
          val payload: WritableMap = Arguments.createMap()
          sendEvent(reactContext, "cacheError", payload)
          Log.d("InappstorySdkModule", "cacheError");
        }

        //override fun readerError() {
        //    val payload:WritableMap = Arguments.createMap()
        //    sendEvent(reactContext,"readerError", payload)
        //    Log.d("InappstorySdkModule","readerError");
        //}

        override fun emptyLinkError() {
          val payload: WritableMap = Arguments.createMap()
          sendEvent(reactContext, "emptyLinkError", payload)
          Log.d("InappstorySdkModule", "emptyLinkError");
        }

        override fun sessionError() {
          val payload: WritableMap = Arguments.createMap()
          sendEvent(reactContext, "sessionError", payload)
          Log.d("InappstorySdkModule", "sessionError");
        }

        override fun noConnection() {
          val payload: WritableMap = Arguments.createMap()
          sendEvent(reactContext, "noConnection", payload)
          Log.d("InappstorySdkModule", "noConnection");
        }

      }
    )
    this.ias?.setShowInAppMessageCallback(object : ShowInAppMessageCallback {
      override fun showInAppMessage(iamData: InAppMessageData?) {
        var payload = Arguments.makeNativeMap(
          mutableMapOf(
            "title" to iamData?.title(),
            "event" to iamData?.event(),
            "id" to iamData?.id()
          ) as Map<String, Any>
        )
        sendEvent(reactContext, "showInAppMessage", payload)
      }
    })
    this.ias?.setCloseInAppMessageCallback(object : CloseInAppMessageCallback {
      override fun closeInAppMessage(iamData: InAppMessageData?) {
        var payload = Arguments.makeNativeMap(
          mutableMapOf(
            "title" to iamData?.title(),
            "event" to iamData?.event(),
            "id" to iamData?.id(),
          ) as Map<String, Any>
        )
        sendEvent(reactContext, "closeInAppMessage", payload)
      }
    })

    this.ias?.setInAppMessageWidgetCallback { inAppMessageData, name, data ->
      val iamData = Arguments.makeNativeMap(
        mutableMapOf(
          "title" to inAppMessageData?.title(),
          "event" to inAppMessageData?.event(),
          "id" to inAppMessageData?.id(),
        ) as Map<String, Any>
      )
      val payload = Arguments.makeNativeMap(
        mutableMapOf(
          "data" to data,
          "name" to name,
          "inAppMessageData" to iamData,
        ) as Map<String, Any>
      )
      sendEvent(reactContext, "inAppMessageWidgetEvent", payload)
    }

    this.ias?.setBannerWidgetCallback { bannerData, name, data ->
      val payload = Arguments.makeNativeMap(
        mutableMapOf(
          "data" to data,
          "name" to name,
          "bannerData" to Arguments.makeNativeMap(
            mutableMapOf(
              "id" to bannerData?.id(),
              "bannerPlace" to bannerData?.bannerPlace(),
              "payload" to bannerData?.payload(),
            ) as Map<String, Any>
          )
        ) as Map<String, Any>
      )
      sendEvent(reactContext, "bannerWidgetEvent", payload)
    }
  }

  @ReactMethod
  fun addProductToCache(
    sku: String,
    title: String,
    subtitle: String,
    imageURL: String,
    price: String,
    oldPrice: String
  ) {
    val data = GoodsItemData(
      sku,
      title,
      subtitle,
      imageURL,
      price,
      oldPrice,
      sku
    )
    this.goodsCache.add(data)
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
  fun showSingle(storyID: String, operationId: String, promise: Promise) {
    Log.d("InappstorySdkModule", "showSingle")
    try {
      var cancellationToken: CancellationToken? =
        this.ias?.showStory(storyID, getCurrentActivity(), this.appearanceManager, null)
      cancellationTokenMap[operationId] = cancellationToken
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("showGame error", e)
    }
  }

  @ReactMethod
  fun showIAMById(iamId: String, onlyPreloaded: Boolean, operationId: String, promise: Promise) {
    Log.d("InappstorySdkModule", "showIAMById")
    try {
      val settings =
        InAppMessageOpenSettings().id(iamId.toInt()).showOnlyIfLoaded(onlyPreloaded)

      val fragment = NativeOverlayFragment(
        ias = this.ias,
        settings = settings,
        //backPressManager = this.backPressManager,
        onReaderIsClosed = {
          Log.d("InappstorySdkModule", "IAM reader closed")
          if (cancellationTokenMap.containsKey(operationId)) {
            cancellationTokenMap.remove(operationId)
          }
        },
        onReaderIsOpen = { cancellationToken ->
          Log.d("InappstorySdkModule", "IAM reader opened")
          cancellationTokenMap[operationId] = cancellationToken
          promise.resolve(true)
        },
      )

      (getCurrentActivity() as FragmentActivity).supportFragmentManager
        .beginTransaction()
        .add(android.R.id.content, fragment, "overlay_fragment")
        .addToBackStack("overlay_fragment")
        .commit()
        
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("showIAMById error", e)
    }
  }

  @ReactMethod
  fun showIAMByEvent(
    iamEvent: String,
    onlyPreloaded: Boolean,
    operationId: String,
    promise: Promise
  ) {
    Log.d("InappstorySdkModule", "showIAMByEvent")
    try {
      val settings =
        InAppMessageOpenSettings().event(iamEvent).showOnlyIfLoaded(onlyPreloaded)
      val fragment = NativeOverlayFragment(
        ias = this.ias,
        settings = settings,
        //backPressManager = this.backPressManager,
        onReaderIsClosed = {
          Log.d("InappstorySdkModule", "IAM reader closed")
          if (cancellationTokenMap.containsKey(operationId)) {
            cancellationTokenMap.remove(operationId)
          }
        },
        onReaderIsOpen = { cancellationToken ->
          Log.d("InappstorySdkModule", "IAM reader opened")
          cancellationTokenMap[operationId] = cancellationToken
        },
      )

      (getCurrentActivity() as FragmentActivity).supportFragmentManager
        .beginTransaction()
        .add(android.R.id.content, fragment, "overlay_fragment")
        .addToBackStack("overlay_fragment")
        .commit()

      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("showIAMById error", e)
    }
  }

  @ReactMethod
  fun preloadIAM(ids: ReadableArray?, tags: ReadableArray?, promise: Promise) {
    Log.d("InappstorySdkModule", "preloadIAM")
    var settings = InAppMessagePreloadSettings()
    if (ids != null)
      settings = settings.inAppMessageIds(ids.toArrayList().toMutableList() as List<String>)
    if (tags != null)
      settings = settings.tags(tags.toArrayList().toMutableList() as List<String>)
    try {
      this.ias?.preloadInAppMessages(settings, object : InAppMessageLoadCallback {
        override fun loaded(id: Int) {

        }

        override fun allLoaded() {
          promise.resolve(true)
        }

        override fun loadError(id: Int) {

        }

        override fun loadError() {
          promise.resolve(false)
        }

        override fun isEmpty() {
          promise.resolve(true)
        }
      })
    } catch (e: Throwable) {
      promise.reject("preloadIAM error", e)
    }
  }

  @ReactMethod
  fun handleHardwareBackPress(promise: Promise) {
    Log.d("InappstorySdkModule", "handleHardwareBackPress")
    //promise.resolve(backPressManager.handleBackPress())
  }

  @ReactMethod
  fun cancelOperation(operationId: String) {
    Log.d("InappstorySdkModule", "cancelOperation")
    try {
      if (cancellationTokenMap.containsKey(operationId)) {
        cancellationTokenMap[operationId]?.cancel()
        cancellationTokenMap.remove(operationId)
      }
    } catch (e: Throwable) {
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
    var nativeMap: ReadableNativeMap = placeholders as ReadableNativeMap;
    this.ias?.setPlaceholders(nativeMap.toHashMap() as Map<String, String>)
  }

  @ReactMethod
  fun setImagesPlaceholders(imagePlaceholders: ReadableArray) {
    Log.d("InappstorySdkModule", "setImagesPlaceholders")
    var nativeMap: ReadableNativeMap = imagePlaceholders as ReadableNativeMap;
    var imageMap: Map<String, ImagePlaceholderValue> =
      nativeMap.toHashMap().mapValues { ImagePlaceholderValue.createByUrl(it.value as String) }
    this.ias?.setImagePlaceholders(imageMap)
  }

  @ReactMethod
  fun changeSound(value: Boolean) {
    Log.d("InappstorySdkModule", "changeSound")
    this.ias?.soundOn(value)
  }

  @ReactMethod
  fun getSound(promise: Promise) {
    Log.d("InappstorySdkModule", "getSound")
    // promise.resolve(this.ias?.soundOn())
    promise.resolve((this.ias?.iasCore()?.settingsAPI() as IASDataSettingsHolder).isSoundOn())
  }

  @ReactMethod
  fun setAppVersion(version: String, build: Int) {
    Log.d("InappstorySdkModule", "setAppVersion: " + version + ", build: " + build)
    this.ias?.setAppVersion(version, build)
  }

  @ReactMethod
  fun setHasLike(value: Boolean) {
    Log.d("InappstorySdkModule", "setHasLike " + value)
    if (appearanceManager == null) {
      Log.d("InappstorySdkModule", "setHasLike null")
    }
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

  @ReactMethod
  fun setCoverQuality(value: String) {
    Log.d("InappstorySdkModule", "setCoverQuality")
    when (value) {
      "medium" -> appearanceManager?.csCoverQuality(QUALITY_MEDIUM)
      "high" -> appearanceManager?.csCoverQuality(QUALITY_HIGH)
    }
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
  */
  @ReactMethod
  fun clearCache() {
    Log.d("InappstorySdkModule", "clearCache")
    this.ias?.clearCache()
  }
  
  @ReactMethod
  fun setSendStatistics(sendStatistic: Boolean) {
    Log.d("InappstorySdkModule", "setSendStatistics")
    this.api.settings.sendStatistic(sendStatistic)
  }

  /*
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
  fun showOnboardings(
    feed: String,
    operationId: String,
    limit: Int,
    tags: ReadableArray,
    promise: Promise
  ) {
    var tags: List<String>? = null; //FIXME
    Log.d("InappstorySdkModule", "showOnboardings")
    var cancelToken: CancellationToken?
    if (limit != null) {
      cancelToken = this.ias?.showOnboardingStories(
        limit,
        feed,
        tags,
        reactContext.currentActivity,
        this.appearanceManager
      )
    } else {
      cancelToken = this.ias?.showOnboardingStories(
        feed,
        tags,
        reactContext.currentActivity,
        this.appearanceManager
      )
    }
    cancellationTokenMap[operationId] = cancelToken
    promise.resolve(feed)
  }

  @ReactMethod
  fun setVisibleWith(storyIDs: ReadableArray) {
    Log.d("InappstorySdkModule", "setVisibleWith")
    val stringIds: ArrayList<String> = storyIDs.toArrayList() as ArrayList<String>
    // Ignore non-numeric ids (e.g. the favorites cell key) so a bad entry can't
    // crash the bridge with NumberFormatException.
    var ids: List<Int> = stringIds.mapNotNull { it.toIntOrNull() }
    Log.d("InappstorySdkModule", "ids: $ids")
    this.api?.storyList?.updateVisiblePreviews(ids, "feed")
  }

  @ReactMethod
  fun selectStoryCellWith(storyID: String, feed: String) {
    Log.d("InappstorySdkModule", "selectStoryCellWith")
    this.api?.storyList?.openStoryReader(
      reactContext.currentActivity,
      feed,
      storyID.toInt(),
      this.appearanceManager
    );
  }

  fun getImageID(imgName: String): Int {
    var id: Int = reactContext.getResources()
      .getIdentifier(imgName, "drawable", reactContext.currentActivity?.getPackageName());
    return id;
  }

  @ReactMethod
  fun setLikeImage(image: String, selectedImage: String) {
    this.appearanceManager?.csLikeIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setDislikeImage(image: String, selectedImage: String) {
    this.appearanceManager?.csDislikeIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setFavoriteImage(image: String, selectedImage: String) {
    this.appearanceManager?.csFavoriteIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setShareImage(image: String, selectedImage: String) {
    this.appearanceManager?.csShareIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setSoundImage(image: String, selectedImage: String) {
    this.appearanceManager?.csSoundIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setCloseReaderImage(image: String) {
    this.appearanceManager?.csCloseIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setCloseGoodsImage(image: String) {
    this.appearanceManager?.csCloseIcon(this.getImageID(image));
  }

  @ReactMethod
  fun setRefreshImage(image: String) {
    this.appearanceManager?.csRefreshIcon(this.getImageID(image));
  }

  @ReactMethod
  fun showEditor() {
    Log.d("IAS", "openEditor")
    //this.appearanceManager?.csHasUGC(true)
    //UGCInAppStoryManager.init(reactContext.currentActivity as Context)
    //UGCInAppStoryManager.openEditor(reactContext.currentActivity as Context)
    //promise.resolve(true)
  }

  private fun createManager(
    apiKey: String,
    userID: String,
    userIdSign: String?,
    sandbox: Boolean,
    sendStatistic: Boolean,
    inAppStoryAPI: InAppStoryAPI
  ) {
    inAppStoryAPI.setExternalPlatform(ExternalPlatforms.REACT_NATIVE_SDK);
    this.ias = inAppStoryAPI.inAppStoryManager.create(
      apiKey,
      userID,
      userIdSign,
      null,
      null,
      null,
      null,
      null,
      false,
      true,
      CacheSize.MEDIUM,
      false,
    )
    inAppStoryAPI.settings.sendStatistic(sendStatistic)

    InAppStoryManager.logger = IASLoggerImpl()
  }

  @ReactMethod
  fun createSubscriberList(feed: String) {
    Log.e(TAG, "createSubscriberList: $feed")
    this.subscribeLists(this.api as InAppStoryAPI, feed)
    // if (feed != "favorites") {
    //   this.subscribeLists(this.api as InAppStoryAPI, "favorites")
    // }
  }

  fun subscribeLists(inAppStoryAPI: InAppStoryAPI, feed: String) {
    inAppStoryAPI.addSubscriber(object : InAppStoryAPIListSubscriber(feed) {
      override fun updateFavoriteItemData(favorites: MutableList<StoryFavoriteItemAPIData>) {
        // Push model (like the Flutter SDK): the SDK fires this whenever the
        // favorites set changes (e.g. toggled in the reader). The snapshot only
        // carries ids (imageFilePath is null), so we use it as a trigger and
        // reload the favorites list, which repopulates the cell with real covers
        // and aspectRatio via the existing storyListUpdate/storyUpdate path.
        // Guard on the id set so the reload's own callbacks can't loop.
        val ids = favorites.map { it.id }.toSet()
        if (ids == lastFavoriteIds) return
        lastFavoriteIds = ids
        getFavoriteStories("default")
      }

      override fun updateStoryData(story: StoryAPIData, sessionData: IASStoryListSessionData) {
        val aspectRatio = sessionData.previewAspectRatio();
        Log.e(TAG, "aspect ratio return $aspectRatio ")
        Log.e(TAG, "updateStoryData: $story")

        // Feed key in JS is `feed + '_' + list`. Must match updateStoriesData
        // and the iOS module: main feed -> feed=<feed>, list="feed";
        // favorites -> feed="default", list="favorites".
        val payloadFeed = if (feed == "favorites") "default" else feed
        val payloadList = if (feed == "favorites") "favorites" else "feed"

        var payload = Arguments.makeNativeMap(
          mutableMapOf(
            "storyID" to story.id,
            //"storyData" to item.storyData,
            "title" to story.title,
            "coverImagePath" to story.imageFilePath,
            "coverVideoPath" to story.videoFilePath,
            "backgroundColor" to story.backgroundColor,
            "titleColor" to story.titleColor,
            "opened" to story.opened,
            "hasAudio" to story.hasAudio,
            "list" to payloadList,
            "feed" to payloadFeed,
            "aspectRatio" to aspectRatio,
            "slidesCount" to story.storyData.slidesCount,
            "statTitle" to story.storyData.title,
          ) as Map<String, Any>
        )
        Log.e(TAG, "Item = $story")
        sendEvent(reactContext, "storyUpdate", payload)
      }

      override fun updateStoriesData(
        stories: MutableList<StoryAPIData>,
        sessionData: IASStoryListSessionData
      ) {
        Log.e(TAG, "$feed updateStoriesData: $stories")
        val aspectRatio = sessionData.previewAspectRatio();
        Log.e(TAG, "aspect ratio return $aspectRatio ")

        // Feed key in JS is `feed + '_' + list`. Must match the iOS module:
        // main feed -> feed=<feed>, list="feed"; favorites -> feed="default",
        // list="favorites".
        val payloadFeed = if (feed == "favorites") "default" else feed
        val payloadList = if (feed == "favorites") "favorites" else "feed"

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
              "hasAudio" to item.hasAudio,
              "list" to payloadList,
              "feed" to payloadFeed,
              "aspectRatio" to aspectRatio,
              "slidesCount" to item.storyData.slidesCount,
              "statTitle" to item.storyData.title,
            ) as Map<String, Any>
          )
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
        val payload: WritableMap = Arguments.createMap()
        payload.putArray("stories", Arguments.makeNativeArray(storiesList));
        payload.putString("feed", payloadFeed)
        payload.putString("list", payloadList)
        sendEvent(reactContext, "storyListUpdate", payload)

        // The SDK only downloads covers for previews reported as visible. For the
        // main feed JS does this via setVisibleWith; the favorites cell never
        // reports visibility, so mark the loaded favorites visible here to make
        // their covers download (arriving later via updateStoryData).
        if (feed == "favorites") {
          inAppStoryAPI.storyList.updateVisiblePreviews(stories.map { it.id }, "favorites")
        }
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

  fun getReactRootViewId(): Int {
    val activity = getCurrentActivity() ?: return View.NO_ID

    val decorView = activity.window.decorView
    val rootView = findReactRootView(decorView)

    return rootView?.parent?.let { parent ->
      (parent as? View)?.id ?: View.NO_ID
    } ?: View.NO_ID
  }

  private fun findReactRootView(view: View): View? {
    if (view.javaClass.name.contains("ReactRootView")) return view
    if (view !is ViewGroup) return null

    for (i in 0 until view.childCount) {
      findReactRootView(view.getChildAt(i))?.let { return it }
    }
    return null
  }

  fun addFragmentContainer(): Int {
    val activity = getCurrentActivity() as? FragmentActivity ?: return View.NO_ID

    val containerId = View.generateViewId()
    val container = FrameLayout(activity).apply {
      id = containerId
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }

    val decorContent = activity.findViewById<ViewGroup>(android.R.id.content)

    activity.runOnUiThread {
      decorContent.addView(container)
    }

    return containerId
  }

  fun removeFragmentContainer(containerId: Int) {
    val activity = getCurrentActivity() as? FragmentActivity ?: return

    activity.runOnUiThread {
//      val fm = activity.supportFragmentManager
//      val fragment = fm.findFragmentById(containerId)
//      if (fragment != null) {
//        fm.beginTransaction()
//          .remove(fragment)
//          .commitAllowingStateLoss()
//      }

      val decorContent = activity.findViewById<ViewGroup>(android.R.id.content)
      val container = decorContent.findViewById<View>(containerId)
      if (container != null) {
        Log.d("InAppStoryManager", "container not null, removing");
        decorContent.removeView(container)
      }
    }
  }
}
/*

appearanceManager.csIsDraggable(true);
  :*/
