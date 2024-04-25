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
        InAppStory.shared.panelSettings = PanelSettings(like: true, favorites: true, share: true)
        // the parameter is responsible for animation of the reader display when you tap on a story cell
        InAppStory.shared.presentationStyle = .zoom
        InAppStory.shared.initWith(serviceKey: apiKey, settings: Settings(userID: userID))
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
