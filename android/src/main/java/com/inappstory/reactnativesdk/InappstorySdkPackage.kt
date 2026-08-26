package com.inappstory.reactnativesdk

import com.inappstory.reactnativesdk.modules.StoryManagerModule
import com.inappstory.reactnativesdk.modules.AppearanceManagerModule
import com.inappstory.reactnativesdk.events.StoriesEventsModule
import com.inappstory.reactnativesdk.events.FeedEventsModule
import com.inappstory.reactnativesdk.events.BannerEventsModule
import com.inappstory.reactnativesdk.events.GoodsEventsModule
import com.inappstory.reactnativesdk.events.SystemEventsModule
import com.inappstory.reactnativesdk.events.GameEventsModule
import com.inappstory.reactnativesdk.events.IamEventsModule

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.inappstory.reactnativesdk.view.BannerViewComponentViewManager
import java.util.HashMap

class InappstorySdkPackage : BaseReactPackage() {

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): MutableList<ViewManager<*, *>> = mutableListOf(BannerViewComponentViewManager())

 override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
  return when {
      name == AppearanceManagerModule.NAME -> AppearanceManagerModule(reactContext)
      name == StoryManagerModule.NAME -> StoryManagerModule(reactContext)
      name == StoriesEventsModule.NAME -> StoriesEventsModule(reactContext)
      name == FeedEventsModule.NAME -> FeedEventsModule(reactContext)
      name == BannerEventsModule.NAME -> BannerEventsModule(reactContext)
      name == GoodsEventsModule.NAME -> GoodsEventsModule(reactContext)
      name == SystemEventsModule.NAME -> SystemEventsModule(reactContext)
      name == GameEventsModule.NAME -> GameEventsModule(reactContext)
      name == IamEventsModule.NAME -> IamEventsModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[StoryManagerModule.NAME] = ReactModuleInfo(
        StoryManagerModule.NAME,
        StoryManagerModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[AppearanceManagerModule.NAME] = ReactModuleInfo(
        AppearanceManagerModule.NAME,
        AppearanceManagerModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[StoriesEventsModule.NAME] = ReactModuleInfo(
        StoriesEventsModule.NAME,
        StoriesEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[FeedEventsModule.NAME] = ReactModuleInfo(
        FeedEventsModule.NAME,
        FeedEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[BannerEventsModule.NAME] = ReactModuleInfo(
        BannerEventsModule.NAME,
        BannerEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[GoodsEventsModule.NAME] = ReactModuleInfo(
        GoodsEventsModule.NAME,
        GoodsEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[SystemEventsModule.NAME] = ReactModuleInfo(
        SystemEventsModule.NAME,
        SystemEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[GameEventsModule.NAME] = ReactModuleInfo(
        GameEventsModule.NAME,
        GameEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos[IamEventsModule.NAME] = ReactModuleInfo(
        IamEventsModule.NAME,
        IamEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED // isTurboModule
      )
      moduleInfos
    }
  }
}
