//
//  RNInAppStorySDKModule.swift
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

import Foundation
import InAppStorySDK

//import ReactBridge

//@ReactModule(jsName: "InAppStorySDK")
@objc(RNInAppStorySDKModule)
class RNInAppStorySDKModule: NSObject {
  @objc private var _hasLike: Bool = true
  @objc private var _hasDislike: Bool = true
  @objc private var _hasFavorites: Bool = true
  @objc private var _hasShare: Bool = true
  @objc private var _userID: String = ""
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
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
  func setUserID(_ _userID: String) {
        DispatchQueue.main.async {
          InAppStory.shared.settings = Settings(userID: _userID)
        }
  }

  @objc
  func setTags(_ tags: [String]) {
        DispatchQueue.main.async {
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
  }
  @objc
  func setHasDislike(_ value: Bool) {
      _hasDislike = value
  }
  @objc
  func setHasFavorites(_ value: Bool) {
      _hasFavorites = value
  }
  @objc
  func setHasShare(_ value: Bool) {
      _hasShare = value
  }
  @objc
  func showOnboardings(_ feed: String, limit: Int, tags: [String]?) {
      DispatchQueue.main.async {
          let vc = UIApplication.shared.firstKeyWindow?.rootViewController
          InAppStory.shared.showOnboardings(feed: feed, limit: limit, from: vc!) {show in 
              
          }
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
  func setReaderCornerRadius(_ value: Float) {
        DispatchQueue.main.async {
          InAppStory.shared.readerCornerRadius = CGFloat(value)
        }
  }

  @objc
  func setCoverQuality(_ value: String) {
        DispatchQueue.main.async {
          //InAppStory.shared.coverQuality = .medium
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
  func setCellGradientRadius(_ value: Float) {
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
  func setPresentationStyle(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.presentationStyle = .crossDissolve
        }
  }

  @objc
  func setScrollStyle(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.scrollStyle = .cover
        }
  }

  @objc
  func setCloseButtonPosition(_ value: String) {
        DispatchQueue.main.async {
          InAppStory.shared.closeButtonPosition = .right
        }
  }

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
  static func requiresMainQueueSetup() -> Bool {
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
