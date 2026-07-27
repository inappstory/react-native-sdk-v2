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
import com.inappstory.sdk.stories.callbacks.IShowStoryOnceCallback
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
    apiKey: String, userID: String, userIdSign: String?, sandbox: Boolean, sendStatistics: Boolean,
    cacheSize: String?, anonymous: Boolean, promise: Promise
  ) {
    Log.d("InappstorySdkModule", "initWith")
    //this.ias = this.createInAppStoryManager(apiKey, userID)
    this.appearanceManager = AppearanceManagerImpl.getAppearanceManager()
    this.api = InAppStoryAPI()
    this.favoritesApi = InAppStoryAPI()
    val cacheSizeNative = when (cacheSize) {
      "small" -> CacheSize.SMALL
      "large" -> CacheSize.LARGE
      else -> CacheSize.MEDIUM
    }
    this.createManager(
      apiKey, userID, userIdSign, sandbox, sendStatistics, cacheSizeNative, anonymous,
      this.favoritesApi as InAppStoryAPI
    )
    this.createManager(
      apiKey, userID, userIdSign, sandbox, sendStatistics, cacheSizeNative, anonymous,
      this.api as InAppStoryAPI
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

  override fun addTags(tags: ReadableArray) {
    Log.d("InappstorySdkModule", "addTags")
    val list: ArrayList<String> = tags.toArrayList() as ArrayList<String>
    this.ias?.addTags(list)
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
    Log.d("InappstorySdkModule", "setLang: $lang")
    this.ias?.setLang(Locale.forLanguageTag(lang))
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

  override fun showOnboardings(
    feed: String,
    limit: Double,
    tags: ReadableArray?,
    operationId: String,
    promise: Promise
  ) {
    Log.d(TAG, "showOnboardings")
    reactContext.runOnUiQueueThread {
      try {
        val tagsList = tags?.toArrayList()?.map { it.toString() }
        cancellationTokenMap[operationId] = this.ias?.showOnboardingStories(
          limit.toInt(),
          feed,
          tagsList,
          reactContext.currentActivity as Context,
          this.appearanceManager
        )
        promise.resolve(true)
      } catch (e: Throwable) {
        promise.reject("showOnboardings error", e)
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

  override fun showIAMByEvent(
    event: String,
    onlyPreloaded: Boolean,
    operationId: String,
    promise: Promise
  ) {
    Log.d(TAG, "showIAMByEvent")
    reactContext.runOnUiQueueThread {
      try {
        val settings =
          InAppMessageOpenSettings().event(event).showOnlyIfLoaded(onlyPreloaded)

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
        promise.reject("showIAMByEvent error", e)
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

  override fun removeFromFavorite(storyID: String) {
    Log.d(TAG, "removeFromFavorite: $storyID")
    this.ias?.removeFromFavorite(storyID.toInt())
  }

  override fun removeAllFavorites() {
    Log.d(TAG, "removeAllFavorites")
    this.ias?.removeAllFavorites()
  }

  override fun favoritesCount(promise: Promise) {
    promise.resolve(lastFavoriteIds?.size ?: 0)
  }

  override fun logout() {
    Log.d(TAG, "logout")
    this.ias?.userLogout()
  }

  override fun setOptions(options: ReadableMap) {
    Log.d(TAG, "setOptions")
    val nativeMap: ReadableNativeMap = options as ReadableNativeMap
    @Suppress("UNCHECKED_CAST")
    this.ias?.setOptions(nativeMap.toHashMap() as Map<String, String>)
  }

  override fun showStoryOnce(storyID: String, operationId: String, promise: Promise) {
    Log.d(TAG, "showStoryOnce")
    reactContext.runOnUiQueueThread {
      try {
        cancellationTokenMap[operationId] = this.ias?.showStoryOnce(
          storyID,
          reactContext.currentActivity as Context,
          this.appearanceManager,
          object : IShowStoryOnceCallback {
            override fun onShow() {
              cancellationTokenMap.remove(operationId)
              promise.resolve(true)
            }

            override fun onError() {
              cancellationTokenMap.remove(operationId)
              promise.resolve(false)
            }

            override fun alreadyShown() {
              cancellationTokenMap.remove(operationId)
              promise.resolve(false)
            }
          }
        )
      } catch (e: Throwable) {
        promise.reject("showStoryOnce error", e)
      }
    }
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

    //   }

    //         ) as Map<String, Any>
    //       )

    //       ) as Map<String, Any>
    //     )
    //     sendEvent(getReactApplicationContext(), "likeStory", payload)
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
    cacheSize: Int,
    anonymous: Boolean,
    inAppStoryAPI: InAppStoryAPI
  ) {
    inAppStoryAPI.setExternalPlatform(ExternalPlatforms.REACT_NATIVE_SDK);
    this.ias = if (anonymous) {
      InAppStoryManager.Builder()
        .lang(Locale.getDefault())
        .sandbox(sandbox)
        .cacheSize(cacheSize)
        .gameDemoMode(false)
        .apiKey(apiKey)
        .anonymous(true)
        .create()
    } else {
      inAppStoryAPI.inAppStoryManager.create(
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
        cacheSize,
        sandbox,
      )
    }
    inAppStoryAPI.settings.sendStatistic(sendStatistic)

    InAppStoryManager.logger = IASLoggerImpl()
  }

  fun subscribeLists(inAppStoryAPI: InAppStoryAPI, feed: String, uniqueId: String = feed) {
    inAppStoryAPI.addSubscriber(object : InAppStoryAPIListSubscriber(uniqueId) {
      override fun updateFavoriteItemData(favorites: List<StoryFavoriteItemAPIData>) {
        Log.e(TAG, "$feed updateFavoriteItemData: $favorites")
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
