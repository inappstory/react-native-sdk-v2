//
//  RNInAppStorySDKModule.swift
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

import Foundation
import InAppStorySDK
import InAppStoryUGC
import React

//import ReactBridge

//@ReactModule(jsName: "InAppStorySDK")
@objc(RNInAppStorySDKModule)
class RNInAppStorySDKModule: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  open override func supportedEvents() -> [String] {
    ["startGame", "finishGame", "closeGame", "eventGame", "gameFailure"]      // etc. 
  }
  @objc private var _hasLike: Bool = true
  @objc private var _hasDislike: Bool = true
  @objc private var _hasFavorites: Bool = true
  @objc private var _hasShare: Bool = true
  @objc private var _userID: String = ""
  @objc private var _lang: String = ""
  @objc private var _tags: [String] = [""]
      
  @objc
  override func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }
  override init() {
    super.init()
    RNInAppStorySDKModule.emitter = self
  }
  //@ReactMethod
  @objc func initWith(_ apiKey: String, userID: String) {
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
        InAppStory.shared.initWith(serviceKey: apiKey, settings: Settings(userID: userID))
        
        InAppStory.shared.storyReaderWillShow = {showed in
            NSLog("TODO: storyReaderWillShow closure");
        }
        
        InAppStory.shared.storyReaderDidClose = { showed in
            NSLog("TODO: storyReaderDidClose closure");
        }
        InAppStory.shared.gameEvent = { gameEvent in
            NSLog("TODO: gameEvent");
            switch gameEvent {
            case .closeGame(gameData: let gameData):
                NSLog("closeGame")
                RNInAppStorySDKModule.emitter.sendEvent(withName: "closeGame", body: [])
                print(gameData)
            case .startGame(gameData: let gameData):
                NSLog("startGame")
                RNInAppStorySDKModule.emitter.sendEvent(withName: "startGame", body: [])
                print(gameData)
            case .finishGame(gameData: let gameData, result: let result):
                NSLog("finishGame")
                RNInAppStorySDKModule.emitter.sendEvent(withName: "finishGame", body: [])
                print(gameData, result)
            case .eventGame(gameData: let gameData, name: let name, payload: let payload):
                NSLog("eventGame")
                RNInAppStorySDKModule.emitter.sendEvent(withName: "eventGame", body: [])
                print(gameData, name ,payload)
            case .gameFailure(gameData: let gameData, message: let message):
                NSLog("gameFailure")
                RNInAppStorySDKModule.emitter.sendEvent(withName: "gameFailure", body: [])
                print(gameData, message)

            @unknown default:
                NSLog("WARNING: unknown gameEvent")
            }
        }
        /*
        InAppStory.shared.storiesEvent = { storiesEvent in
            NSLog("TODO: storiesEvent");
            switch storiesEvent {
                case .storiesLoaded(stories: let stories):
                    NSLog("storiesLoaded")
                    print(stories)
                case .ugcStoriesLoaded(stories: let stories):
                    NSLog("ugcStoriesLoaded")
                    print(stories)
                case .clickOnStory(storyData: let storyData):
                    NSLog("clickOnStory")
                    print(storyData)
                case .showStory(storyData: let storyData, action: let action):
                    NSLog("showStory")
                    print(storyData, action)
                case .closeStory(slideData: let slideData, action: let action):
                    NSLog("closeStory")
                    print(slideData, action)
                case .clickOnButton(slideData: let slideData, link: let link):
                    NSLog("clickOnButton")
                    print(slideData, link)
                case .showSlide(slideData: let slideData):
                    NSLog("showSlide")
                    print(slideData)
                case .likeStory(slideData: let slideData, value: let value):
                    NSLog("likeStory")
                    print(slideData, value)
                case .dislikeStory(slideData: let slideData, value: let value):
                    NSLog("dislikeStory")
                    print(slideData, value)
                case .favoriteStory(slideData: let slideData, value: let value):
                    NSLog("favoriteStory")
                    print(slideData, value)
                case .clickOnShareStory(slideData: let slideData):
                    NSLog("clickOnShareStory")
                    print(slideData)
                case .storyWidgetEvent(slideData: let slideData, name: let name, data: let data):
                    NSLog("storyWidgetEvent")
                    print(slideData, name, data)
                @unknown default:
                    NSLog("WARNING: unknown storiesEvent")
            }
        }
        
        InAppStory.shared.failureEvent = { failureEvent in
            NSLog("TODO: failureEvent");
            switch failureEvent {
            case .sessionFailure(message: let message):
                NSLog("sessionFailure")
                print(message)
            case .storyFailure(message: let message):
                NSLog("storyFailure")
                print(message)
            case .currentStoryFailure(message: let message):
                NSLog("currentStoryFailure")
                print(message)
            case .networkFailure(message: let message):
                NSLog("networkFailure")
                print(message)
            case .requestFailure(message: let message, statusCode: let statusCode):
                NSLog("requestFailure")
                print(message, statusCode)
            @unknown default:
                NSLog("WARNING: unknown failureEvent")
            }
        }
        InAppStory.shared.storiesDidUpdated = { isContent, storyType in
            NSLog("TODO: storiesDidUpdated closure");
        }
        InAppStory.shared.gameComplete = { data, result, url in
            NSLog("TODO: gameComplete closure");
        }
        
        InAppStory.shared.gameReaderWillShow = { 
            NSLog("TODO: gameReaderWillShow closure");
        }
        InAppStory.shared.gameReaderDidClose = {
            NSLog("TODO: gameReaderDidClose closure");
        }
        InAppStory.shared.customShare = { share, fn in
            NSLog("TODO: customShare closure");
        }
        InAppStory.shared.onActionWith = { target, type, storyType in
            NSLog("TODO: onActionWith closure");
        }
        InAppStory.shared.favoriteCellDidSelect = {
            NSLog("TODO: favoriteCellDidSelect closure");
        }
        InAppStory.shared.editorCellDidSelect = {
            NSLog("TODO: editorCellDidSelect closure");
        }
        InAppStory.shared.getGoodsObject = { skus, complete in
            NSLog("TODO: getGoodsObject closure");
        }
        InAppStory.shared.goodItemSelected = { item, storyType in
            NSLog("TODO: goodItemSelected closure");
        }
        InAppStory.shared.stackFeedUpdate = { newFeed in
            NSLog("TODO: goodItemSelected closure");
        }
         */
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
        /*
       
        */
    }
    //.storiesLoaded(feed: String? = nil, stories: Array<StoryData>)
    //.ugcStoriesLoaded(stories: Array<StoryData>)	

    //.clickOnStory(storyData: StoryData)
    //.showStory(storyData: StoryData, action: ShowStoryAction)	
    //.closeStory(slideData: SlideData, action: CloseStoryAction)	
    //.clickOnButton(slideData: SlideData, link: String)	
    //.showSlide(slideData: SlideData)	
    //.likeStory(slideData: SlideData, value: Bool)	
    //.dislikeStory(slideData: SlideData, value: Bool)
    //.favoriteStory(slideData: SlideData, value: Bool)
    //.clickOnShareStory(slideData: SlideData)
    //.storyWidgetEvent(slideData: SlideData?, name: String, data: Dictionary<String, Any>?)	

    //.startGame(gameData: GameStoryData)	
    //.closeGame(gameData: GameStoryData)	
    //.finishGame(gameData: GameStoryData, result: Dictionary<String, Any>)	
    //.gameFailure(gameData: GameStoryData, message: String)	

    //.sessionFailure(message: String)	
    //.storyFailure(message: String)	
    //.currentStoryFailure(message: String)	
    //.networkFailure(message: String)
    //.requestFailure(message: String, statusCode: Int)	
  }
  @objc
  func showEditor() {
    DispatchQueue.main.async {
      let vc = UIApplication.shared.firstKeyWindow?.rootViewController
      InAppStoryEditor.shared.showEditor(payload: nil, from: vc!) {show in

      }
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
            InAppStory.shared.settings = Settings(userID:self._userID,tags: self._tags, lang: self._lang)
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
            NSLog("removeTags")
            print(tags)
          InAppStory.shared.settings = Settings(userID:self._userID,tags: ["tag3"], lang: self._lang)
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
  func isReaderOpen(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.shared.isReaderOpen)
        }
  }

  @objc
  func isGameOpen(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.shared.isGameOpen)
        }
  }

  @objc
  func getFrameworkInfo(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
          resolve(InAppStory.frameworkInfo)
        }
  }
  @objc
  func getBuildNumber(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            resolve(InAppStory.BuildSDK)
        }
  }
  @objc
  func getVersion(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
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
          InAppStory.shared.muted = soundEnabled
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
          InAppStory.shared.clearCache()
        }
  }
  @objc
  func clearCache() {
        DispatchQueue.main.async {
          InAppStory.shared.clearCache()
        }
  }
  @objc
  func getFavoritesCount(_ storyID: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) {
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
  func showGame(_ gameID: String) {
        DispatchQueue.main.async {
          let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          InAppStory.shared.openGame(with: Game(id: gameID), from: vc) { opened in
              /// the closure is called after processing the possibility of launching the game
              /// if all went well and the game opened on the screen, `opened = true`
              /// otherwise,` opened = false` (e.g. failed to load the archive with the game)
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
  func showOnboardings(_ feed: String, limit: Int, tags: [String]?) {
      DispatchQueue.main.async {
          let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          InAppStory.shared.showOnboardings(feed: feed, limit: limit, from: vc!, with:tags, with: InAppStory.shared.panelSettings, complete: {show in
              
          })
      }
  }

  @objc
  func showSingle(_ storyID: String) {
      DispatchQueue.main.async {
        let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          if (vc != nil) {
              InAppStory.shared.showStory(with: storyID,
                                           from: vc!
              ) {
                  opened in
                  // closure
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
          //InAppStory.shared.timerGradient = value
        }
  }
  @objc
  func setPlaceholderElementColor(_ value: String) {
        DispatchQueue.main.async {
            InAppStory.shared.placeholderElementColor = RCTConvert.uiColor(value)
        }
  }

  @objc
  func setPlaceholderBackgroundColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.placeholderBackgroundColor = RCTConvert.uiColor(value)
        }
  }

  @objc
  func setReaderBackgroundColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.readerBackgroundColor = RCTConvert.uiColor(value)
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
          InAppStory.shared.cellBorderColor = RCTConvert.uiColor(value)
        }
  }

  @objc
  func setGoodsCellImageBackgroundColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.goodsCellImageBackgroundColor = RCTConvert.uiColor(value)
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
          InAppStory.shared.goodsCellMainTextColor = RCTConvert.uiColor(value)
        }
  }

  @objc
  func setGoodsCellOldPriceTextColor(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.goodsCellOldPriceTextColor = RCTConvert.uiColor(value)
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
  //TODO:
  //likeImage
  //likeSelectedImage
  //dislikeImage
  //dislikeSelectedImage
  //favoriteImage
  //favoriteSelectedImag
  //shareImage
  //shareSelectedImage
  //soundmage
  //soundSelectedImage
  //closeReaderImage
  //refreshImage
  //refreshGoodsImage
  //goodsCloseImage


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
