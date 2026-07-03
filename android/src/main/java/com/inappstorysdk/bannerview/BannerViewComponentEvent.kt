package com.inappstorysdk.bannerview

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class BannerViewComponentEvent(surfaceId: Int, viewTag: Int) : Event<BannerViewComponentEvent>() {
    private val kEventName = "onUpdate"

    init {
        super.init(surfaceId, viewTag)
    }

    override fun getEventData(): WritableMap? {
        val event = Arguments.createMap()
        event.putBoolean("isPressed", true)
        return event
    }

    override fun getEventName(): String {
        return kEventName
    }
}