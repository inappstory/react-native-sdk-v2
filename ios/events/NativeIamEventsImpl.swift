import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeIamEventsImpl)
public class NativeIamEventsImpl: NSObject {

  @objc public static let shared = NativeIamEventsImpl()

  override init() {
    super.init()
  }

  private func iamBody(_ iamData: InAppMessageData) -> [String: Any] {
    return [
      "id": Int(iamData.id ?? "0") ?? 0,
    ]
  }

  @objc(setupIamEventsWithEmit:)
  public func setupIamEvents(
    emit: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupIamEvents")
    InAppStory.shared.inAppMessagesEvent = { event in
      switch event {
      case .preloaded:
        break
      case .show(let iamData):
        emit(["withName": "showInAppMessage", "body": self.iamBody(iamData)])
      case .showSlide:
        break
      case .close(let iamData):
        emit(["withName": "closeInAppMessage", "body": self.iamBody(iamData)])
      case .clickOnButton(_, let link):
        // Route IAM button clicks through the shared CTA pipeline (parity with
        // story/game CTA handling in JS).
        NativeSystemEventsImpl.shared.emitCTA(url: link, action: "button")
      case .widgetEvent(let iamData, let name, let data):
        emit([
          "withName": "inAppMessageWidgetEvent",
          "body": [
            "inAppMessageData": self.iamBody(iamData),
            "name": name,
            "data": data ?? [:],
          ],
        ])
      @unknown default:
        NSLog("WARNING: unknown inAppMessagesEvent")
      }
    }
  }
}
