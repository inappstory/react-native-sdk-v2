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

  override init() {
    super.init()
  }

  @objc public func setupGoodsEvents(
    getGoodsObject: @escaping ([String: Any]) -> Void,
    goodItemSelected: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupGoodsEvents")
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
}
