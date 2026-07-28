package com.inappstory.reactnativesdk

import android.content.Context
import android.graphics.drawable.Drawable
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.inappstory.sdk.AppearanceManager
import com.inappstory.sdk.InAppStoryManager
import com.inappstory.sdk.goods.outercallbacks.ProductCart
import com.inappstory.sdk.goods.outercallbacks.ProductCartInteractionCallback
import com.inappstory.sdk.goods.outercallbacks.ProductCartOffer
import com.inappstory.sdk.goods.outercallbacks.ProductCartUpdatedProcessCallback
import com.inappstory.sdk.stories.ui.views.goodswidget.GetGoodsDataCallback
import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsItemData
import com.inappstory.sdk.stories.ui.views.goodswidget.GoodsWidgetAppearanceAdapter
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

  private val cartCallbacks = mutableMapOf<String, ProductCartUpdatedProcessCallback>()
  private var cartRequestSeq = 0

  override fun getName(): String = NAME

  private fun sendLegacyEvent(name: String, payload: WritableMap) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, payload)
  }

  override fun setupGoodsEvents() {
    Log.d(NAME, "setupGoodsEvents")
    AppearanceManagerImpl.getAppearanceManager().csCustomGoodsWidget(object : ICustomGoodsWidget {
      override fun getWidgetView(context: Context): View? = null
      override fun getItem(): ICustomGoodsItem? = null
      override fun getDecoration(): RecyclerView.ItemDecoration? = null

      override fun getWidgetAppearance(): IGoodsWidgetAppearance? {
        val resId = AppearanceManagerImpl.goodsCloseIconResId
        if (resId == 0) return null
        return object : GoodsWidgetAppearanceAdapter() {
          init {
            context = reactApplicationContext
          }

          override fun getCloseButtonImage(): Drawable? =
            ContextCompat.getDrawable(reactApplicationContext, resId)
        }
      }

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

    InAppStoryManager.getInstance()?.setProductCartInteractionCallback(
      object : ProductCartInteractionCallback {
        override fun cartUpdate(
          offer: ProductCartOffer?,
          callback: ProductCartUpdatedProcessCallback?
        ) {
          if (callback == null) return
          dispatchCartRequest("productCartUpdate", callback) {
            putMap("offer", offerToMap(offer))
          }
        }

        override fun cartClicked() {
          dispatchCartEvent("productCartClicked", Arguments.createMap())
        }

        override fun cartGetState(callback: ProductCartUpdatedProcessCallback?) {
          if (callback == null) return
          dispatchCartRequest("productCartGetState", callback) {}
        }
      }
    )
  }

  override fun resolveProductCart(requestId: String, cart: ReadableMap?) {
    val callback = cartCallbacks.remove(requestId) ?: return
    if (cart == null) {
      callback.onError("Product cart is empty or null")
      return
    }
    callback.onSuccess(cartFromMap(cart))
  }

  private fun dispatchCartRequest(
    name: String,
    callback: ProductCartUpdatedProcessCallback,
    fillBody: WritableMap.() -> Unit
  ) {
    val requestId = "cart_" + (++cartRequestSeq)
    cartCallbacks[requestId] = callback
    dispatchCartEvent(name, Arguments.createMap().apply {
      putString("requestId", requestId)
      fillBody()
    })
  }

  private fun dispatchCartEvent(name: String, body: WritableMap) {
    val payload: WritableMap = Arguments.createMap().apply {
      putString("withName", name)
      putMap("body", body)
    }
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      when (name) {
        "productCartUpdate" -> emitProductCartUpdate(payload)
        "productCartClicked" -> emitProductCartClicked(payload)
        "productCartGetState" -> emitProductCartGetState(payload)
      }
    } else {
      sendLegacyEvent(name, payload)
    }
  }

  private fun offerToMap(offer: ProductCartOffer?): WritableMap =
    Arguments.createMap().apply {
      offer ?: return@apply
      putString("offerId", offer.offerId)
      putString("groupId", offer.groupId)
      putString("name", offer.name)
      putString("description", offer.description)
      putString("url", offer.url)
      putString("coverUrl", offer.coverUrl)
      putArray("imageUrls", Arguments.fromList(offer.imageUrls ?: emptyList<String>()))
      putString("currency", offer.currency)
      putString("price", offer.price)
      putString("oldPrice", offer.oldPrice)
      offer.adult?.let { putBoolean("adult", it) }
      putInt("availability", offer.availability)
      putString("size", offer.size)
      putString("color", offer.color)
      putInt("quantity", offer.quantity)
    }

  private fun offerFromMap(map: ReadableMap): ProductCartOffer =
    ProductCartOffer()
      .offerId(map.getString("offerId"))
      .groupId(map.getString("groupId"))
      .name(map.getString("name"))
      .description(map.getString("description"))
      .url(map.getString("url"))
      .coverUrl(map.getString("coverUrl"))
      .imageUrls(
        map.getArray("imageUrls")?.toArrayList()?.map { it.toString() } ?: emptyList()
      )
      .currency(map.getString("currency"))
      .price(map.getString("price"))
      .oldPrice(map.getString("oldPrice"))
      .adult(if (map.hasKey("adult")) map.getBoolean("adult") else null)
      .availability(if (map.hasKey("availability")) map.getInt("availability") else 0)
      .size(map.getString("size"))
      .color(map.getString("color"))
      .quantity(if (map.hasKey("quantity")) map.getInt("quantity") else 0)

  private fun cartFromMap(cart: ReadableMap): ProductCart {
    val offers = ArrayList<ProductCartOffer>()
    cart.getArray("offers")?.let { array ->
      for (i in 0 until array.size()) {
        array.getMap(i)?.let { offers.add(offerFromMap(it)) }
      }
    }
    return ProductCart()
      .offers(offers)
      .price(cart.getString("price"))
      .oldPrice(cart.getString("oldPrice"))
      .priceCurrency(cart.getString("priceCurrency"))
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
