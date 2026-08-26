import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeBannerEventsImpl)
public class NativeBannerEventsImpl: NSObject {

  @objc public static let shared = NativeBannerEventsImpl()

  override init() {
    super.init()
  }

  @objc public func setupBannerEvents(
    bannerWidgetEvent: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupBannerEvents")
    InAppStory.shared.iasBannerEvent = { event in
      switch event {
      case .bannersLoaded:
        break
      case .preloaded:
        break
      case .show:
        break
      case .clickOnButton(_, let link):
        NativeSystemEventsImpl.shared.emitCTA(url: link, action: "deeplink")
      case .widgetEvent(let bannerData, let name, let data):
        bannerWidgetEvent([
          "withName": "bannerWidgetEvent",
          "body": [
            "bannerData": [
              "id": bannerData.id,
              "bannerPlace": bannerData.placeID,
              "payload": NSNull(),
            ],
            "name": name,
            "data": data as Any,
          ],
        ])
      @unknown default:
        break
      }
    }
  }
}
