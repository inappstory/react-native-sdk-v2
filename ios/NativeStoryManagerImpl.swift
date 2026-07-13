import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeStoryManagerImpl)
public class NativeStoryManagerImpl: NSObject {
  open func supportedEvents() -> [String] {
    [
      "storiesLoaded", "ugcStoriesLoaded", "showStory", "closeStory",
      "showSlide", "likeStory", "dislikeStory", "favoriteStory",
      "clickOnShareStory", "storyWidgetEvent",
      "startGame", "finishGame", "closeGame", "eventGame", "gameFailure",
      "gameReaderWillShow", "gameReaderDidClose", "gameComplete",
      "getGoodsObject",
      "storyListUpdate", "storyUpdate",
      "favoritesUpdate", "scrollUpdate",
      "storyReaderWillShow", "storyReaderDidClose", "sessionFailure",
      "storyFailure", "currentStoryFailure", "networkFailure", "requestFailure",
      "favoriteCellDidSelect", "editorCellDidSelect",
      "customShare", "onActionWith", "storiesDidUpdated", "goodItemSelected",
      "openStoryReader", "openStoryFavoriteReader", "clickOnFavoriteCell",
      "shareStoryWithPath", "handleCTA",
    ]  // etc.
  }

  @objc private var _hasLike: Bool = true
  @objc private var _hasFavorites: Bool = true
  @objc private var _hasShare: Bool = true
  @objc private var _userID: String = ""
  @objc private var _userIdSign: String? = nil
  @objc private var _lang: String = ""
  @objc private var _tags: [String] = [""]
  @objc private var goodsCache: [GoodObject] = []

  var storiesAPI = StoryListAPI()
  var favoriteStoriesAPI = StoryListAPI(isFavorite: true)

  @objc public static let shared = NativeStoryManagerImpl()

  override init() {
    super.init()
  }

