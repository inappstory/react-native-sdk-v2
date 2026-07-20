import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeFeedEventsImpl)
public class NativeFeedEventsImpl: NSObject {

  @objc public static let shared = NativeFeedEventsImpl()

  override init() {
    super.init()
  }

  @objc public func setupFeedEvents(
    storyReaderWillShow: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupFeedEvents")
    InAppStory.shared.storyReaderWillShow = { showed in
      switch showed {
      case .list(let feed):
        NSLog("storyReaderWillShow list")
        storyReaderWillShow([
          "withName": "storyReaderWillShow",
          "body": [
            "feed": feed,
            "type": "list",
          ],
        ])
      case .ugcList:
        storyReaderWillShow([
          "withName": "storyReaderWillShow",
          "body": [
            "type": "ugcList"
          ],
        ]
        )
      case .single:
        storyReaderWillShow([
          "withName": "storyReaderWillShow",
          "body": [
            "type": "single"
          ],
        ]
        )
      case .onboarding(let feed):
        storyReaderWillShow([
          "withName": "storyReaderWillShow",
          "body": [
            "feed": feed,
            "type": "onboarding",
          ],
        ]
        )
      @unknown default:
        NSLog("WARNING: unknown storyReaderWillShow")
      }
    }
  }
}
