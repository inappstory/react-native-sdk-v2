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
    handleCTA: @escaping ([String: Any]) -> Void,
    failure: @escaping ([String: Any]) -> Void
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

    InAppStory.shared.failureEvent = { failureEvent in
      switch failureEvent {
      case .sessionFailure(let message):
        failure(["withName": "sessionFailure", "body": ["message": message]])
      case .storyFailure(let message):
        failure(["withName": "storyFailure", "body": ["message": message]])
      case .currentStoryFailure(let message):
        failure(["withName": "currentStoryFailure", "body": ["message": message]])
      case .networkFailure(let message):
        failure(["withName": "networkFailure", "body": ["message": message]])
      case .requestFailure(let message, let statusCode):
        failure([
          "withName": "requestFailure",
          "body": ["message": message, "statusCode": statusCode],
        ])
      @unknown default:
        NSLog("WARNING: unknown failureEvent")
      }
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
