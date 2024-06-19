//
//  RNInAppStorySDKModule.swift
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
// import InAppStoryUGC
import React

//import ReactBridge

//@ReactModule(jsName: "InAppStorySDK")
@objc(RNInAppStorySDKModule)
class RNInAppStorySDKModule: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  open override func supportedEvents() -> [String] {
    [
     "storiesLoaded","ugcStoriesLoaded","clickOnStory","showStory","closeStory","clickOnButton","showSlide","likeStory","dislikeStory","favoriteStory","clickOnShareStory","storyWidgetEvent",
     "startGame", "finishGame", "closeGame", "eventGame", "gameFailure","gameReaderWillShow","gameReaderDidClose","gameComplete",
     "getGoodsObject",
     "storyListUpdate", "storyUpdate",
     "favoritesUpdate","scrollUpdate",
     "storyReaderWillShow","storyReaderDidClose","sessionFailure","storyFailure","currentStoryFailure","networkFailure","requestFailure","favoriteCellDidSelect","editorCellDidSelect",
     "customShare", "onActionWith","storiesDidUpdated","goodItemSelected",
     "openStoryReader", "openStoryFavoriteReader", "clickOnFavoriteCell", "shareStoryWithPath",
    ]      // etc. 
  }
  @objc private var _hasLike: Bool = true
  @objc private var _hasDislike: Bool = true
  @objc private var _hasFavorites: Bool = true
  @objc private var _hasShare: Bool = true
  @objc private var _userID: String = ""
  @objc private var _lang: String = ""
  @objc private var _tags: [String] = [""]
  @objc private var goodsCache: Array<GoodObject> = []
  var storiesAPI = StoryListAPI()
  var favoriteStoriesAPI = StoryListAPI(isFavorite: true)
  @objc
  override func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }
  override init() {
    super.init()
    RNInAppStorySDKModule.emitter = self
  }
  //@ReactMethod
  @objc func initWith(_ apiKey: String, userID: String, sandbox: Bool, sendStats: Bool) {
    DispatchQueue.main.async {
      // the parameter is responsible for logging to the XCode console
        InAppStory.shared.isLoggingEnabled = true
        // the parameter is responsible for displaying the shading under cell headers
        InAppStory.shared.cellGradientEnabled = true
        // the parameter is responsible for the color of the cell gradient of the unread story.
        InAppStory.shared.cellBorderColor = UIColor.blue
        // the parameter is responsible for displaying the bottom panel in the story card (likes, favorites and share)
        // additionally should be configured in the console
        InAppStory.shared.panelSettings = PanelSettings(like: self._hasLike, favorites: self._hasFavorites, share: self._hasShare)
        // the parameter is responsible for animation of the reader display when you tap on a story cell
        InAppStory.shared.presentationStyle = .zoom
        
        InAppStory.shared.sandBox = sandbox;
        InAppStory.shared.isStatisticDisabled = !sendStats
        InAppStory.shared.initWith(serviceKey: apiKey, settings: Settings(userID: userID))
        
        
        InAppStory.shared.storyReaderWillShow = {showed in
            switch showed {
            case .list(feed: let feed):
              RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderWillShow", body: [
                "feed": feed,
                "type": "list",
              ])
            case .ugcList:
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderWillShow", body: [
                  "type": "ugcList",
                ])
            case .single:
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderWillShow", body: [
                  "type": "single",
                ])
            case .onboarding(feed: let feed):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderWillShow", body: [
                  "feed": feed,
                  "type": "onboarding",
                ])
            @unknown default:
                NSLog("WARNING: unknown storyReaderWillShow")
            }
        }
        
        InAppStory.shared.storyReaderDidClose = { showed in
            switch showed {
            case .list(feed: let feed):
              RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderDidClose", body: [
                "feed": feed,
                "type": "list",
              ])
            case .ugcList:
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderDidClose", body: [
                  "type": "ugcList",
                ])
            case .single:
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderDidClose", body: [
                  "type": "single",
                ])
            case .onboarding(feed: let feed):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyReaderDidClose", body: [
                  "feed": feed,
                  "type": "onboarding",
                ])
            @unknown default:
                NSLog("WARNING: unknown storyReaderDidClose")
            }
        }
        self.storiesAPI.favoritesUpdate = { showed in
            RNInAppStorySDKModule.emitter.sendEvent(withName: "favoritesUpdate", body: [
                "feed": showed,
            ])
        }
        self.storiesAPI.scrollUpdate = { showed in
            RNInAppStorySDKModule.emitter.sendEvent(withName: "scrollUpdate", body: [
                "index":showed
            ])
        }
        InAppStory.shared.gameEvent = { gameEvent in
            switch gameEvent {
            case .closeGame(gameData: let gameData):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "closeGame", body: [
                    "gameID": gameData.gameID,
                    "id": gameData.slideData?.storyData?.id,
                    "feed": gameData.slideData?.storyData?.feed,
                ])
            case .startGame(gameData: let gameData):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "startGame", body: [
                    "id": gameData.slideData?.storyData?.id,
                    "gameID": gameData.gameID
                ])
            case .finishGame(gameData: let gameData, result: let result):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "finishGame", body: [
                    "id": gameData.slideData?.storyData?.id,
                    "gameID": gameData.gameID,
                    "result": result,
                ])
            case .eventGame(gameData: let gameData, name: let name, payload: let payload):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "eventGame", body: [
                    "id": gameData.slideData?.storyData?.id,
                    "feed": gameData.slideData?.storyData?.feed,
                    "gameID": gameData.gameID,
                    "name": name,
                    "payload": payload,
                ])
                print(gameData, name ,payload)
            case .gameFailure(gameData: let gameData, message: let message):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "gameFailure", body: [
                    "message": message,
                    "gameID": gameData.gameID,
                    "id": gameData.slideData?.storyData?.id
                ])

            @unknown default:
                NSLog("WARNING: unknown gameEvent")
            }
        }
        InAppStory.shared.getGoodsObject = { skus, complete in
              RNInAppStorySDKModule.emitter.sendEvent(withName: "getGoodsObject", body: ["skus":skus])
              Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { timer in
              let goodsCount = self.goodsCache.count
              if goodsCount > 0 {
                timer.invalidate()
                complete(.success(self.goodsCache))
                self.goodsCache = nil;
              }
          }
        }

        InAppStory.shared.failureEvent = { failureEvent in
            switch failureEvent {
            case .sessionFailure(message: let message):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "sessionFailure", body: [
                  "message": message,
                ])
            case .storyFailure(message: let message):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "storyFailure", body: [
                  "message": message
                ])
            case .currentStoryFailure(message: let message):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "currentStoryFailure", body: [
                  "message": message,
                ])
            case .networkFailure(message: let message):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "networkFailure", body: [
                  "message": message
                ])
            case .requestFailure(message: let message, statusCode: let statusCode):
                RNInAppStorySDKModule.emitter.sendEvent(withName: "requestFailure", body: [
                  "message": message,
                  "statusCode": statusCode,
                ])
            @unknown default:
                NSLog("WARNING: unknown failureEvent")
            }
        }
        InAppStory.shared.gameReaderWillShow = { 
          RNInAppStorySDKModule.emitter.sendEvent(withName: "gameReaderWillShow", body: [])
        }
        InAppStory.shared.gameReaderDidClose = {
          RNInAppStorySDKModule.emitter.sendEvent(withName: "gameReaderDidClose", body: [])
        }
        InAppStory.shared.gameComplete = { data, result, url in
            NSLog("TODO: gameComplete closure");
            RNInAppStorySDKModule.emitter.sendEvent(withName: "gameComplete", body: [
                "data": data,
                "result": result ?? [:],
                "url": url ?? ""
            ])
        }

        InAppStory.shared.favoriteCellDidSelect = {
          RNInAppStorySDKModule.emitter.sendEvent(withName: "favoriteCellDidSelect", body: [])
        }
        InAppStory.shared.editorCellDidSelect = {
          RNInAppStorySDKModule.emitter.sendEvent(withName: "editorCellDidSelect", body: [])
        }

        /*InAppStory.shared.customShare = { share, fn in
          RNInAppStorySDKModule.emitter.sendEvent(withName: "customShare", body: [])
          NSLog("TODO: customShare closure");
        }*/
        
        /*InAppStory.shared.onActionWith = { target, type, storyType in
          RNInAppStorySDKModule.emitter.sendEvent(withName: "onActionWith", body: [])
          NSLog("TODO: onActionWith closure");
        }*/

        InAppStory.shared.storiesDidUpdated = { isContent, storyType in
          NSLog("TODO: storiesDidUpdated closure");
          RNInAppStorySDKModule.emitter.sendEvent(withName: "storiesDidUpdated", body: [
            "isContent": isContent,
            "storyType": storyType,
          ])
          NSLog("TODO: onActionWith closure");
        }

        InAppStory.shared.goodItemSelected = { item, storyType in
            var storyTypeString = "";
            var feedString = "";
            switch (storyType) {
                case .onboarding: storyTypeString = "onboarding"
                case .list(feed: let feed):
                    storyTypeString = "list"
                    feedString = feed ?? "default"
                case .ugcList:
                    storyTypeString = "ugcList"
                case .single:
                    storyTypeString = "single"
                case .none:
                    storyTypeString = "none"
                @unknown default:
                    storyTypeString = "none"
            }
          RNInAppStorySDKModule.emitter.sendEvent(withName: "goodItemSelected", body: [
            "sku":item.sku,
            "feed": feedString,
            "storyType": storyTypeString
          ])
        }

        InAppStory.shared.stackFeedUpdate = { newFeed in
            NSLog("TODO: stackFeedUpdate closure");
        }
        
        
        InAppStory.shared.storiesEvent = { storiesEvent in
            switch storiesEvent {
              case .storiesLoaded(feed: let feed, stories: let stories):
                      RNInAppStorySDKModule.emitter.sendEvent(withName: "storiesLoaded", body: [
                          "feed": feed,
                          "stories": stories,
                      ])
              case .clickOnStory(storyData: let storyData, index: let index):
                      RNInAppStorySDKModule.emitter.sendEvent(withName: "clickOnStory", body: [
                          "id": storyData.id,
                          "feed": storyData.feed,
                          "index": index,
                    ])
              case .showStory(storyData: let storyData, action: let action):
                 var actionString = "";
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
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "showStory", body: [
                        "id": storyData.id,
                        "feed": storyData.feed,
                        "action": actionString
                    ])
              case .closeStory(slideData: let slideData, action: let action):
                    var actionString = "";
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
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "closeStory", body: [
                        "id": slideData.storyData?.id,
                        "feed": slideData.storyData?.feed,
                        "index": slideData.index,
                        "action": actionString,
                    ])
                case .clickOnButton(slideData: let slideData, link: let link):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "clickOnButton", body: [
                      "url":link,
                      "id": slideData.storyData?.id,
                      "feed": slideData.storyData?.feed,
                    ])
                    
                case .showSlide(slideData: let slideData):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "showSlide", body: [
                      "id": slideData.storyData?.id,
                      "index": slideData.index
                    ])
                    
                case .likeStory(slideData: let slideData, value: let value):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "likeStory", body: [
                        "feed": slideData.storyData?.feed,
                        "id": slideData.storyData?.id,
                        "value": value
                    ])
                    
                case .dislikeStory(slideData: let slideData, value: let value):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "dislikeStory", body: [
                      "feed": slideData.storyData?.feed,
                      "id": slideData.storyData?.id,
                      "value": value
                    ])
                    
                case .favoriteStory(slideData: let slideData, value: let value):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "favoriteStory", body: [
                      "feed": slideData.storyData?.feed,
                      "id": slideData.storyData?.id,
                      "value": value
                    ])
                case .clickOnShareStory(slideData: let slideData):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "clickOnShareStory", body: [
                      "feed": slideData.storyData?.feed,
                      "id": slideData.storyData?.id,
                    ])
                case .storyWidgetEvent(slideData: let slideData, name: let name, data: let data):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "storyWidgetEvent", body: [
                        "id": slideData?.storyData?.id,
                        "feed": slideData?.storyData?.feed,
                        "name": name,
                        "data": data
                    ])
                case .ugcStoriesLoaded(stories: let stories):
                    RNInAppStorySDKModule.emitter.sendEvent(withName: "ugcStoriesLoaded", body: [])
                @unknown default:
                     NSLog("WARNING: unknown storiesEvent")
                            
             }
        }
      
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
    }

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
    self.storiesAPI.storyListUpdate = {storiesList,isFavorite,feed in
        RNInAppStorySDKModule.emitter.sendEvent(withName: "storyListUpdate", body: [
          "stories": storiesList.map { [
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
          ]},
            "feed": feed,
            "list": "feed", 
        ])}
    self.storiesAPI.storyUpdate = {storyData in
        print("StoryUpdate = $storyData");
        RNInAppStorySDKModule.emitter.sendEvent(withName: "storyUpdate", body: [
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
        ])
    }
    self.favoriteStoriesAPI.storyListUpdate = {storiesList,isFavorite, feed in
    
            RNInAppStorySDKModule.emitter.sendEvent(withName: "storyListUpdate", body: [
              "stories": storiesList.map { [
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
              ]},
                "feed": "default",
                "list": "favorites",
            ])}
        self.favoriteStoriesAPI.storyUpdate = {storyData in
            RNInAppStorySDKModule.emitter.sendEvent(withName: "storyUpdate", body: [
              "storyID": storyData.storyID,
              "storyData": storyData.storyData,
              "title": storyData.title,
              "coverImagePath": storyData.coverImagePath,
              "coverVideoPath": storyData.coverVideoPath,
              "backgroundColor": storyData.backgroundColor,
              "titleColor": storyData.titleColor,
              "opened": storyData.opened,
              "hasAudio": storyData.hasAudio,
              "list": "favorites",
              "feed": storyData.storyData.feed,
              "aspectRatio": self.storiesAPI.cellRatio,
            ])
          }
  }

  @objc
  func getCellRatio(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      resolve(self.storiesAPI.cellRatio)
    }
  }

  @objc
  func getStories(_ feed:String) {
      DispatchQueue.main.async {
        self.storiesAPI.setNewFeed(feed)
      }
  }

  @objc
  func getFavoriteStories(_ feed:String) {
      DispatchQueue.main.async {
        self.favoriteStoriesAPI.getStoriesList()
      }
  }

  @objc
  func selectStoryCellWith(_ storyID: String) {
     DispatchQueue.main.async {
      self.storiesAPI.selectStoryCellWith(id: storyID);
     }
  }

  @objc
  func selectFavoriteStoryCellWith(_ storyID: String) {
     DispatchQueue.main.async {
      self.favoriteStoriesAPI.selectStoryCellWith(id: storyID);
     }
  }

  @objc func setVisibleWith(_ storyIDs: [String]) {
    DispatchQueue.main.async {
      self.storiesAPI.setVisibleWith(storyIDs: storyIDs);
     }
  }

  @objc
  func showEditor(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      /*
      let vc = UIApplication.shared.firstKeyWindow?.rootViewController
      InAppStoryEditor.shared.showEditor(payload: nil, from: vc!) {showed in
        if (showed) {
          resolve(true)
        } else {
          resolve(false)
        }
      }*/
    }
  }
  @objc
  func setUserID(_ _userID: String) {
        DispatchQueue.main.async {
           NSLog("setUserID")
            self._userID = _userID
            InAppStory.shared.settings?.userID = _userID
        }
  }

  @objc
  func setLang(_ lang: String) {
        DispatchQueue.main.async {
          NSLog("setLang")
            self._lang = lang;
            InAppStory.shared.settings = Settings(userID:self._userID, tags: self._tags, lang: lang)
        }
  }

  @objc
  func setTags(_ tags: [String]) {
        DispatchQueue.main.async {
          NSLog("setTags")
          self._tags = tags
            //InAppStory.shared.settings = Settings(userID:self._userID,tags: self._tags, lang: self._lang)
         InAppStory.shared.settings?.tags = tags
          InAppStory.shared.setTags(tags)
        }
  }

  @objc
  func addTags(_ tags: [String]) {
        DispatchQueue.main.async {
          InAppStory.shared.addTags(tags)
        }
  }

  @objc
  func removeTags(_ tags: [String]) {
        DispatchQueue.main.async {
          //InAppStory.shared.settings = Settings(userID:self._userID,tags: ["tag3"], lang: self._lang)
          InAppStory.shared.removeTags(tags)
        }
  }

  @objc
  func setPlaceholders(_ placeholders: Dictionary<String, String>) {
        DispatchQueue.main.async {
          InAppStory.shared.placeholders = placeholders
        }
  }

  @objc
  func isReaderOpen(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.shared.isReaderOpen)
        }
  }

  @objc
  func isGameOpen(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.shared.isGameOpen)
        }
  }

  @objc
  func getFrameworkInfo(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.frameworkInfo)
        }
  }
  @objc
  func getBuildNumber(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(InAppStory.BuildSDK)
        }
  }
  @objc
  func getVersion(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(InAppStory.VersionSDK)
        }
  }

  @objc
  func setImagesPlaceholders(_ imagesPlaceholders: Dictionary<String, String>) {
        DispatchQueue.main.async {
          InAppStory.shared.imagesPlaceholders = imagesPlaceholders
        }
  }
  
  @objc
  func changeSound(_ soundEnabled: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.muted = !soundEnabled
        }
  }
  @objc
  func getSound(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(!InAppStory.shared.muted)
        }
  }

  @objc
  func setLogging(_ loggingEnabled: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.isLoggingEnabled = loggingEnabled
        }
  }

  @objc
  func useDeviceID(_ useDeviceID: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.isDeviceIDEnabled = useDeviceID
        }
  }

  @objc
    func closeReader() {
        DispatchQueue.main.async {
            InAppStory.shared.closeReader() {

            }
        }
  }
  @objc
  func clearCache() {
        DispatchQueue.main.async {
          InAppStory.shared.clearCache()
        }
  }
  @objc
  func getFavoritesCount(_ storyID: String, resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.shared.favoritesCount)
        }
  }
  @objc
  func removeFromFavorite(_ storyID: String) {
        DispatchQueue.main.async {
          InAppStory.shared.removeFromFavorite(with: storyID)
        }
  }
  @objc
  func removeAllFavorites() {
        DispatchQueue.main.async {
          InAppStory.shared.removeAllFavorites()
        }
  }

  //@ReactMethod
  @objc
  func showGame(_ gameID: String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          InAppStory.shared.openGame(with: Game(id: gameID), from: vc) { opened in
            if (opened) {
              resolve(true)
            } else {
              resolve(false)
            }
          }
        }
  }
  @objc
  func setHasLike(_ value: Bool) {
      _hasLike = value
      InAppStory.shared.panelSettings = PanelSettings(like: self._hasLike, favorites: self._hasFavorites, share: self._hasShare)
  }
  @objc
  func setHasDislike(_ value: Bool) {
      _hasDislike = value
      InAppStory.shared.panelSettings = PanelSettings(like: self._hasLike, favorites: self._hasFavorites, share: self._hasShare)
  }
  @objc
  func setHasFavorites(_ value: Bool) {
      _hasFavorites = value
      InAppStory.shared.panelSettings = PanelSettings(like: self._hasLike, favorites: self._hasFavorites, share: self._hasShare)
  }
  @objc
  func setHasShare(_ value: Bool) {
      _hasShare = value
      InAppStory.shared.panelSettings = PanelSettings(like: self._hasLike, favorites: self._hasFavorites, share: self._hasShare)
  }
  @objc
  func showOnboardings(_ feed: String, limit: Int, tags: [String]?, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
      DispatchQueue.main.async {
          let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          InAppStory.shared.showOnboardings(feed: feed, limit: limit, from: vc!, with:tags, with: InAppStory.shared.panelSettings, complete: {show in
              resolve(show)
          })
      }
  }

  @objc
  func showSingle(_ storyID: String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) {
      DispatchQueue.main.async {
        let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          if (vc != nil) {
              InAppStory.shared.showStory(with: storyID,
                                           from: vc!
              ) {
                  opened in
                  resolve(opened)
              }
          }
      }
  }
  // MARK: - ReaderStyle
  @objc
  func setTimerGradientEnable(_ value: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.timerGradientEnable = value
        }
  }

  @objc
  func setSwipeToClose(_ value: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.swipeToClose = value
        }
  }

  @objc
  func setOverScrollToClose(_ value: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.overScrollToClose = value
        }
  }
  @objc
  func setTimerGradient(_ value: Bool) {
        DispatchQueue.main.async {
          //FIXME: InAppStory.shared.timerGradient = value
        }
  }
  @objc
  func setPlaceholderElementColor(_ value: String) {
        DispatchQueue.main.async {
            InAppStory.shared.placeholderElementColor = UIColor(hex: value)!
        }
  }

  @objc
  func setPlaceholderBackgroundColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.placeholderBackgroundColor = UIColor(hex: value)!
        }
  }

  @objc
  func setReaderBackgroundColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.readerBackgroundColor = UIColor(hex: value)!
        }
  }

  @objc
  func setReaderCornerRadius(_ value: Double) {
        DispatchQueue.main.async {
          InAppStory.shared.readerCornerRadius = CGFloat(value)
        }
  }

  @objc
  func setCoverQuality(_ value: String) {
        DispatchQueue.main.async {
            switch (value) {
                case "medium":
                    InAppStory.shared.coverQuality = .medium
                case "high":
                    InAppStory.shared.coverQuality = .high
                default:
                    InAppStory.shared.coverQuality = .medium
            }
        }
  }

  @objc
  func setShowCellTitle(_ value: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.showCellTitle = value
        }
  }

  @objc
  func setCellGradientEnabled(_ value: Bool) {
        DispatchQueue.main.async {
          InAppStory.shared.cellGradientEnabled = value
        }
  }

  @objc
  func setCellGradientRadius(_ value: Double) {
      DispatchQueue.main.async {
        InAppStory.shared.cellBorderRadius = CGFloat(value)
      }
  }

  @objc
  func setCellBorderColor(_ value: String) {
        DispatchQueue.main.async {
            InAppStory.shared.cellBorderColor = UIColor(hex: value)!
        }
  }

  @objc
  func setGoodsCellImageBackgroundColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.goodsCellImageBackgroundColor = UIColor(hex: value)!
        }
  }

  @objc
  func setGoodsCellImageCornerRadius(_ value: Double) {
        DispatchQueue.main.async {
          InAppStory.shared.goodsCellImageCornerRadius = CGFloat(value)
        }
  }

  @objc
  func setGoodsCellMainTextColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.goodsCellMainTextColor = UIColor(hex: value)!
        }
  }

  @objc
  func setGoodsCellOldPriceTextColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.goodsCellOldPriceTextColor = UIColor(hex: value)!
        }
  }
