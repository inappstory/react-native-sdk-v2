import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeSystemEventsImpl)
public class NativeSystemEventsImpl: NSObject {

  @objc public static let shared = NativeSystemEventsImpl()

  private var handleCTACallback: (([String: Any]) -> Void)?

  override init() {
    super.init()
  }

  @objc public func setupSystemEvents(
    handleCTA: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupSystemEvents")
    self.handleCTACallback = handleCTA
    InAppStory.shared.onActionWith = { [weak self] target, type, _ in
      var typeString = ""
      switch type {
      case .button: typeString = "button"
      case .swipe: typeString = "swipe"
      case .game: typeString = "game"
      case .deeplink: typeString = "deeplink"
      @unknown default: typeString = "unknown"
      }
      self?.emitCTA(url: target, action: typeString)
    }
  }

  @objc public func emitCTA(url: String, action: String) {
    self.handleCTACallback?([
      "withName": "handleCTA",
      "body": [
        "url": url,
        "action": action,
      ],
    ])
  }
}
