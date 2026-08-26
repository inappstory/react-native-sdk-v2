import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeGameEventsImpl)
public class NativeGameEventsImpl: NSObject {

  @objc public static let shared = NativeGameEventsImpl()

  override init() {
    super.init()
  }

  @objc(setupGameEventsWithEmit:)
  public func setupGameEvents(
    emit: @escaping ([String: Any]) -> Void
  ) {
    NSLog("setupGameEvents")
    InAppStory.shared.gameEvent = { gameEvent in
      switch gameEvent {
      case .startGame(let gameData):
        emit([
          "withName": "startGame",
          "body": [
            "gameID": gameData.gameID,
            "id": storyIDForJS(gameData.slideData?.storyData?.id),
            "feed": gameData.slideData?.storyData?.feed ?? "",
          ],
        ])
      case .closeGame(let gameData):
        emit([
          "withName": "closeGame",
          "body": [
            "gameID": gameData.gameID,
            "id": storyIDForJS(gameData.slideData?.storyData?.id),
            "feed": gameData.slideData?.storyData?.feed ?? "",
          ],
        ])
      case .eventGame(let gameData, let name, let payload):
        emit([
          "withName": "eventGame",
          "body": [
            "gameID": gameData.gameID,
            "id": storyIDForJS(gameData.slideData?.storyData?.id),
            "feed": gameData.slideData?.storyData?.feed ?? "",
            "name": name,
            "payload": payload,
          ],
        ])
      case .gameFailure(let gameData, let message):
        emit([
          "withName": "gameFailure",
          "body": [
            "gameID": gameData.gameID,
            "id": storyIDForJS(gameData.slideData?.storyData?.id),
            "feed": gameData.slideData?.storyData?.feed ?? "",
            "message": message,
          ],
        ])
      @unknown default:
        NSLog("WARNING: unknown gameEvent")
      }
    }
  }
}