  @objc public func initWith(
    _ apiKey: String,
    userID: String,
    userIdSign: String?,
    sandbox: Bool,
    sendStats: Bool,
    resolve: @escaping RCTPromiseResolveBlock, 
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      // the parameter is responsible for logging to the XCode console
      InAppStory.shared.isLoggingEnabled = false
      // the parameter is responsible for displaying the shading under cell headers
      InAppStory.shared.cellGradientEnabled = true
      // the parameter is responsible for the color of the cell gradient of the unread story.
      InAppStory.shared.cellBorderColor = UIColor.blue
      // the parameter is responsible for displaying the bottom panel in the story card (likes, favorites and share)
      // additionally should be configured in the console
      InAppStory.shared.panelSettings = PanelSettings(
        like: self._hasLike,
        favorites: self._hasFavorites,
        share: self._hasShare
      )
      // the parameter is responsible for animation of the reader display when you tap on a story cell
      InAppStory.shared.presentationStyle = .zoom

      InAppStoryAPI.shared.plaform = ExternalPlatforms.reactNative

      InAppStory.shared.sandBox = sandbox
      InAppStory.shared.isStatisticDisabled = !sendStats
      InAppStory.shared.initWith(
        serviceKey: apiKey,
        settings: Settings(userID: userID, sign: userIdSign)
      )

      // InAppStory.shared.storyReaderWillShow = {showed in
      //     switch showed {
      //     case .list(feed: let feed):
      //       NativeStoryManager.emitter.sendEvent(withName: "storyReaderWillShow", body: [
      //         "feed": feed,
      //         "type": "list",
      //       ])
      //     case .ugcList:
      //         NativeStoryManager.emitter.sendEvent(withName: "storyReaderWillShow", body: [
      //           "type": "ugcList",
      //         ])
      //     case .single:
      //         NativeStoryManager.emitter.sendEvent(withName: "storyReaderWillShow", body: [
      //           "type": "single",
      //         ])
      //     case .onboarding(feed: let feed):
      //         NativeStoryManager.emitter.sendEvent(withName: "storyReaderWillShow", body: [
      //           "feed": feed,
      //           "type": "onboarding",
      //         ])
      //     @unknown default:
      //         NSLog("WARNING: unknown storyReaderWillShow")
      //     }
      // }

      // InAppStory.shared.storyReaderDidClose = { showed in
      //     switch showed {
      //     case .list(feed: let feed):
      //       NativeStoryManager.emitter.sendEvent(withName: "storyReaderDidClose", body: [
      //         "feed": feed,
      //         "type": "list",
      //       ])
      //     case .ugcList:
      //         NativeStoryManager.emitter.sendEvent(withName: "storyReaderDidClose", body: [
      //           "type": "ugcList",
      //         ])
      //     case .single:
      //         NativeStoryManager.emitter.sendEvent(withName: "storyReaderDidClose", body: [
      //           "type": "single",
      //         ])
      //     case .onboarding(feed: let feed):
      //         NativeStoryManager.emitter.sendEvent(withName: "storyReaderDidClose", body: [
      //           "feed": feed,
      //           "type": "onboarding",
      //         ])
      //     @unknown default:
      //         NSLog("WARNING: unknown storyReaderDidClose")
      //     }
      // }
      // self.storiesAPI.favoritesUpdate = { showed in
      //     NativeStoryManager.emitter.sendEvent(withName: "favoritesUpdate", body: [
      //         "feed": showed,
      //     ])
      // }
      // self.storiesAPI.scrollUpdate = { showed in
      //     NativeStoryManager.emitter.sendEvent(withName: "scrollUpdate", body: [
      //         "index":showed
      //     ])
      // }
      // InAppStory.shared.gameEvent = { gameEvent in
      //     switch gameEvent {
      //     case .closeGame(gameData: let gameData):
      //         NativeStoryManager.emitter.sendEvent(withName: "closeGame", body: [
      //             "gameID": gameData.gameID,
      //             "id": gameData.slideData?.storyData?.id,
      //             "feed": gameData.slideData?.storyData?.feed,
      //         ])
      //     case .startGame(gameData: let gameData):
      //         NativeStoryManager.emitter.sendEvent(withName: "startGame", body: [
      //             "id": gameData.slideData?.storyData?.id,
      //             "gameID": gameData.gameID
      //         ])
      //     case .finishGame(gameData: let gameData, result: let result):
      //         NativeStoryManager.emitter.sendEvent(withName: "finishGame", body: [
      //             "id": gameData.slideData?.storyData?.id,
      //             "gameID": gameData.gameID,
      //             "result": result,
      //         ])
      //     case .eventGame(gameData: let gameData, name: let name, payload: let payload):
      //         NativeStoryManager.emitter.sendEvent(withName: "eventGame", body: [
      //             "id": gameData.slideData?.storyData?.id,
      //             "feed": gameData.slideData?.storyData?.feed,
      //             "gameID": gameData.gameID,
      //             "name": name,
      //             "payload": payload,
      //         ])
      //         print(gameData, name ,payload)
      //     case .gameFailure(gameData: let gameData, message: let message):
      //         NativeStoryManager.emitter.sendEvent(withName: "gameFailure", body: [
      //             "message": message,
      //             "gameID": gameData.gameID,
      //             "id": gameData.slideData?.storyData?.id
      //         ])

      //     @unknown default:
      //         NSLog("WARNING: unknown gameEvent")
      //     }
      // }
      // InAppStory.shared.getGoodsObject = { skus, complete in
      //       NativeStoryManager.emitter.sendEvent(withName: "getGoodsObject", body: ["skus":skus])
      //       Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { timer in
      //       let goodsCount = self.goodsCache.count
      //       if goodsCount > 0 {
      //         timer.invalidate()
      //         complete(.success(self.goodsCache))
      //         self.goodsCache = [];
      //       }
      //   }
      // }

      // InAppStory.shared.failureEvent = { failureEvent in
      //     switch failureEvent {
      //     case .sessionFailure(message: let message):
      //         NativeStoryManager.emitter.sendEvent(withName: "sessionFailure", body: [
      //           "message": message,
      //         ])
      //     case .storyFailure(message: let message):
      //         NativeStoryManager.emitter.sendEvent(withName: "storyFailure", body: [
      //           "message": message
      //         ])
      //     case .currentStoryFailure(message: let message):
      //         NativeStoryManager.emitter.sendEvent(withName: "currentStoryFailure", body: [
      //           "message": message,
      //         ])
      //     case .networkFailure(message: let message):
      //         NativeStoryManager.emitter.sendEvent(withName: "networkFailure", body: [
      //           "message": message
      //         ])
      //     case .requestFailure(message: let message, statusCode: let statusCode):
      //         NativeStoryManager.emitter.sendEvent(withName: "requestFailure", body: [
      //           "message": message,
      //           "statusCode": statusCode,
      //         ])
      //     @unknown default:
      //         NSLog("WARNING: unknown failureEvent")
      //     }
      // }
      // InAppStory.shared.gameReaderWillShow = {
      //   NativeStoryManager.emitter.sendEvent(withName: "gameReaderWillShow", body: [])
      // }
      // InAppStory.shared.gameReaderDidClose = {
      //   NativeStoryManager.emitter.sendEvent(withName: "gameReaderDidClose", body: [])
      // }
      // InAppStory.shared.gameComplete = { data, result, url in
      //     NativeStoryManager.emitter.sendEvent(withName: "gameComplete", body: [
      //         "data": data,
      //         "result": result ?? [:],
      //         "url": url ?? ""
      //     ])
      // }

      // InAppStory.shared.favoriteCellDidSelect = {
      //   NativeStoryManager.emitter.sendEvent(withName: "favoriteCellDidSelect", body: [])
      // }
      // InAppStory.shared.editorCellDidSelect = {
      //   NativeStoryManager.emitter.sendEvent(withName: "editorCellDidSelect", body: [])
      // }

      /*InAppStory.shared.customShare = { share, fn in
       NativeStoryManager.emitter.sendEvent(withName: "customShare", body: [])
       NSLog("TODO: customShare closure");
       }*/

      /*InAppStory.shared.onActionWith = { target, type, storyType in
       NativeStoryManager.emitter.sendEvent(withName: "onActionWith", body: [])
       NSLog("TODO: onActionWith closure");
       }*/

      // InAppStory.shared.storiesDidUpdated = { isContent, storyType in
      //   NativeStoryManager.emitter.sendEvent(withName: "storiesDidUpdated", body: [
      //     "isContent": isContent,
      //     "storyType": storyType,
      //   ])
      // }

      // InAppStory.shared.goodItemSelected = { item, storyType in
      //     var storyTypeString = "";
      //     var feedString = "";
      //     switch (storyType) {
      //         case .onboarding: storyTypeString = "onboarding"
      //         case .list(feed: let feed):
      //             storyTypeString = "list"
      //             feedString = feed ?? "default"
      //         case .ugcList:
      //             storyTypeString = "ugcList"
      //         case .single:
      //             storyTypeString = "single"
      //         case .none:
      //             storyTypeString = "none"
      //         @unknown default:
      //             storyTypeString = "none"
      //     }
      //   NativeStoryManager.emitter.sendEvent(withName: "goodItemSelected", body: [
      //     "sku":item.sku,
      //     "feed": feedString,
      //     "storyType": storyTypeString
      //   ])
      //     InAppStory.shared.closeReader() {

      //     }
      // }

      InAppStory.shared.stackFeedUpdate = { newFeed in
        NSLog("TODO: stackFeedUpdate closure")
      }

      // InAppStory.shared.storiesEvent = { storiesEvent in
      //     switch storiesEvent {
      //       case .storiesLoaded(feed: let feed, stories: let stories):
      //               NativeStoryManager.emitter.sendEvent(withName: "storiesLoaded", body: [
      //                   "feed": feed,
      //                   "stories": stories,
      //               ])
      //       case .showStory(storyData: let storyData, action: let action):
      //          var actionString = "";
      //          switch action {
      //          case .swipe:
      //              actionString = "swipe"
      //          case .auto:
      //              actionString = "auto"
      //          case .custom:
      //              actionString = "custom"
      //          case .open:
      //              actionString = "open"
      //          case .tap:
      //              actionString = "tap"
      //          @unknown default:
      //              actionString = "unknown"
      //          }
      //             NativeStoryManager.emitter.sendEvent(withName: "showStory", body: [
      //                 "id": storyData.id,
      //                 "feed": storyData.feed,
      //                 "action": actionString,
      //                 "slidesCount": storyData.slidesCount,
      //             ])
      //       case .closeStory(slideData: let slideData, action: let action):
      //             var actionString = "";
      //             switch action {
      //             case .swipe:
      //                 actionString = "swipe"
      //             case .click:
      //                 actionString = "click"
      //             case .auto:
      //                 actionString = "auto"
      //             case .custom:
      //                 actionString = "custom"
      //             @unknown default:
      //                 actionString = "unknown"
      //             }
      //             NativeStoryManager.emitter.sendEvent(withName: "closeStory", body: [
      //                 "id": slideData.storyData?.id,
      //                 "feed": slideData.storyData?.feed,
      //                 "index": slideData.index,
      //                 "action": actionString,
      //             ])

      //         case .showSlide(slideData: let slideData):
      //             NativeStoryManager.emitter.sendEvent(withName: "showSlide", body: [
      //               "id": slideData.storyData?.id,
      //               "index": slideData.index,
      //               "slidesCount": slideData.storyData?.slidesCount,
      //             ])

      //         case .likeStory(slideData: let slideData, value: let value):
      //             NativeStoryManager.emitter.sendEvent(withName: "likeStory", body: [
      //                 "feed": slideData.storyData?.feed,
      //                 "id": slideData.storyData?.id,
      //                 "value": value
      //             ])

      //         case .dislikeStory(slideData: let slideData, value: let value):
      //             NativeStoryManager.emitter.sendEvent(withName: "dislikeStory", body: [
      //               "feed": slideData.storyData?.feed,
      //               "id": slideData.storyData?.id,
      //               "value": value
      //             ])

      //         case .favoriteStory(slideData: let slideData, value: let value):
      //             NativeStoryManager.emitter.sendEvent(withName: "favoriteStory", body: [
      //               "feed": slideData.storyData?.feed,
      //               "id": slideData.storyData?.id,
      //               "value": value
      //             ])
      //         case .clickOnShareStory(slideData: let slideData):
      //             NativeStoryManager.emitter.sendEvent(withName: "clickOnShareStory", body: [
      //               "feed": slideData.storyData?.feed,
      //               "id": slideData.storyData?.id,
      //             ])
      //         case .storyWidgetEvent(slideData: let slideData, name: let name, data: let data):
      //             NativeStoryManager.emitter.sendEvent(withName: "storyWidgetEvent", body: [
      //                 "id": slideData?.storyData?.id,
      //                 "feed": slideData?.storyData?.feed,
      //                 "name": name,
      //                 "data": data
      //             ])
      //         case .ugcStoriesLoaded(stories: let stories):
      //             NativeStoryManager.emitter.sendEvent(withName: "ugcStoriesLoaded", body: [])

      //         @unknown default:
      //              NSLog("WARNING: unknown storiesEvent")

      //      }
      // }

      // InAppStory.shared.onActionWith = {target, type, storyType in
      //   var typeString = "";
      //   switch type {
      //     case .button:
      //         typeString = "button"
      //     case .swipe:
      //         typeString = "swipe"
      //     case .game:
      //         typeString = "game"
      //     case .deeplink:
      //         typeString = "deeplink"
      //     @unknown default:
      //         typeString = "unknown"
      //   }
      //   NativeStoryManager.emitter.sendEvent(withName: "handleCTA", body: [
      //     "url": target,
      //     "action": typeString
      //   ])
      // }

      /*
       InAppStory.shared.sizeForItem = { showed in
       NSLog("TODO: sizeForItem closure");
       return CGSize
       }
       InAppStory.shared.insetForSection = { showed in
       NSLog("TODO: sizeForItem closure");
       return UIEdgeInsets
       }
       InAppStory.shared.minimumLineSpacingForSection = { showed in
       NSLog("TODO: minimumLineSpacingForSection closure");
       return CGFloat
       }
       InAppStory.shared.minimumInteritemSpacingForSection = { showed in
       NSLog("TODO: minimumInteritemSpacingForSection closure");
       return CGFloat
       }
       InAppStory.shared.goodsSizeForItem = { showed in
       NSLog("TODO: goodsSizeForItem closure");
       return CGSize
       }
       InAppStory.shared.goodsInsetForSection = { showed in
       NSLog("TODO: goodsInsetForSection closure");
       return UIEdgeInsets
       }
       InAppStory.shared.goodsMinimumLineSpacingForSection = { showed in
       NSLog("TODO: goodsMinimumLineSpacingForSection closure");
       return CGFloat
       }
       */
      //    }

      // customization of appearance
      //FIXME: customization of goods cell
      /*InAppStory.shared.goodsCellMainTextColor: UIColor     = .black //color of cell labels
       InAppStory.shared.goodsCellDiscountTextColor: UIColor = .red //color of discount label
      
       //fonts of cell's labels
       InAppStory.shared.goodCellTitleFont: UIFont    = UIFont.systemFont(ofSize: 14.0, weight: .medium)
       InAppStory.shared.goodCellSubtitleFont: UIFont = UIFont.systemFont(ofSize: 12.0)
       InAppStory.shared.goodCellPriceFont: UIFont    = UIFont.systemFont(ofSize: 14.0, weight: .medium)
       InAppStory.shared.goodCellDiscountFont: UIFont = UIFont.systemFont(ofSize: 14.0, weight: .medium)
      
       //background color of close button
       InAppStory.shared.goodsCloseBackgroundColor: UIColor  = .white
       //goods list background color
       InAppStory.shared.goodsSubstrateColor: UIColor        = .white
      
       //image for refresh button
       InAppStory.shared.refreshGoodsImage: UIImage = UIImage(named: "refreshIcon")!
       //image for close button
       InAppStory.shared.goodsCloseImage: UIImage   = UIImage(named: "goodsClose")!*/
      // self.storiesAPI.storyListUpdate = {storiesList,isFavorite,feed in
      //     //print("storyListUpdate \(storiesList)");
      //     NativeStoryManager.emitter.sendEvent(withName: "storyListUpdate", body: [
      //       "stories": storiesList.map { [
      //         "storyID": $0.storyID,
      //         "storyData": $0.storyData,
      //         "title": $0.title,
      //         "coverImagePath": $0.coverImagePath,
      //         "coverVideoPath": $0.coverVideoPath,
      //         "backgroundColor": $0.backgroundColor,
      //         "titleColor": $0.titleColor,
      //         "opened": $0.opened,
      //         "hasAudio": $0.hasAudio,
      //         "list": "feed",
      //         "feed": feed,
      //         "aspectRatio": self.storiesAPI.cellRatio,
      //         "slidesCount": $0.storyData.slidesCount,
      //         "statTitle": $0.storyData.title,
      //       ]},
      //         "feed": feed,
      //         "list": "feed",
      //     ])}
      // self.storiesAPI.storyUpdate = {storyData in
      //     print("StoryUpdate = $storyData");
      //     NativeStoryManager.emitter.sendEvent(withName: "storyUpdate", body: [
      //       "storyID": storyData.storyID,
      //       "storyData": storyData.storyData,
      //       "title": storyData.title,
      //       "coverImagePath": storyData.coverImagePath,
      //       "coverVideoPath": storyData.coverVideoPath,
      //       "backgroundColor": storyData.backgroundColor,
      //       "titleColor": storyData.titleColor,
      //       "opened": storyData.opened,
      //       "hasAudio": storyData.hasAudio,
      //       "list": "feed",
      //       "feed": storyData.storyData.feed,
      //       "aspectRatio": self.storiesAPI.cellRatio,
      //       "slidesCount": storyData.storyData.slidesCount,
      //       "statTitle": storyData.storyData.title,
      //     ])
      // }
      // self.favoriteStoriesAPI.storyListUpdate = {storiesList,isFavorite, feed in
      //         NativeStoryManager.emitter.sendEvent(withName: "storyListUpdate", body: [
      //           "stories": storiesList.map { [
      //             "storyID": $0.storyID,
      //             "storyData": $0.storyData,
      //             "title": $0.title,
      //             "coverImagePath": $0.coverImagePath,
      //             "coverVideoPath": $0.coverVideoPath,
      //             "backgroundColor": $0.backgroundColor,
      //             "titleColor": $0.titleColor,
      //             "opened": $0.opened,
      //             "hasAudio": $0.hasAudio,
      //             "list": "favorites",
      //             "feed": "default",
      //             "aspectRatio": self.storiesAPI.cellRatio,
      //             "slidesCount": $0.storyData.slidesCount,
      //             "statTitle": $0.storyData.title,
      //           ]},
      //             "feed": "default",
      //             "list": "favorites",
      //         ])}
      // self.favoriteStoriesAPI.storyUpdate = {storyData in
      //     NativeStoryManager.emitter.sendEvent(withName: "storyUpdate", body: [
      //       "storyID": storyData.storyID,
      //       "storyData": storyData.storyData,
      //       "title": storyData.title,
      //       "coverImagePath": storyData.coverImagePath,
      //       "coverVideoPath": storyData.coverVideoPath,
      //       "backgroundColor": storyData.backgroundColor,
      //       "titleColor": storyData.titleColor,
      //       "opened": storyData.opened,
      //       "hasAudio": storyData.hasAudio,
      //       "list": "favorites",
      //       "feed": storyData.storyData.feed,
      //       "aspectRatio": self.storiesAPI.cellRatio,
      //       "slidesCount": storyData.storyData.slidesCount,
      //       "statTitle": storyData.storyData.title,
      //     ])
      //   }
      resolve(nil)
    }
  }

  // @objc
  // func getCellRatio(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
  //   DispatchQueue.main.async {
  //     resolve(self.storiesAPI.cellRatio)
  //   }
  // }

  // ponytail: iOS has a single storiesAPI, so uniqueId isn't used for routing
  // (kept to mirror the JS/Android API). Subscribe = wire callbacks, no load.
  @objc public func createSubscriberList(
    _ feed: String,
    uniqueId: String,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    self.storiesAPI.storyUpdate = { storyData in
      storyCallback([
        "storyID": storyData.storyID,
        "storyData": storyData.storyData,
        "title": storyData.title,
        "coverImagePath": storyData.coverImagePath,
        "coverVideoPath": storyData.coverVideoPath,
        "backgroundColor": storyData.backgroundColor,
        "titleColor": storyData.titleColor,
        "opened": storyData.opened,
        "hasAudio": storyData.hasAudio,
        "list": "feed",
        "feed": storyData.storyData.feed,
        "aspectRatio": self.storiesAPI.cellRatio,
        "slidesCount": storyData.storyData.slidesCount,
        "statTitle": storyData.storyData.title,
      ])
    }
    self.storiesAPI.storyListUpdate = { storiesList, isFavorite, feed in
      callback(
        [
          "stories": storiesList.map {
            [
              "storyID": $0.storyID,
              "storyData": $0.storyData,
              "title": $0.title,
              "coverImagePath": $0.coverImagePath,
              "coverVideoPath": $0.coverVideoPath,
              "backgroundColor": $0.backgroundColor,
              "titleColor": $0.titleColor,
              "opened": $0.opened,
              "hasAudio": $0.hasAudio,
              "list": "feed",
              "feed": feed,
              "aspectRatio": self.storiesAPI.cellRatio,
              "slidesCount": $0.storyData.slidesCount,
              "statTitle": $0.storyData.title,
            ]
          },
          "feed": feed,
          "list": "feed",
        ]
      )
    }
  }

  // tags are unused on iOS (preloadBanners has no tags parameter); kept to mirror the shared spec.
  @objc public func preloadBannerPlace(
    _ placeId: String,
    tags: [String]?,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      InAppStory.shared.preloadBanners(placeID: placeId) { result in
        switch result {
        case .success:
          resolve(true)
        case .failure:
          resolve(false)
        }
      }
    }
  }

  // uniqueId is unused on iOS (single storiesAPI); kept to mirror the shared spec.
  @objc public func getStories(
    _ feed: String,
    uniqueId: String,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    self.storiesAPI.storyUpdate = { storyData in
      storyCallback([
        "storyID": storyData.storyID,
        "storyData": storyData.storyData,
        "title": storyData.title,
        "coverImagePath": storyData.coverImagePath,
        "coverVideoPath": storyData.coverVideoPath,
        "backgroundColor": storyData.backgroundColor,
        "titleColor": storyData.titleColor,
        "opened": storyData.opened,
        "hasAudio": storyData.hasAudio,
        "list": "feed",
        "feed": storyData.storyData.feed,
        "aspectRatio": self.storiesAPI.cellRatio,
        "slidesCount": storyData.storyData.slidesCount,
        "statTitle": storyData.storyData.title,
      ])
    }
    self.storiesAPI.storyListUpdate = { storiesList, isFavorite, feed in
      callback(
        [
          "stories": storiesList.map {
            [
              "storyID": $0.storyID,
              "storyData": $0.storyData,
              "title": $0.title,
              "coverImagePath": $0.coverImagePath,
              "coverVideoPath": $0.coverVideoPath,
              "backgroundColor": $0.backgroundColor,
              "titleColor": $0.titleColor,
              "opened": $0.opened,
              "hasAudio": $0.hasAudio,
              "list": "feed",
              "feed": feed,
              "aspectRatio": self.storiesAPI.cellRatio,
              "slidesCount": $0.storyData.slidesCount,
              "statTitle": $0.storyData.title,
            ]
          },
          "feed": feed,
          "list": "feed",
        ]
      )
    }
    DispatchQueue.main.async {
      self.storiesAPI.setNewFeed(feed)
    }
  }

  @objc public func getFavoriteStories(
    _ feed: String,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    self.favoriteStoriesAPI.storyUpdate = { storyData in
      storyCallback([
        "storyID": storyData.storyID,
        "storyData": storyData.storyData,
        "title": storyData.title,
        "coverImagePath": storyData.coverImagePath,
        "coverVideoPath": storyData.coverVideoPath,
        "backgroundColor": storyData.backgroundColor,
        "titleColor": storyData.titleColor,
        "opened": storyData.opened,
        "hasAudio": storyData.hasAudio,
        // Covers arrive async here; must match the list-level callback's
        // feed/list so they land in feeds_default_favorites, not the main feed.
        "list": "favorites",
        "feed": "default",
        "aspectRatio": self.storiesAPI.cellRatio,
        "slidesCount": storyData.storyData.slidesCount,
        "statTitle": storyData.storyData.title,
      ])
    }
    self.favoriteStoriesAPI.storyListUpdate = { storiesList, isFavorite, feed in
      callback([
        "stories": storiesList.map {
          [
            "storyID": $0.storyID,
            "storyData": $0.storyData,
            "title": $0.title,
            "coverImagePath": $0.coverImagePath,
            "coverVideoPath": $0.coverVideoPath,
            "backgroundColor": $0.backgroundColor,
            "titleColor": $0.titleColor,
            "opened": $0.opened,
            "hasAudio": $0.hasAudio,
            "list": "favorites",
            "feed": "default",
            "aspectRatio": self.storiesAPI.cellRatio,
            "slidesCount": $0.storyData.slidesCount,
            "statTitle": $0.storyData.title,
          ]
        },
        "feed": "default",
        "list": "favorites",
      ])
    }

    DispatchQueue.main.async {
      self.favoriteStoriesAPI.getStoriesList()
    }
  }

  @objc public func selectStoryCellWith(_ storyID: String) {
    DispatchQueue.main.async {
      self.storiesAPI.selectStoryCellWith(id: storyID)
    }
  }

  @objc public func selectFavoriteStoryCellWith(_ storyID: String) {
    DispatchQueue.main.async {
      self.favoriteStoriesAPI.selectStoryCellWith(id: storyID)
    }
  }

  @objc public func setVisibleWith(_ storyIDs: [String]) {
    DispatchQueue.main.async {
      self.storiesAPI.setVisibleWith(storyIDs: storyIDs)
    }
  }

  // @objc
  // func showEditor(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //   DispatchQueue.main.async {
  //     /*
  //     let vc = UIApplication.shared.firstKeyWindow?.rootViewController
  //     InAppStoryEditor.shared.showEditor(payload: nil, from: vc!) {showed in
  //       if (showed) {
  //         resolve(true)
  //       } else {
  //         resolve(false)
  //       }
  //     }*/
  //   }
  // }

  @objc public func setUserID(
    _ _userID: String,
    userIdSign _userIdSign: String?
  ) {
    DispatchQueue.main.async {
      self._userID = _userID
      self._userIdSign = _userIdSign
      InAppStory.shared.settings?.userID = _userID
      InAppStory.shared.settings?.sign = _userIdSign
    }
  }

  @objc
  public func setLang(_ lang: String) {
    DispatchQueue.main.async {
      NSLog("setLang")
      self._lang = lang
      InAppStory.shared.settings = Settings(userID:self._userID, tags: self._tags, lang: lang)
    }
  }

  @objc public func setTags(_ tags: [String]) {
    DispatchQueue.main.async {
      NSLog("setTags")
      self._tags = tags
      //InAppStory.shared.settings = Settings(userID:self._userID,tags: self._tags, lang: self._lang)
      InAppStory.shared.settings?.tags = tags
      InAppStory.shared.setTags(tags)
    }
  }

  // TODO: addTags not working
  // @objc
  // func addTags(_ tags: [String]) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.addTags(tags)
  //       }
  // }

  @objc public func removeTags(_ tags: [String]) {
    DispatchQueue.main.async {
      //InAppStory.shared.settings = Settings(userID:self._userID,tags: ["tag3"], lang: self._lang)
      InAppStory.shared.removeTags(tags)
    }
  }

  @objc public func setPlaceholders(_ placeholders: [String: String]) {
    DispatchQueue.main.async {
      InAppStory.shared.placeholders = placeholders
    }
  }
  
  // @objc
  // func isReaderOpen(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //         resolve(InAppStory.shared.isReaderOpen)
  //       }
  // }

  // @objc
  // func isGameOpen(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //         resolve(InAppStory.shared.isGameOpen)
  //       }
  // }

  // @objc
  // func getFrameworkInfo(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //         resolve(InAppStory.frameworkInfo)
  //       }
  // }

  // @objc
  // func getBuildNumber(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //           resolve(InAppStory.BuildSDK)
  //       }
  // }

  // @objc
  // func getVersion(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //           resolve(InAppStory.VersionSDK)
  //       }
  // }

  @objc
  public
    func setImagesPlaceholders(_ imagesPlaceholders: [String: String])
  {
    DispatchQueue.main.async {
      InAppStory.shared.imagesPlaceholders = imagesPlaceholders
    }
  }

  @objc
  public
    func changeSound(_ soundEnabled: Bool)
  {
    DispatchQueue.main.async {
      InAppStory.shared.muted = !soundEnabled
    }
  }

  // @objc
  // func getSound(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //           resolve(!InAppStory.shared.muted)
  //       }
  // }

  @objc
  public
    func setAppVersion(_ appVersion: String, appBuild: Int)
  {
    DispatchQueue.main.async {
      InAppStory.shared.appVersion = appVersion
      InAppStory.shared.appBuild = String(appBuild)
    }
  }

  // @objc
  // func setLogging(_ loggingEnabled: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.isLoggingEnabled = loggingEnabled
  //       }
  // }

  // @objc
  // func useDeviceID(_ useDeviceID: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.isDeviceIDEnabled = useDeviceID
  //       }
  // }

  // @objc
  //   func closeReader() {
  //       DispatchQueue.main.async {
  //           InAppStory.shared.closeReader() {

  //           }
  //       }
  // }

  @objc
  public func onFavoriteCell() {
    // NativeStoryManager.emitter.sendEvent(withName: "favoriteCellDidSelect", body: [])
  }

  // @objc
  // func clearCache() {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.clearCache()
  //       }
  // }

  // @objc
  // func getFavoritesCount(_ storyID: String, resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //         resolve(InAppStory.shared.favoritesCount)
  //       }
  // }

  // @objc
  // func removeFromFavorite(_ storyID: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.removeFromFavorite(with: storyID)
  //       }
  // }

  // @objc
  // func removeAllFavorites() {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.removeAllFavorites()
  //       }
  // }

  // @objc
  // func showGame(_ gameID: String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //       DispatchQueue.main.async {
  //         let vc = UIApplication.shared.firstKeyWindow?.rootViewController
  //         InAppStory.shared.openGame(with: Game(id: gameID), from: vc) { opened in
  //           if (opened) {
  //             resolve(true)
  //           } else {
  //             resolve(false)
  //           }
  //         }
  //       }
  // }

  // @objc
  // func showOnboardings(_ feed: String, limit: Int, tags: [String]?, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //     DispatchQueue.main.async {
  //         let vc = UIApplication.shared.firstKeyWindow?.rootViewController
  //         InAppStory.shared.showOnboardings(feed: feed, limit: limit, from: vc!, with:tags, with: InAppStory.shared.panelSettings, complete: {show in
  //             resolve(show)
  //         })
  //     }
  // }

  // @objc
  // func showSingle(_ storyID: String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
  //     DispatchQueue.main.async {
  //       let vc = UIApplication.shared.firstKeyWindow?.rootViewController
  //         if (vc != nil) {
  //             InAppStory.shared.showStory(with: storyID,
  //                                          from: vc!
  //             ) {
  //                 opened in
  //                 resolve(opened)
  //             }
  //         }
  //     }
  // }

  // @objc
  // func setSwipeToClose(_ value: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.swipeToClose = value
  //       }
  // }



  // @objc
  // func setShowCellTitle(_ value: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.showCellTitle = value
  //       }
  // }

  // @objc
  // func setCellGradientEnabled(_ value: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.cellGradientEnabled = value
  //       }
  // }

  // @objc
  // func setCellGradientRadius(_ value: Double) {
  //     DispatchQueue.main.async {
  //       InAppStory.shared.cellBorderRadius = CGFloat(value)
  //     }
  // }

  // @objc
  // func setCellBorderColor(_ value: String) {
  //       DispatchQueue.main.async {
  //           InAppStory.shared.cellBorderColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setGoodsCellImageBackgroundColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellImageBackgroundColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setGoodsCellImageCornerRadius(_ value: Double) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellImageCornerRadius = CGFloat(value)
  //       }
  // }

  // @objc
  // func setGoodsCellMainTextColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellMainTextColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setGoodsCellOldPriceTextColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellOldPriceTextColor = UIColor(hex: value)!
  //       }
  // }
  /*
    @objc
    func setCellFont(_ value: String) {
          DispatchQueue.main.async {
            InAppStory.shared.cellFont = RCTConvert.uiColor(value)
          }
    }
  */
  // @objc
  // func setPresentationStyle(_ value: String) {
  //       DispatchQueue.main.async {

  //           switch (value) {
  //               case "crossDissolve":
  //                   InAppStory.shared.presentationStyle = .crossDissolve
  //               case "modal":
  //                   InAppStory.shared.presentationStyle = .modal
  //               case "zoom":
  //                   InAppStory.shared.presentationStyle = .zoom
  //               default:
  //                   InAppStory.shared.presentationStyle = .crossDissolve
  //           }
  //       }
  // }

  // @objc
  // func setScrollStyle(_ value: String) {
  //       DispatchQueue.main.async {
  //           switch (value) {
  //               case "cover":
  //                   InAppStory.shared.scrollStyle = .cover
  //               case "flat":
  //                   InAppStory.shared.scrollStyle = .flat
  //               case "cube":
  //                 InAppStory.shared.scrollStyle = .cube
  //               case "depth":
  //                 InAppStory.shared.scrollStyle = .depth
  //               default:
  //               InAppStory.shared.scrollStyle = .cover
  //           }
  //       }
  // }

  // @objc
  // func setCloseButtonPosition(_ value: String) {
  //       DispatchQueue.main.async {
  //           switch (value) {
  //               case "bottomLeft":
  //             InAppStory.shared.closeButtonPosition = .leadingBottom
  //               case "bottomRight":
  //             InAppStory.shared.closeButtonPosition = .trailingBottom
  //               case "left":
  //             InAppStory.shared.closeButtonPosition = .leading
  //               case "right":
  //             InAppStory.shared.closeButtonPosition = .trailing
  //               default:
  //             InAppStory.shared.closeButtonPosition = .trailing
  //           }
  //       }
  // }

  // @objc
  // func addProductToCache(_ sku: String, title: String, subtitle: String, imageURL: String, price: String, oldPrice: String) {
  //   let goodObject = GoodObject(sku: sku,
  //                               title:title,
  //                               subtitle: subtitle,
  //                               imageURL: URL(string: imageURL),
  //                               price: price,
  //                               oldPrice: oldPrice)
  //     self.goodsCache.append(goodObject)
  // }

  // @objc
  // override static func requiresMainQueueSetup() -> Bool {
  //   return true
  // }
}
