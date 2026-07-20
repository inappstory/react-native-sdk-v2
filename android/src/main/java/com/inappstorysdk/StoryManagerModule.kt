package com.inappstory.reactnativesdk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.module.annotations.ReactModule
import java.util.Locale

import com.inappstory.sdk.InAppStoryManager;
import com.inappstory.sdk.AppearanceManager;

import com.inappstory.sdk.externalapi.ExternalPlatforms
import com.inappstory.sdk.externalapi.InAppStoryAPI;
import com.inappstory.sdk.externalapi.StoryAPIData;
import com.inappstory.sdk.banners.BannerPlacePreloadCallback
import com.inappstory.sdk.banners.BannerPlaceLoadSettings
import com.inappstory.sdk.banners.BannerData
import com.inappstory.sdk.lrudiskcache.CacheSize
import com.inappstory.sdk.externalapi.StoryFavoriteItemAPIData;
import com.inappstory.sdk.externalapi.subscribers.InAppStoryAPIListSubscriber;
import com.inappstory.sdk.externalapi.storylist.IASStoryListSessionData;

import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsItemData;

import com.facebook.react.bridge.WritableMap;

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableNativeMap

import android.util.Log

import com.inappstory.reactnativesdk.AppearanceManagerImpl
import com.inappstory.sdk.stories.api.models.ImagePlaceholderValue;
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstorysdk.IASLoggerImpl
import com.inappstorysdk.NativeOverlayFragment

import android.content.Context
import androidx.fragment.app.FragmentActivity
import com.inappstory.sdk.CancellationToken
import com.inappstory.sdk.inappmessage.InAppMessageOpenSettings
import com.inappstory.sdk.inappmessage.InAppMessagePreloadSettings
import com.inappstory.sdk.inappmessage.InAppMessageLoadCallback

