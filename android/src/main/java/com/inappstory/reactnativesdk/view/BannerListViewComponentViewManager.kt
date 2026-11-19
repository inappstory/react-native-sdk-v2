package com.inappstory.reactnativesdk.view

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class BannerListViewComponentViewManager : SimpleViewManager<BannerListViewComponent>() {
    override fun getName() = "BannerListView"

    override fun createViewInstance(context: ThemedReactContext) = BannerListViewComponent(context)

    @ReactProp(name = "placeId")
    fun setPlaceId(view: BannerListViewComponent, value: String?) { view.placeId = value }

    @ReactProp(name = "sideInset", defaultFloat = 16f)
    fun setSideInset(view: BannerListViewComponent, value: Float) { view.sideInset = value }

    @ReactProp(name = "leadingInset", defaultFloat = 16f)
    fun setLeadingInset(view: BannerListViewComponent, value: Float) { view.leadingInset = value }

    @ReactProp(name = "trailingInset", defaultFloat = 16f)
    fun setTrailingInset(view: BannerListViewComponent, value: Float) { view.trailingInset = value }

    @ReactProp(name = "interItemSpacing", defaultFloat = 8f)
    fun setInterItemSpacing(view: BannerListViewComponent, value: Float) { view.interItemSpacing = value }

    @ReactProp(name = "cornerRadius", defaultFloat = 16f)
    fun setCornerRadius(view: BannerListViewComponent, value: Float) { view.cornerRadius = value }

    override fun onAfterUpdateTransaction(view: BannerListViewComponent) {
        super.onAfterUpdateTransaction(view)
        view.applyAppearanceAndLoad()
    }

    override fun onDropViewInstance(view: BannerListViewComponent) {
        view.dispose()
        super.onDropViewInstance(view)
    }

    override fun getCommandsMap() = mapOf("refresh" to 1, "pause" to 2, "resume" to 3)

    override fun receiveCommand(view: BannerListViewComponent, commandId: Int, args: ReadableArray?) {
        when (commandId) {
            1 -> view.refresh()
            2 -> view.pause()
            3 -> view.resume()
        }
    }

    override fun receiveCommand(view: BannerListViewComponent, commandId: String, args: ReadableArray?) {
        when (commandId) {
            "refresh" -> view.refresh()
            "pause" -> view.pause()
            "resume" -> view.resume()
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
        MapBuilder.builder<String, Any>()
            .put("onPlaceLoaded", MapBuilder.of("registrationName", "onPlaceLoaded"))
            .build() as MutableMap<String, Any>
}