/*
  @objc
  func setCellFont(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.cellFont = RCTConvert.uiColor(value)
        }
  }
*/
  @objc
  func setPresentationStyle(_ value: String) {
        DispatchQueue.main.async {
          
            switch (value) {
                case "crossDissolve":
                    InAppStory.shared.presentationStyle = .crossDissolve
                case "modal":
                    InAppStory.shared.presentationStyle = .modal
                case "zoom":
                    InAppStory.shared.presentationStyle = .zoom
                default:
                    InAppStory.shared.presentationStyle = .crossDissolve
            }
        }
  }

  @objc
  func setScrollStyle(_ value: String) {
        DispatchQueue.main.async {
            switch (value) {
                case "cover":
                    InAppStory.shared.scrollStyle = .cover
                case "flat":
                    InAppStory.shared.scrollStyle = .flat
                case "cube":
                  InAppStory.shared.scrollStyle = .cube
                case "depth":
                  InAppStory.shared.scrollStyle = .depth
                default:
                InAppStory.shared.scrollStyle = .cover
            }
        }
  }

  @objc
  func setCloseButtonPosition(_ value: String) {
        DispatchQueue.main.async {
            switch (value) {
                case "bottomLeft":
                  InAppStory.shared.closeButtonPosition = .bottomLeft
                case "bottomRight":
                  InAppStory.shared.closeButtonPosition = .bottomRight
                case "left":
                  InAppStory.shared.closeButtonPosition = .left
                case "right":
                  InAppStory.shared.closeButtonPosition = .right
                default:
                  InAppStory.shared.closeButtonPosition = .right
            }
        }
  }

  @objc
  func setLikeImage(_ image: String, selected selectedImage: String) {
    InAppStory.shared.likeImage = UIImage(named: image)!
    InAppStory.shared.likeSelectedImage = UIImage(named: selectedImage)!
  }

  @objc
  func setDislikeImage(_ image: String, selected selectedImage: String) {
    InAppStory.shared.dislikeImage = UIImage(named: image)!
    InAppStory.shared.dislikeSelectedImage = UIImage(named: selectedImage)!
  }

  @objc
  func setFavoriteImage(_ image: String, selected selectedImage: String) {
    InAppStory.shared.favoriteImage = UIImage(named: image)!
    InAppStory.shared.favoriteSelectedImag = UIImage(named: selectedImage)!
  }

  @objc
  func setShareImage(_ image: String, selected selectedImage: String) {
    InAppStory.shared.shareImage = UIImage(named: image)!
    InAppStory.shared.shareSelectedImage = UIImage(named: selectedImage)!
  }

  @objc
  func setSoundImage(_ image: String, selected selectedImage: String) {
    InAppStory.shared.soundImage = UIImage(named: image)!
    InAppStory.shared.soundSelectedImage = UIImage(named: selectedImage)!
  }

  @objc
  func setCloseReaderImage(_ image: String) {
    InAppStory.shared.closeReaderImage = UIImage(named: image)!
  }

  @objc
  func setRefreshImage(_ image: String) {
    InAppStory.shared.refreshImage = UIImage(named: image)!
  }

  @objc
  func setRefreshGoodsImage(_ image: String) {
    InAppStory.shared.refreshImage = UIImage(named: image)!
  }

  @objc
  func setCloseGoodsImage(_ image: String) {
    InAppStory.shared.goodsCloseImage = UIImage(named: image)!
  }

  @objc
  func addProductToCache(_ sku: String, title: String, subtitle: String, imageURL: String, price: String, oldPrice: String) {
    let goodObject = GoodObject(sku: sku,
                                title:title,
                                subtitle: subtitle,
                                imageURL: URL(string: imageURL),
                                price: price, 
                                oldPrice: oldPrice)
      self.goodsCache.append(goodObject)
  }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

