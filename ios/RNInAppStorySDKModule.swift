//
//  RNInAppStorySDKModule.swift
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

import Foundation
//import InAppStorySDK

//import ReactBridge

//@ReactModule(jsName: "InAppStorySDK")
@objc(RNInAppStorySDKModule)
class RNInAppStorySDKModule: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  //@ReactMethod
  //@objc func initWith(apiKey: String) {
    //InAppStory.shared.initWith(serviceKey: apiKey)
  //}

  //@ReactMethod
  //@objc
  //func showGame() {
    //InAppStory.shared.openGame(with: Game(id: "1")) { opened in
        /// the closure is called after processing the possibility of launching the game
        /// if all went well and the game opened on the screen, `opened = true`
        /// otherwise,` opened = false` (e.g. failed to load the archive with the game)
    //}
  //}

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
