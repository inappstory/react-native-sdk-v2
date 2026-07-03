package com.inappstorysdk.bannerview

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

import java.util.*

class BannerViewComponentPackage : ReactPackage {

    override fun createViewManagers(reactContext: ReactApplicationContext)
            : MutableList<ViewManager<*, *>>
    {
        return mutableListOf(
                BannerViewComponentViewManager()
        )
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return Collections.emptyList()
    }
}