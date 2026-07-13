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

  @objc(setupStoryEventsWithEmit:)
  public func setupStoryEvents(
    emit: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupStoryEvents")
    InAppStory.shared.storiesEvent = { storiesEvent in
      switch storiesEvent {
      case .storiesLoaded:
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
        emit([
          "withName": "showStory",
          "body": [
            "id": storyData.id ?? "",
            "feed": storyData.feed,
            "action": actionString,
            "slidesCount": storyData.slidesCount,
          ],
        ])
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
        emit([
          "withName": "closeStory",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "feed": slideData.storyData?.feed ?? "",
            "index": slideData.index,
            "action": actionString,
          ],
        ])
      case .showSlide(let slideData):
        emit([
          "withName": "showSlide",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "index": slideData.index,
          ],
        ])
      case .likeStory(let slideData, let value):
        emit([
          "withName": "likeStory",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "feed": slideData.storyData?.feed ?? "",
            "index": slideData.index,
            "value": value,
          ],
        ])
      case .dislikeStory(let slideData, let value):
        emit([
          "withName": "dislikeStory",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "feed": slideData.storyData?.feed ?? "",
            "index": slideData.index,
            "value": value,
          ],
        ])
      case .favoriteStory(let slideData, let value):
        emit([
          "withName": "favoriteStory",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "feed": slideData.storyData?.feed ?? "",
            "index": slideData.index,
            "value": value,
          ],
        ])
      case .clickOnShareStory(let slideData):
        emit([
          "withName": "clickOnShareStory",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "feed": slideData.storyData?.feed ?? "",
            "index": slideData.index,
          ],
        ])
      case .storyWidgetEvent(let slideData, let name, let data):
        emit([
          "withName": "storyWidgetEvent",
          "body": [
            "id": slideData?.storyData?.id ?? "",
            "feed": slideData?.storyData?.feed ?? "",
            "name": name,
            "data": data ?? [:],
          ],
        ])
      case .clickOnButton(let slideData, let link):
        emit([
          "withName": "clickOnButton",
          "body": [
            "id": slideData.storyData?.id ?? "",
            "feed": slideData.storyData?.feed ?? "",
            "index": slideData.index,
            "url": link,
          ],
        ])
      case .ugcStoriesLoaded:
        break
      case .clickOnStory:
        break
      @unknown default:
        NSLog("WARNING: unknown storiesEvent")
      }
    }
  }
}
