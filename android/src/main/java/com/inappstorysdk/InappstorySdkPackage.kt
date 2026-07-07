package com.inappstory.reactnativesdk

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.inappstorysdk.bannerview.BannerViewComponentViewManager
import java.util.HashMap

class InappstorySdkPackage : BaseReactPackage() {

  // BannerView is a legacy SimpleViewManager (used via requireNativeComponent on
  // both Paper and Fabric interop). Autolinking only instantiates this package,
  // so the view manager must be registered here, not in a separate package.
  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): MutableList<ViewManager<*, *>> = mutableListOf(BannerViewComponentViewManager())

 override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
  return when {
      name == AppearanceManagerModule.NAME -> AppearanceManagerModule(reactContext)
      name == StoryManagerModule.NAME -> StoryManagerModule(reactContext)
      name == StoriesEventsModule.NAME -> StoriesEventsModule(reactContext)
      name == FeedEventsModule.NAME -> FeedEventsModule(reactContext)
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
        true // isTurboModule
      )
      moduleInfos[AppearanceManagerModule.NAME] = ReactModuleInfo(
        AppearanceManagerModule.NAME,
        AppearanceManagerModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        true // isTurboModule
      )
      moduleInfos[StoriesEventsModule.NAME] = ReactModuleInfo(
        StoriesEventsModule.NAME,
        StoriesEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        true // isTurboModule
      )
      moduleInfos[FeedEventsModule.NAME] = ReactModuleInfo(
        FeedEventsModule.NAME,
        FeedEventsModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        true // isTurboModule
      )
      moduleInfos
    }
  }
}
