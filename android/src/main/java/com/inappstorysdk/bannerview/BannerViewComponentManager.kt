package com.inappstorysdk.bannerview

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class BannerViewComponentViewManager : SimpleViewManager<BannerViewComponent>() {
    override fun getName(): String {
        return "BannerView"
    }

    override fun createViewInstance(reactContext: ThemedReactContext): BannerViewComponent {
        return BannerViewComponent(reactContext)
    }

    @ReactProp(name = "placeId")
    fun setPlaceId(view: BannerViewComponent, placeId: String) {
        view.setPlaceId(placeId)
    }

    override fun getCommandsMap(): Map<String, Int> {
        return mapOf(
            "pause" to 1,
            "resume" to 2,
            "showNext" to 3,
            "showPrevious" to 4,
            "showBannerWith" to 5
        )
    }

    override fun receiveCommand(view: BannerViewComponent, commandId: Int, args: ReadableArray?) {
        when (commandId) {
            1 -> view.pause()
            2 -> view.resume()
            3 -> view.showNext()
            4 -> view.showPrevious()
            5 -> args?.let { view.showBannerWith(it.getInt(0)) }
        }
    }

    override fun receiveCommand(view: BannerViewComponent, commandId: String, args: ReadableArray?) {
        when (commandId) {
            "pause" -> view.pause()
            "resume" -> view.resume()
            "showNext" -> view.showNext()
            "showPrevious" -> view.showPrevious()
            "showBannerWith" -> args?.let { view.showBannerWith(it.getInt(0)) }
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.of(
            "onUpdate", MapBuilder.of("registrationName", "onUpdate")
        )
    }
}