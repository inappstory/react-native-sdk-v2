import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeGoodsEventsImpl)
public class NativeGoodsEventsImpl: NSObject {

  @objc public static let shared = NativeGoodsEventsImpl()

  // Filled from addProductToCache after JS resolves the SKUs; flushed to the
  // SDK in commitGoods. Mirrors Android's goodsCache/goodsCallback.
  private var goodsCache: [GoodObject] = []
  private var goodsComplete: GoodsComplete?

  private var cartCompletes:
    [String: (Result<InAppStorySDK.ProductCart, Error>) -> Void] = [:]
  private var cartRequestSeq = 0

  override init() {
    super.init()
  }

  @objc public func setupGoodsEvents(
    getGoodsObject: @escaping ([String: Any]) -> Void,
    goodItemSelected: @escaping ([String: Any]) -> Void,
    cartEvent: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupGoodsEvents")

    InAppStoryAPI.shared.callbacksAPI.productCartUpdate = {
      [weak self] offer, complete in
      guard let self else { return }
      let requestId = self.storeCartComplete(complete)
      cartEvent([
        "withName": "productCartUpdate",
        "body": [
          "requestId": requestId,
          "offer": self.offerToMap(offer),
        ],
      ])
    }

    InAppStoryAPI.shared.callbacksAPI.productCartClicked = {
      cartEvent(["withName": "productCartClicked", "body": [:]])
    }

    InAppStoryAPI.shared.callbacksAPI.productCartGetState = {
      [weak self] complete in
      guard let self else { return }
      let requestId = self.storeCartComplete(complete)
      cartEvent([
        "withName": "productCartGetState",
        "body": ["requestId": requestId],
      ])
    }
    InAppStory.shared.getGoodsObject = { [weak self] skus, complete in
      self?.goodsCache = []
      self?.goodsComplete = complete
      getGoodsObject([
        "withName": "getGoodsObject",
        "body": ["skus": skus],
      ])
    }

    InAppStory.shared.goodItemSelected = { item, _ in
      goodItemSelected([
        "withName": "goodItemSelected",
        "body": ["sku": item.sku as Any],
      ])
      InAppStory.shared.closeReader {}
    }
  }

  @objc public func addProductToCache(
    _ sku: String,
    title: String,
    subtitle: String,
    imageURL: String,
    price: String,
    oldPrice: String
  ) {
    let goodObject = GoodObject(
      sku: sku,
      title: title,
      subtitle: subtitle,
      imageURL: URL(string: imageURL),
      price: price,
      oldPrice: oldPrice
    )
    self.goodsCache.append(goodObject)
  }

  @objc public func commitGoods() {
    self.goodsComplete?(.success(self.goodsCache))
    self.goodsCache = []
    self.goodsComplete = nil
  }

  @objc public func resolveProductCart(_ requestId: String, cart: [String: Any]?) {
    guard let complete = cartCompletes.removeValue(forKey: requestId) else {
      return
    }
    guard let cart else {
      complete(
        .failure(
          NSError(
            domain: "InappstorySdk",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "Product cart is empty or null"]
          )
        )
      )
      return
    }
    let offers = (cart["offers"] as? [[String: Any]] ?? []).map(offerFromMap)
    complete(
      .success(
        InAppStorySDK.ProductCart(
          offers: offers,
          price: cart["price"] as? String ?? "",
          oldPrice: cart["oldPrice"] as? String,
          priceCurrency: cart["priceCurrency"] as? String ?? ""
        )
      )
    )
  }

  private func storeCartComplete(
    _ complete: @escaping (Result<InAppStorySDK.ProductCart, Error>) -> Void
  ) -> String {
    cartRequestSeq += 1
    let requestId = "cart_\(cartRequestSeq)"
    cartCompletes[requestId] = complete
    return requestId
  }

  private func offerToMap(_ offer: InAppStorySDK.ProductCartOffer) -> [String: Any] {
    return [
      "offerId": offer.offerId ?? "",
      "groupId": offer.groupId ?? "",
      "name": offer.name ?? "",
      "description": offer.description ?? "",
      "url": offer.url ?? "",
      "coverUrl": offer.coverUrl ?? "",
      "imageUrls": offer.imageUrls ?? [],
      "currency": offer.currency ?? "",
      "price": offer.price ?? "",
      "oldPrice": offer.oldPrice ?? "",
      "adult": offer.adult ?? false,
      "availability": offer.availability,
      "size": offer.size ?? "",
      "color": offer.color ?? "",
      "quantity": offer.quantity,
    ]
  }

  private func offerFromMap(_ map: [String: Any]) -> InAppStorySDK.ProductCartOffer {
    return InAppStorySDK.ProductCartOffer(
      offerId: map["offerId"] as? String ?? "",
      groupId: map["groupId"] as? String,
      name: map["name"] as? String ?? "",
      description: map["description"] as? String,
      url: map["url"] as? String,
      coverUrl: map["coverUrl"] as? String,
      imageUrls: map["imageUrls"] as? [String] ?? [],
      currency: map["currency"] as? String,
      price: map["price"] as? String,
      oldPrice: map["oldPrice"] as? String,
      adult: map["adult"] as? Bool,
      availability: map["availability"] as? Int ?? 0,
      size: map["size"] as? String,
      color: map["color"] as? String,
      quantity: map["quantity"] as? Int ?? 0
    )
  }
}