@ReactModule(name = StoryManagerModule.NAME)
class StoryManagerModule(var reactContext: ReactApplicationContext) :
  NativeStoryManagerSpec(reactContext) {

  companion object {
    const val NAME = "NativeStoryManager"
  }

  override fun getName(): String {
    return NAME
  }

  private fun sendLegacyEvent(name: String, payload: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, payload)
  }

  var ias: InAppStoryManager? = null
  var appearanceManager: AppearanceManager? = null;
  var api: InAppStoryAPI? = null;
  var favoritesApi: InAppStoryAPI? = null;
  var TAG: String = "IAS_SDK_API";

  // Last favorites set seen via updateFavoriteItemData. Used to avoid reloading
  // (and looping) when the SDK re-reports the same set.
  private var lastFavoriteIds: Set<Int>? = null

  private val cancellationTokenMap = mutableMapOf<String, CancellationToken?>()

  var stories: ArrayList<String>? = null;
  var goodsCache: ArrayList<GoodsItemData> = ArrayList<GoodsItemData>()
  private var listenerCount = 0

  override fun initWith(
    apiKey: String, userID: String, userIdSign: String?, sandbox: Boolean, sendStatistics: Boolean, promise: Promise
  ) {
    Log.d("InappstorySdkModule", "initWith")
    //this.ias = this.createInAppStoryManager(apiKey, userID)
    this.appearanceManager = AppearanceManagerImpl.getAppearanceManager()
    this.api = InAppStoryAPI()
    this.favoritesApi = InAppStoryAPI()
    this.createManager(
      apiKey, userID, userIdSign, sandbox, sendStatistics, this.favoritesApi as InAppStoryAPI
    )
    this.createManager(
      apiKey, userID, userIdSign, sandbox, sendStatistics, this.api as InAppStoryAPI
    )
    // Main feed is subscribed per carousel via createSubscriberList(feed, uniqueId);
    // here only favorites is subscribed once (mirrors the old-arch module).
    //this.subscribeLists(this.api as InAppStoryAPI, "feed")
    this.subscribeLists(this.favoritesApi as InAppStoryAPI, "favorites")
    setupListeners()
    promise.resolve(null)
  }

  override fun setUserID(userId: String, userIdSign: String?) {
    Log.d("InappstorySdkModule", "setUserID")
    this.ias?.setUserId(userId, userIdSign)
  }

  override fun setTags(tags: ReadableArray) {
    Log.d("InappstorySdkModule", "setTags")
    val list: ArrayList<String> = tags.toArrayList() as ArrayList<String>
    this.ias?.setTags(list)
  }

  override fun removeTags(tags: ReadableArray) {
    Log.d("InappstorySdkModule", "removeTags")
    val list: ArrayList<String> = tags.toArrayList() as ArrayList<String>
    this.ias?.removeTags(list)
  }

  override fun setPlaceholders(placeholders: ReadableMap) {
    Log.d("InappstorySdkModule", "setPlaceholders $placeholders")
    var nativeMap: ReadableNativeMap = placeholders as ReadableNativeMap;
    this.ias?.setPlaceholders(nativeMap.toHashMap() as Map<String, String>)
  }

  override fun changeSound(value: Boolean) {
    Log.d("InappstorySdkModule", "changeSound")
    this.ias?.soundOn(value)
  }

  override fun setLang(lang: String) {
    Log.d("InappstorySdkModule", "setLang")
    this.ias?.setLang(Locale.forLanguageTag("en-US"))
  }

  override fun setAppVersion(version: String, build: Double) {
    Log.d("InappstorySdkModule", "setAppVersion: " + version + ", build: " + build)
    this.ias?.setAppVersion(version, build.toInt())
  }

  override fun createSubscriberList(feed: String, uniqueId: String) {
    Log.e(TAG, "createSubscriberList: $feed, uniqueId: $uniqueId")
    this.subscribeLists(this.api as InAppStoryAPI, feed, uniqueId)
  }

  override fun getStories(feed: String, uniqueId: String) {
    Log.d("InappstorySdkModule", "getStories for feed: $feed, uniqueId: $uniqueId");
    this.api?.storyList?.load(
      feed, uniqueId, true, false, this.ias?.getTags()
    )
    //this.api.getStories()
  }


  override fun getFavoriteStories(feed: String) {
    Log.d("InappstorySdkModule", "getFavoriteStories");
    this.favoritesApi?.storyList?.load(
      feed, "favorites", true, true, this.ias?.getTags()
    )
  }

  override fun preloadBannerPlace(placeId: String, tags: ReadableArray?, promise: Promise) {
    Log.d("InappstorySdkModule", "preloadBannerPlace")
    var settings = BannerPlaceLoadSettings().placeId(placeId)
    if (tags != null)
      settings = settings.tags(tags.toArrayList().toMutableList() as List<String>)
    try {
      this.ias?.preloadBannerPlace(settings, object : BannerPlacePreloadCallback(placeId) {
        override fun bannerPlaceLoaded(size: Int, bannerData: List<BannerData>) {
          promise.resolve(true)
        }

        override fun loadError() {
          promise.resolve(false)
        }

        override fun bannerContentLoaded(bannerId: Int, isFirst: Boolean) {}

        override fun bannerContentLoadError(bannerId: Int, isFirst: Boolean) {}
      })
    } catch (e: Throwable) {
      promise.reject("preloadBannerPlace error", e)
    }
  }

  override fun showGame(gameID: String, promise: Promise) {
    Log.d(TAG, "showGame")
    reactContext.runOnUiQueueThread {
      try {
        this.ias?.openGame(gameID, reactContext.currentActivity as Context)
        promise.resolve(true)
      } catch (e: Throwable) {
        promise.reject("showGame error", e)
      }
    }
  }

  override fun showSingle(storyID: String, operationId: String, promise: Promise) {
    Log.d(TAG, "showSingle")
    reactContext.runOnUiQueueThread {
      try {
        cancellationTokenMap[operationId] =
          this.ias?.showStory(storyID, reactContext.currentActivity, this.appearanceManager, null)
        promise.resolve(true)
      } catch (e: Throwable) {
        promise.reject("showSingle error", e)
      }
    }
  }

  override fun showIAMById(
    iamID: String,
    onlyPreloaded: Boolean,
    operationId: String,
    promise: Promise
  ) {
    Log.d(TAG, "showIAMById")
    reactContext.runOnUiQueueThread {
      try {
        val settings =
          InAppMessageOpenSettings().id(iamID.toInt()).showOnlyIfLoaded(onlyPreloaded)

        val fragment = NativeOverlayFragment(
          ias = this.ias,
          settings = settings,
          onReaderIsClosed = { cancellationTokenMap.remove(operationId) },
          onReaderIsOpen = { cancellationToken ->
            cancellationTokenMap[operationId] = cancellationToken
            promise.resolve(true)
          },
        )

        (reactContext.currentActivity as FragmentActivity).supportFragmentManager
          .beginTransaction()
          .add(android.R.id.content, fragment, "overlay_fragment")
          .addToBackStack("overlay_fragment")
          .commit()
      } catch (e: Throwable) {
        promise.reject("showIAMById error", e)
      }
    }
  }

  override fun preloadIAM(ids: ReadableArray?, tags: ReadableArray?, promise: Promise) {
    Log.d(TAG, "preloadIAM")
    var settings = InAppMessagePreloadSettings()
    if (ids != null)
      settings = settings.inAppMessageIds(ids.toArrayList().toMutableList() as List<String>)
    if (tags != null)
      settings = settings.tags(tags.toArrayList().toMutableList() as List<String>)
    try {
      this.ias?.preloadInAppMessages(settings, object : InAppMessageLoadCallback {
        override fun loaded(id: Int) {}

        override fun allLoaded() {
          promise.resolve(true)
        }

        override fun loadError(id: Int) {}

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

  override fun cancelOperation(operationId: String) {
    Log.d(TAG, "cancelOperation")
    cancellationTokenMap.remove(operationId)?.cancel()
  }

  override fun clearCache() {
    Log.d(TAG, "clearCache")
    this.ias?.clearCache()
  }

  override fun onFavoriteCell() {
    val payload: WritableMap = Arguments.createMap()
    //sendEvent(reactContext, "favoriteCellDidSelect", payload)
  }

  override fun setImagesPlaceholders(placeholders: ReadableMap) {
      Log.d("InappstorySdkModule", "setImagesPlaceholders")
      var nativeMap:ReadableNativeMap = placeholders as ReadableNativeMap;
      var imageMap: Map<String, ImagePlaceholderValue> = nativeMap.toHashMap().mapValues { ImagePlaceholderValue.createByUrl(it.value as String) }
      this.ias?.setImagePlaceholders(imageMap)
  }

  override fun setVisibleWith(storyIDs: ReadableArray) {
        Log.d("InappstorySdkModule", "setVisibleWith")
        val stringIds: ArrayList<String> = storyIDs.toArrayList() as ArrayList<String>
        var ids: List<Int> = stringIds.map{it.toInt()}
        Log.d("InappstorySdkModule", "ids: $ids")
        this.api?.storyList?.updateVisiblePreviews(ids, "feed")
    }

   override fun selectStoryCellWith(storyID: String, feed: String, uniqueId: String) {
        Log.d("InappstorySdkModule", "selectStoryCellWith uniqueId: $uniqueId")
        // TurboModule void methods run on the JS thread; opening the reader
        // launches an Activity and must happen on the UI thread (iOS dispatches
        // the same call to the main queue).
        reactContext.runOnUiQueueThread {
          this.api?.storyList?.openStoryReader(
              reactContext.currentActivity,
              uniqueId,
              storyID.toInt(),
              this.appearanceManager
          )
        }
    }

  override fun selectFavoriteStoryCellWith(storyID: String) {
        reactContext.runOnUiQueueThread {
          this.favoritesApi?.storyList?.openStoryReader(
              reactContext.currentActivity,
              "favorites",
              storyID.toInt(),
              this.appearanceManager
          )
        }
    }

  fun setupListeners() {
    //val that:InappstorySdkModule = this;

    this.ias?.setBannerWidgetCallback { bannerData, name, data ->
      BannerEventsModule.instance?.emitBannerWidget(bannerData, name, data)
    }

    // AppearanceManager.getCommonInstance().csCustomGoodsWidget(object : ICustomGoodsWidget {
    //   override fun getWidgetView(context: Context): View? {
    //     print("csCustomGoodsWidget getWidgetView");
    //     return null;
    //   }

    //   override fun getItem(): ICustomGoodsItem? {
    //     print("csCustomGoodsWidget getItem");
    //     return null;
    //   }

    //   override fun getWidgetAppearance(): IGoodsWidgetAppearance? {
    //     print("csCustomGoodsWidget getWidgetAppearance");
    //     return null;
    //   }

    //   override fun getDecoration(): RecyclerView.ItemDecoration? {
    //     print("csCustomGoodsWidget getDecoration");
    //     return null;
    //   }

    //   public override fun getSkus(
    //     widgetView: View, skus: ArrayList<String>, callback: GetGoodsDataCallback
    //   ) {
    //     print("csCustomGoodsWidget getSkus = $skus")
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "skus" to skus,
    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "getGoodsObject", payload)
    //     val handler = Handler()
    //     val runnableCode: Runnable = Runnable {
    //       // if (that.goodsCache.size > 0) {
    //       //     callback.onSuccess(that.goodsCache)
    //       //     that.goodsCache.clear();
    //       // } else {
    //       //     handler.postDelayed(this as Runnable, 250)
    //       // }
    //     }
    //     handler.post(runnableCode)


    //   }

    //   override fun onItemClick(
    //     widgetView: View,
    //     goodsItemView: View,
    //     goodsItemData: GoodsItemData,
    //     callback: GetGoodsDataCallback
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "sku" to goodsItemData.sku,
    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "goodItemSelected", payload)
    //     callback.onClose()
    //     InAppStoryManager.closeStoryReader()
    //     return;
    //   }
    // });

    // this.ias?.setShowStoryCallback(object : ShowStoryCallback {
    //   override fun showStory(
    //     story: StoryData?, showStoryAction: ShowStoryAction?
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "action" to when (showStoryAction) {
    //           ShowStoryAction.OPEN -> "open"
    //           ShowStoryAction.TAP -> "tap"
    //           ShowStoryAction.SWIPE -> "swipe"
    //           ShowStoryAction.AUTO -> "auto"
    //           ShowStoryAction.CUSTOM -> "custom"
    //           null -> "unknown"
    //         }, "feed" to story?.feed, "id" to story?.id, "slidesCount" to story?.slidesCount

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "showStory", payload)
    //   }
    // })
    // this.ias?.setShowSlideCallback(object : ShowSlideCallback {
    //   override fun showSlide(
    //     slide: SlideData?
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "id" to slide?.story?.id,
    //         "index" to slide?.index,
    //         "slidesCount" to slide?.story?.slidesCount

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "showSlide", payload)
    //   }
    // })
    // this.ias?.setCloseStoryCallback(object : CloseStoryCallback {
    //   override fun closeStory(
    //     slide: SlideData?, action: CloseReader?
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "action" to when (action) {
    //           CloseReader.AUTO -> "auto"
    //           CloseReader.CLICK -> "click"
    //           CloseReader.SWIPE -> "swipe"
    //           CloseReader.CUSTOM -> "custom"
    //           null -> "unknown"
    //         }, "feed" to slide?.story?.feed, "id" to slide?.story?.id

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "closeStory", payload)
    //   }
    // })

    // this.ias?.setCallToActionCallback(object : CallToActionCallback {
    //   override fun callToAction(
    //     context: Context?, //Here context of story reader or context of storiesList if it calls from it's deeplinks
    //     content: ContentData?, url: String?, action: ClickAction
    //   ) {

    //     if (content is SlideData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "action" to when (action) {
    //             ClickAction.BUTTON -> "button"
    //             ClickAction.SWIPE -> "swipe"
    //             ClickAction.GAME -> "game"
    //             ClickAction.DEEPLINK -> "deeplink"
    //           },
    //           "feed" to content?.story?.feed,
    //           "index" to content?.index,
    //           "id" to content?.story?.id,
    //           "url" to url

    //         ) as Map<String, Any>
    //       )

    //       Log.d(
    //         "InappstorySdkModule", "callToAction slide = $content url = $url action= $action"
    //       );
    //       // currently not work two sendEvent simultaneously
    //       //if (action == ClickAction.BUTTON) {
    //       // just event
    //       //sendEvent(reactContext, "clickOnButton", payload)
    //       //}
    //       // CTA(link) handler
    //       sendEvent(getReactApplicationContext(), "handleCTA", payload)
    //     } else if (content is InAppMessageData) {
    //       //val inAppMessageId: Int = content.id
    //       //val title: String? = content.title
    //       //val event: String? = content.event
    //     }
    //   }
    // })
    // this.ias?.setFavoriteStoryCallback(object : FavoriteStoryCallback {
    //   override fun favoriteStory(
    //     slide: SlideData?, value: Boolean
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to slide?.story?.feed,
    //         "index" to slide?.index,
    //         "storyID" to slide?.story?.id,
    //         "favorite" to value

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "favoriteStory", payload)
    //   }
    // })
    // this.ias?.setLikeDislikeStoryCallback(object : LikeDislikeStoryCallback {
    //   override fun likeStory(
    //     slide: SlideData?, value: Boolean
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to slide?.story?.feed,
    //         "index" to slide?.index,
    //         "id" to slide?.story?.id,
    //         "value" to value

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "likeStory", payload)
    //   }

    //   override fun dislikeStory(
    //     slide: SlideData?, value: Boolean
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to slide?.story?.feed,
    //         "index" to slide?.index,
    //         "id" to slide?.story?.id,
    //         "value" to value

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "dislikeStory", payload)
    //   }
    // })
    // this.ias?.setClickOnShareStoryCallback(object : ClickOnShareStoryCallback {
    //   override fun shareClick(
    //     slide: SlideData?
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to slide?.story?.feed, "index" to slide?.index, "id" to slide?.story?.id

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "clickOnShareStory", payload)
    //     Log.d("InappstorySdkModule", "clickOnShareStory slide = $slide");
    //   }
    // })
    // this.ias?.setOnboardingLoadCallback(object : OnboardingLoadCallback {
    //   override fun onboardingLoadSuccess(count: Int, feed: String?) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "count" to count,
    //         "feed" to feed,

    //         ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "onboardingLoad", payload)
    //     Log.d("InappstorySdkModule", "onboardingLoadSuccess count = $count, feed = $feed");
    //   }

    //   override fun onboardingLoadError(feed: String?, reason: String?) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to feed,
    //         "reason" to reason,
    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "loadOnboardingError", payload)
    //     Log.d("InappstorySdkModule", "loadOnboardingError reason = $reason, feed = $feed");
    //   }

    // })
    // this.ias?.setSingleLoadCallback(object : SingleLoadCallback {
    //   override fun singleLoadSuccess(story: StoryData?) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "id" to story?.id,
    //         "feed" to story?.feed,

    //         ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "singleLoad", payload)
    //     Log.d("InappstorySdkModule", "singleLoadSuccess story = $story");
    //   }

    //   override fun singleLoadError(storyId: String?, reason: String?) {
    //     //val payload:WritableMap = Arguments.createMap()
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "id" to storyId,
    //         "reason" to reason,

    //         ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "loadSingleError", payload)
    //     Log.d("InappstorySdkModule", "loadSingleError storyId = $storyId, reason = $reason");
    //   }
    // })
    // this.ias?.setStoryWidgetCallback(object : StoryWidgetCallback {
    //   override fun widgetEvent(
    //     slideData: SlideData?,
    //     widgetEventName: String?,
    //     widgetData: Map<String, String?>?,
    //     //feed: String?
    //   ) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to slideData?.story?.feed,
    //         "id" to slideData?.story?.id,
    //         "name" to widgetEventName,
    //         "data" to widgetData
    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "storyWidgetEvent", payload)
    //     Log.d(
    //       "InappstorySdkModule",
    //       "storyWidget story = $slideData, widgetEventName = $widgetEventName, widgetData = $widgetData"
    //     );
    //   }
    // })
    // this.ias?.setGameReaderCallback(object : GameReaderCallback {
    //   override fun startGame(
    //     content: ContentData?, id: String?
    //   ) {
    //     if (content is GameStoryData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "storyID" to content?.slideData?.story?.id,
    //           "index" to content?.slideData?.index,
    //           "id" to id
    //         ) as Map<String, Any>
    //       )
    //       sendEvent(getReactApplicationContext(), "startGame", payload)
    //     }
    //   }

    //   override fun finishGame(
    //     content: ContentData?, result: String?, id: String?
    //   ) {
    //     if (content is GameStoryData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "storyID" to content?.slideData?.story?.id,
    //           "index" to content?.slideData?.index,
    //           "result" to result,
    //           "id" to id
    //         ) as Map<String, Any>
    //       )
    //       sendEvent(getReactApplicationContext(), "finishGame", payload)
    //     }
    //   }

    //   override fun closeGame(
    //     content: ContentData?, id: String?
    //   ) {
    //     if (content is GameStoryData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "storyID" to content?.slideData?.story?.id,
    //           "index" to content?.slideData?.index,
    //           "id" to id
    //         ) as Map<String, Any>
    //       )
    //       sendEvent(getReactApplicationContext(), "closeGame", payload)
    //     }
    //   }

    //   override fun gameLoadError(
    //     content: ContentData?, id: String?
    //   ) {
    //     if (content is GameStoryData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "storyID" to content?.slideData?.story?.id,
    //           "index" to content?.slideData?.index,
    //           "id" to id
    //         ) as Map<String, Any>
    //       )
    //       sendEvent(getReactApplicationContext(), "gameFailure", payload)
    //       Log.d("InappstorySdkModule", "gameLoadError gameStoryData = $content, id = $id");
    //     }
    //   }

    //   override fun gameOpenError(
    //     content: ContentData?, id: String?
    //   ) {
    //     if (content is GameStoryData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "storyID" to content?.slideData?.story?.id,
    //           "index" to content?.slideData?.index,
    //           "id" to id
    //         ) as Map<String, Any>
    //       )
    //       sendEvent(getReactApplicationContext(), "gameFailure", payload)
    //       Log.d("InappstorySdkModule", "gameOpenError gameStoryData = $content, id = $id");
    //     }
    //   }

    //   override fun eventGame(
    //     content: ContentData?, id: String?, id2: String?, id3: String?
    //   ) {
    //     if (content is GameStoryData) {
    //       var payload = Arguments.makeNativeMap(
    //         mutableMapOf(
    //           "storyID" to content?.slideData?.story?.id,
    //           "index" to content?.slideData?.index,
    //           "id" to id,
    //           "id2" to id2,
    //           "id3" to id3
    //         ) as Map<String, Any>
    //       )
    //       sendEvent(getReactApplicationContext(), "eventGame", payload)
    //       Log.d(
    //         "InappstorySdkModule",
    //         "eventGame gameStoryData = $content, id = $id , id2 = $id2 , id3 = $id3"
    //       );
    //     }
    //   }
    // })
    // this.ias?.setErrorCallback(object : ErrorCallback {
    //   override fun loadListError(feed: String?) {
    //     var payload = Arguments.makeNativeMap(
    //       mutableMapOf(
    //         "feed" to feed
    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "loadListError", payload)
    //     Log.d("InappstorySdkModule", "loadListError feed = $feed");
    //   }

    //   override fun cacheError() {
    //     val payload: WritableMap = Arguments.createMap()
    //     sendEvent(getReactApplicationContext(), "cacheError", payload)
    //     Log.d("InappstorySdkModule", "cacheError");
    //   }

    //   //override fun readerError() {
    //   //    val payload:WritableMap = Arguments.createMap()
    //   //    sendEvent(reactContext,"readerError", payload)
    //   //    Log.d("InappstorySdkModule","readerError");
    //   //}

    //   override fun emptyLinkError() {
    //     val payload: WritableMap = Arguments.createMap()
    //     sendEvent(getReactApplicationContext(), "emptyLinkError", payload)
    //     Log.d("InappstorySdkModule", "emptyLinkError");
    //   }

    //   override fun sessionError() {
    //     val payload: WritableMap = Arguments.createMap()
    //     sendEvent(getReactApplicationContext(), "sessionError", payload)
    //     Log.d("InappstorySdkModule", "sessionError");
    //   }

    //   override fun noConnection() {
    //     val payload: WritableMap = Arguments.createMap()
    //     sendEvent(getReactApplicationContext(), "noConnection", payload)
    //     Log.d("InappstorySdkModule", "noConnection");
    //   }

    // })
  }

