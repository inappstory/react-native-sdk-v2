import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeSystemEventsImpl)
public class NativeSystemEventsImpl: NSObject {

  @objc public static let shared = NativeSystemEventsImpl()

  private var handleCTACallback: (([String: Any]) -> Void)?

  // Logging is off by default and owned by the toggle below, so
  // `initWith` re-applies this state instead of forcing it off.
  private var loggingEnabled = false
  private var onLogCallback: (([String: Any]) -> Void)?

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

  @objc public func setLoggingEnabled(
    _ enabled: Bool,
    onLog: @escaping ([String: Any]) -> Void
  ) {
    self.loggingEnabled = enabled
    self.onLogCallback = enabled ? onLog : nil
    DispatchQueue.main.async { self.applyLogging() }
  }

  /// Pushes the current logging state onto the shared SDK instance. Called from
  /// the toggle and from `initWith`, so an SDK (re)init never resets the flag.
  /// Must run on the main queue. `logger` is non-optional, so disabling is done
  /// via `isLoggingEnabled` alone.
  @objc public func applyLogging() {
    InAppStory.shared.isLoggingEnabled = loggingEnabled
    if loggingEnabled, let onLog = onLogCallback {
      InAppStory.shared.logger = IASReactNativeLogger(onLog: onLog)
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

/// Forwards native SDK logs to JS as `onLog` events. `error` present → level
/// "error", otherwise "debug" (Android only distinguishes these two).
private final class IASReactNativeLogger: IASLoggerProtocol {
  var level: [IASLogLevel] = [.all]

  private let onLog: ([String: Any]) -> Void

  init(onLog: @escaping ([String: Any]) -> Void) {
    self.onLog = onLog
  }

  func log(object: IASLogObject) {
    let message = object.message ?? object.warning ?? object.error ?? object.cURL
    onLog([
      "withName": "onLog",
      "body": [
        "level": object.error != nil ? "error" : "debug",
        "message": message as Any,
      ],
    ])
  }
}
