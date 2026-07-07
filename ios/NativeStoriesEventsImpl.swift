import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeStoriesEventsImpl)
public class NativeStoriesEventsImpl: NSObject {

  @objc public static let shared = NativeStoriesEventsImpl()

  override init() {
    super.init()
  }

  @objc public func setupStoryEvents(
    onShowStory: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupStoryEvents")
    InAppStory.shared.storiesEvent = { storiesEvent in
      switch storiesEvent {
      case .storiesLoaded(let feed, let stories):
        break
      case .showStory(let storyData, let action):
        var actionString = ""
        switch action {
        case .swipe:
          actionString = "swipe"
        case .auto:
          actionString = "auto"
        case .custom:
          actionString = "custom"
        case .open:
          actionString = "open"
        case .tap:
          actionString = "tap"
        @unknown default:
          actionString = "unknown"
        }
        NSLog("showStory")
        onShowStory([
          "withName": "showStory",
          "body": [
            "id": storyData.id,
            "feed": storyData.feed,
            "action": actionString,
            "slidesCount": storyData.slidesCount,
          ],
        ]
        )
        break
      case .closeStory(let slideData, let action):
        var actionString = ""
        switch action {
        case .swipe:
          actionString = "swipe"
        case .click:
          actionString = "click"
        case .auto:
          actionString = "auto"
        case .custom:
          actionString = "custom"
        @unknown default:
          actionString = "unknown"
        }

        break
      case .showSlide(let slideData):

        break
      case .likeStory(let slideData, let value):

        break
      case .dislikeStory(let slideData, let value):

        break
      case .favoriteStory(let slideData, let value):

        break
      case .clickOnShareStory(let slideData):

        break
      case .storyWidgetEvent(let slideData, let name, let data):

        break
      case .ugcStoriesLoaded(let stories):
        break
      case .clickOnStory(let storyData, let index):
        break
      case .clickOnButton(let slideData, let link):
        break
      @unknown default:
        NSLog("WARNING: unknown storiesEvent")

      }
    }
  }
}
