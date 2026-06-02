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

    // Prop setters only store values on the view. The appearance is rebuilt and
    // applied once in onAfterUpdateTransaction, after the whole batch is set.

    @ReactProp(name = "placeId")
    fun setPlaceId(view: BannerViewComponent, placeId: String) {
        view.placeId = placeId
    }

    @ReactProp(name = "shouldLoop")
    fun setShouldLoop(view: BannerViewComponent, shouldLoop: Boolean) {
        view.shouldLoop = shouldLoop
    }

    @ReactProp(name = "sideInset")
    fun setSideInset(view: BannerViewComponent, sideInset: Float) {
        view.sideInset = sideInset
    }

    @ReactProp(name = "leadingInset")
    fun setLeadingInset(view: BannerViewComponent, leadingInset: Float) {
        view.leadingInset = leadingInset
    }

    @ReactProp(name = "trailingInset")
    fun setTrailingInset(view: BannerViewComponent, trailingInset: Float) {
        view.trailingInset = trailingInset
    }

    @ReactProp(name = "interItemSpacing")
    fun setInterItemSpacing(view: BannerViewComponent, interItemSpacing: Float) {
        view.interItemSpacing = interItemSpacing
    }

    @ReactProp(name = "cornerRadius")
    fun setCornerRadius(view: BannerViewComponent, cornerRadius: Float) {
        view.cornerRadius = cornerRadius
    }

    override fun onAfterUpdateTransaction(view: BannerViewComponent) {
        super.onAfterUpdateTransaction(view)
        view.applyAppearanceAndLoad()
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
        return MapBuilder.builder<String, Any>()
            .put("onScroll", MapBuilder.of("registrationName", "onScroll"))
            .put("onPlaceLoaded", MapBuilder.of("registrationName", "onPlaceLoaded"))
            .build() as MutableMap<String, Any>
    }
}