//  fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
//    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
//      .emit(eventName, params)
//  }

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
      sandbox,
    )
    inAppStoryAPI.settings.sendStatistic(sendStatistic)

    InAppStoryManager.logger = IASLoggerImpl()
  }

  fun subscribeLists(inAppStoryAPI: InAppStoryAPI, feed: String, uniqueId: String = feed) {
    inAppStoryAPI.addSubscriber(object : InAppStoryAPIListSubscriber(uniqueId) {
      override fun updateFavoriteItemData(favorites: List<StoryFavoriteItemAPIData>) {
        Log.e(TAG, "$feed updateFavoriteItemData: $favorites")
        // Push model: the SDK fires this whenever the favorites set changes
        // (e.g. toggled in the reader). The snapshot only carries ids
        // (imageFilePath is null), so use it as a trigger and reload the
        // favorites list, which repopulates the cell with real covers via the
        // favorites subscriber's updateStoriesData/updateStoryData. Guard on the
        // id set so the reload's own callbacks can't loop.
        val ids = favorites.map { it.id }.toSet()
        if (ids == lastFavoriteIds) return
        lastFavoriteIds = ids
        getFavoriteStories("default")
      }

      override fun updateStoryData(story: StoryAPIData, sessionData: IASStoryListSessionData) {
        val aspectRatio = sessionData.previewAspectRatio();
        Log.e(TAG, "aspect ratio return $aspectRatio ")
        Log.e(TAG, "updateStoryData: $story")

        // JS keys the store by `feed + '_' + list`. Match iOS: main feed ->
        // feed=<slug>, list="feed"; favorites -> feed="default", list="favorites".
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
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitOnStoryUpdate(payload)
        else sendLegacyEvent("onStoryUpdate", payload)

        //sendEvent(getReactApplicationContext(), "storyUpdate", payload)
      }

      override fun updateStoriesData(
        stories: List<StoryAPIData>, sessionData: IASStoryListSessionData
      ) {
        Log.e(TAG, "$feed updateStoriesData: $stories")
        val aspectRatio = sessionData.previewAspectRatio();
        Log.e(TAG, "aspect ratio return $aspectRatio ")

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
        //map.putString("key1", "Value1");
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitOnStoryListUpdate(payload)
        else sendLegacyEvent("onStoryListUpdate", payload)


        // The SDK only downloads covers for previews reported as visible. For the
        // main feed JS does this via setVisibleWith; the favorites cell never
        // reports visibility, so mark the loaded favorites visible here to make
        // their covers download (arriving later via updateStoryData).
        if (feed == "favorites") {
          inAppStoryAPI.storyList.updateVisiblePreviews(stories.map { it.id }, "favorites")
        }
        //sendEvent(getReactApplicationContext(), "storyListUpdate", payload)
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
        FeedEventsModule.instance?.emitReaderDidClose(feed)
      }

      override fun readerIsOpened() {
        Log.e(TAG, "$feed readerIsOpened")
        FeedEventsModule.instance?.emitReaderWillShow(feed)
      }
    })
  }
}
