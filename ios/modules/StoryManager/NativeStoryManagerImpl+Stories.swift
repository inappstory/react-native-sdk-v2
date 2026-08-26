import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

// Story/onboarding/game presentation, favorites actions and operation cancel.
extension NativeStoryManagerImpl {
  @objc
  public func onFavoriteCell() {
    // NativeStoryManager.emitter.sendEvent(withName: "favoriteCellDidSelect", body: [])
  }
  @objc public func removeFromFavorite(_ storyID: String) {
    DispatchQueue.main.async {
      InAppStory.shared.removeFromFavorite(with: storyID)
    }
  }

  @objc public func removeAllFavorites() {
    DispatchQueue.main.async {
      InAppStory.shared.removeAllFavorites()
    }
  }

  @objc public func favoritesCount(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      resolve(InAppStory.shared.favoritesCount)
    }
  }

  @objc public func logout() {
    DispatchQueue.main.async {
      InAppStory.shared.logOut {}
    }
  }
  @objc public func showStoryOnce(
    _ storyID: String,
    operationId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async { [self] in
      cancellationTokenMap[operationId] = InAppStoryAPI.shared.singleStoryAPI
        .showStoryOnce(with: storyID) { shown in
          resolve(shown)
          self.cancellationTokenMap.removeValue(forKey: operationId)
        }
    }
  }

  @objc public func cancelOperation(_ operationId: String) {
    cancellationTokenMap[operationId]?.cancel()
    cancellationTokenMap.removeValue(forKey: operationId)
  }

  @objc public func showSingle(
    _ storyID: String,
    operationId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async { [self] in
      guard let vc = UIApplication.shared.firstKeyWindow?.rootViewController
      else {
        resolve(false)
        return
      }
      cancellationTokenMap[operationId] = InAppStory.shared.showStory(
        with: storyID,
        from: vc
      ) { opened in
        resolve(opened)
        self.cancellationTokenMap.removeValue(forKey: operationId)
      }
    }
  }

  @objc public func showOnboardings(
    _ feed: String,
    limit: Int,
    tags: [String]?,
    operationId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async { [self] in
      guard let vc = UIApplication.shared.firstKeyWindow?.rootViewController
      else {
        resolve(false)
        return
      }
      cancellationTokenMap[operationId] = InAppStory.shared.showOnboardings(
        feed: feed,
        limit: limit,
        from: vc,
        with: tags,
        with: InAppStory.shared.panelSettings,
        complete: { show in
          resolve(show)
          self.cancellationTokenMap.removeValue(forKey: operationId)
        }
      )
    }
  }
  @objc public func showGame(
    _ gameID: String,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let vc = UIApplication.shared.firstKeyWindow?.rootViewController
      InAppStory.shared.openGame(with: Game(id: gameID), from: vc) { opened in
        resolve(opened)
      }
    }
  }
}
