package com.inappstory.reactnativesdk

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstory.sdk.AppearanceManager
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.stories.ui.views.goodswidget.GetGoodsDataCallback
import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsItemData
import com.inappstory.sdk.stories.ui.views.goodswidget.ICustomGoodsItem
import com.inappstory.sdk.stories.ui.views.goodswidget.ICustomGoodsWidget
import com.inappstory.sdk.stories.ui.views.goodswidget.IGoodsWidgetAppearance

@ReactModule(name = GoodsEventsModule.NAME)
class GoodsEventsModule(reactContext: ReactApplicationContext) :
  NativeGoodsEventsSpec(reactContext) {

  companion object {
    const val NAME = "NativeGoodsEvents"
  }

  // Filled from the SDK's getSkus callback (JS resolves the SKUs, then pushes
  // products back via addProductToCache + commitGoods). Mirrors iOS' goodsCache.
  private var goodsCache: ArrayList<GoodsItemData> = ArrayList()
  private var goodsCallback: GetGoodsDataCallback? = null

  override fun getName(): String = NAME

  private fun sendLegacyEvent(name: String, payload: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, payload)
  }

  override fun setupGoodsEvents() {
    Log.d(NAME, "setupGoodsEvents")
    AppearanceManager.getCommonInstance().csCustomGoodsWidget(object : ICustomGoodsWidget {
      override fun getWidgetView(context: Context): View? = null
      override fun getItem(): ICustomGoodsItem? = null
      override fun getWidgetAppearance(): IGoodsWidgetAppearance? = null
      override fun getDecoration(): RecyclerView.ItemDecoration? = null

      override fun getSkus(
        widgetView: View,
        skus: ArrayList<String>,
        callback: GetGoodsDataCallback
      ) {
        goodsCache.clear()
        goodsCallback = callback
        dispatchGetGoodsObject(skus)
      }

      override fun onItemClick(
        widgetView: View,
        goodsItemView: View,
        goodsItemData: GoodsItemData,
        callback: GetGoodsDataCallback
      ) {
        dispatchGoodItemSelected(goodsItemData.sku)
        callback.onClose()
        InAppStoryManager.closeStoryReader()
      }
    })
  }

  override fun addProductToCache(
    sku: String,
    title: String,
    subtitle: String,
    imageURL: String,
    price: String,
    oldPrice: String
  ) {
    goodsCache.add(GoodsItemData(sku, title, subtitle, imageURL, price, oldPrice, sku))
  }

  override fun commitGoods() {
    val callback = this.goodsCallback
    val cache = this.goodsCache
    Handler(Looper.getMainLooper()).post {
      callback?.onSuccess(cache)
      cache.clear()
    }
    this.goodsCallback = null
  }

  private fun dispatchGetGoodsObject(skus: ArrayList<String>) {
    val body: WritableMap = Arguments.createMap().apply {
      putArray("skus", Arguments.fromList(skus))
    }
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", "getGoodsObject")
      putMap("body", body)
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitGetGoodsObject(payload)
    else sendLegacyEvent("getGoodsObject", payload)
  }

  private fun dispatchGoodItemSelected(sku: String) {
    val body: WritableMap = Arguments.createMap().apply {
      putString("sku", sku)
    }
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", "goodItemSelected")
      putMap("body", body)
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) emitGoodItemSelected(payload)
    else sendLegacyEvent("goodItemSelected", payload)
  }
}