extension UIApplication {
    var firstKeyWindow: UIWindow? {
        if #available(iOS 15.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .filter { $0.activationState == .foregroundActive }
                .first?.keyWindow
        } else {
            return UIApplication.shared.connectedScenes
                        .compactMap { $0 as? UIWindowScene }
                        .filter { $0.activationState == .foregroundActive }
                        .first?.windows

                        .first(where: \.isKeyWindow)
        }

    }
}

extension UIColor {
    public convenience init?(hex: String) {
        let r, g, b, a: CGFloat

        if hex.hasPrefix("#") {
            let start = hex.index(hex.startIndex, offsetBy: 1)
            let hexColor = String(hex[start...])

            if hexColor.count == 6 {
                let scanner = Scanner(string: hexColor)
                var hexNumber: UInt64 = 0

                if scanner.scanHexInt64(&hexNumber) {
                    r = CGFloat((hexNumber & 0xff000000) >> 24) / 255
                    g = CGFloat((hexNumber & 0x00ff0000) >> 16) / 255
                    b = CGFloat((hexNumber & 0x0000ff00) >> 8) / 255
                    a = 1

                    self.init(red: r, green: g, blue: b, alpha: a)
                    return
                }
            }
            if hexColor.count == 8 {
                let scanner = Scanner(string: hexColor)
                var hexNumber: UInt64 = 0

                if scanner.scanHexInt64(&hexNumber) {
                    r = CGFloat((hexNumber & 0xff000000) >> 24) / 255
                    g = CGFloat((hexNumber & 0x00ff0000) >> 16) / 255
                    b = CGFloat((hexNumber & 0x0000ff00) >> 8) / 255
                    a = CGFloat(hexNumber & 0x000000ff) / 255

                    self.init(red: r, green: g, blue: b, alpha: a)
                    return
                }
            }
        }

        return nil
    }
}
