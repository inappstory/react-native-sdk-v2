import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

// User/session config: identity, tags, lang, placeholders, sound, options, cache.
extension NativeStoryManagerImpl {
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
      let current = InAppStory.shared.settings
      InAppStory.shared.settings = Settings(
        userID: current?.userID ?? self._userID,
        sign: current?.sign,
        tags: current?.tags ?? [],
        lang: lang
      )
    }
  }

  // Tags go through the SettingsAPI methods only: `InAppStory.shared.settings` is a
  // computed property over a struct, so `settings?.tags = ...` desugars into a full
  // settings reassignment (session setter) instead of a point update.
  @objc public func setTags(_ tags: [String]) {
    DispatchQueue.main.async {
      InAppStory.shared.setTags(tags)
    }
  }

  @objc public func addTags(_ tags: [String]) {
    DispatchQueue.main.async {
      InAppStory.shared.addTags(tags)
    }
  }

  @objc public func removeTags(_ tags: [String]) {
    DispatchQueue.main.async {
      InAppStory.shared.removeTags(tags)
    }
  }

  @objc public func setPlaceholders(_ placeholders: [String: String]) {
    DispatchQueue.main.async {
      InAppStory.shared.placeholders = placeholders
    }
  }
  
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

  @objc
  public
    func setAppVersion(_ appVersion: String, appBuild: Int)
  {
    DispatchQueue.main.async {
      InAppStory.shared.appVersion = appVersion
      InAppStory.shared.appBuild = String(appBuild)
    }
  }
  @objc public func clearCache() {
    DispatchQueue.main.async {
      InAppStory.shared.clearCache()
    }
  }

  @objc public func preloadGames() {
    DispatchQueue.main.async {
      InAppStory.shared.preloadGames()
    }
  }
  @objc public func setOptions(_ options: [String: String]) {
    DispatchQueue.main.async {
      InAppStory.shared.options = options
    }
  }
}
