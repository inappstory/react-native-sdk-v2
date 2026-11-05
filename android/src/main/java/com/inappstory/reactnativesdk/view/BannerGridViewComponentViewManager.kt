package com.inappstory.reactnativesdk.view

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class BannerGridViewComponentViewManager : SimpleViewManager<BannerGridViewComponent>() {
    override fun getName() = "BannerGridView"

    override fun createViewInstance(context: ThemedReactContext) =
        BannerGridViewComponent(context)

    @ReactProp(name = "placeId")
    fun setPlaceId(view: BannerGridViewComponent, value: String?) {
        view.placeId = value
    }

    @ReactProp(name = "columnSpacing")
    fun setColumnSpacing(view: BannerGridViewComponent, value: Float) {
        view.columnSpacing = value
    }

    @ReactProp(name = "rowSpacing")
    fun setRowSpacing(view: BannerGridViewComponent, value: Float) {
        view.rowSpacing = value
    }

    @ReactProp(name = "sideInset")
    fun setSideInset(view: BannerGridViewComponent, value: Float) {
        view.sideInset = value
    }

    @ReactProp(name = "leadingInset")
    fun setLeadingInset(view: BannerGridViewComponent, value: Float) {
        view.leadingInset = value
    }

    @ReactProp(name = "trailingInset")
    fun setTrailingInset(view: BannerGridViewComponent, value: Float) {
        view.trailingInset = value
    }

    @ReactProp(name = "interItemSpacing")
    fun setInterItemSpacing(view: BannerGridViewComponent, value: Float) {
        view.interItemSpacing = value
    }

    @ReactProp(name = "cornerRadius")
    fun setCornerRadius(view: BannerGridViewComponent, value: Float) {
        view.cornerRadius = value
    }

    override fun onAfterUpdateTransaction(view: BannerGridViewComponent) {
        super.onAfterUpdateTransaction(view)
        view.applyAppearanceAndLoad()
    }

    override fun onDropViewInstance(view: BannerGridViewComponent) {
        view.dispose()
        super.onDropViewInstance(view)
    }

    override fun getCommandsMap() = mapOf("refresh" to 1)

    override fun receiveCommand(view: BannerGridViewComponent, commandId: Int, args: ReadableArray?) {
        if (commandId == 1) view.refresh()
    }

    override fun receiveCommand(view: BannerGridViewComponent, commandId: String, args: ReadableArray?) {
        if (commandId == "refresh") view.refresh()
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
        MapBuilder.builder<String, Any>()
            .put("onPlaceLoaded", MapBuilder.of("registrationName", "onPlaceLoaded"))
            .build() as MutableMap<String, Any>
}
