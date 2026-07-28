import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeStoryManagerImpl)
public class NativeStoryManagerImpl: NSObject {
  @objc private var _userID: String = ""
  @objc private var _userIdSign: String? = nil
  @objc private var _lang: String = ""
  @objc private var _tags: [String] = [""]
  @objc private var goodsCache: [GoodObject] = []

  var storiesAPIs: [String: StoryListAPI] = [:]
  var favoriteStoriesAPI = StoryListAPI(isFavorite: true)
  private var lastFavoriteIDs: Set<String>?
  var cancellationTokenMap: [String: CancellationToken] = [:]
  private var iamContainerView: IAMContainerView?

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
    cacheSize: String?,
    anonymous: Bool,
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
      InAppStory.shared.panelSettings = NativeAppearanceManagerImpl.shared.panelSettings
      // the parameter is responsible for animation of the reader display when you tap on a story cell
      InAppStory.shared.presentationStyle = .zoom

      InAppStoryAPI.shared.plaform = ExternalPlatforms.reactNative

      InAppStory.shared.sandBox = sandbox
      InAppStory.shared.isStatisticDisabled = !sendStats
      self._userID = userID
      self._userIdSign = userIdSign
      InAppStory.shared.initWith(
        serviceKey: apiKey,
        settings: Settings(
          userID: userID,
          sign: userIdSign,
          anonymous: anonymous
        )
      )

      resolve(nil)
    }
  }

  private func listAPI(feed: String, uniqueId: String) -> StoryListAPI {
    if let api = storiesAPIs[uniqueId] { return api }
    let api = StoryListAPI(feed: feed)
    storiesAPIs[uniqueId] = api
    return api
  }

  private func attachHandlers(
    to api: StoryListAPI,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    api.storyUpdate = { [weak api] storyData in
      storyCallback([
        "storyID": storyIDForJS(storyData.storyID),
        "title": storyData.title,
        "coverImagePath": storyData.coverImagePath,
        "coverVideoPath": storyData.coverVideoPath,
        "backgroundColor": storyData.backgroundColor,
        "titleColor": storyData.titleColor,
        "opened": storyData.opened,
        "hasAudio": storyData.hasAudio,
        "list": "feed",
        "feed": storyData.storyData.feed,
        "aspectRatio": api?.cellRatio ?? 0,
        "slidesCount": storyData.storyData.slidesCount,
        "statTitle": storyData.storyData.title,
      ])
    }
    api.storyListUpdate = { [weak api] storiesList, isFavorite, feed in
      callback(
        [
          "stories": storiesList.map {
            [
              "storyID": storyIDForJS($0.storyID),
              "title": $0.title,
              "coverImagePath": $0.coverImagePath,
              "coverVideoPath": $0.coverVideoPath,
              "backgroundColor": $0.backgroundColor,
              "titleColor": $0.titleColor,
              "opened": $0.opened,
              "hasAudio": $0.hasAudio,
              "list": "feed",
              "feed": feed,
              "aspectRatio": api?.cellRatio ?? 0,
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

  @objc public func createSubscriberList(
    _ feed: String,
    uniqueId: String,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    attachHandlers(
      to: listAPI(feed: feed, uniqueId: uniqueId),
      callback: callback,
      storyCallback: storyCallback
    )
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

  @objc public func getStories(
    _ feed: String,
    uniqueId: String,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    let isNew = storiesAPIs[uniqueId] == nil
    let api = listAPI(feed: feed, uniqueId: uniqueId)
    attachHandlers(to: api, callback: callback, storyCallback: storyCallback)
    DispatchQueue.main.async {
      if isNew {
        api.getStoriesList()
      } else {
        api.setNewFeed(feed)
      }
    }
  }

  @objc public func getFavoriteStories(
    _ feed: String,
    callback: @escaping ([String: Any]) -> Void,
    storyCallback: @escaping ([String: Any]) -> Void
  ) {
    self.favoriteStoriesAPI.storyUpdate = { storyData in
      storyCallback([
        "storyID": storyIDForJS(storyData.storyID),
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
        "aspectRatio": self.favoriteStoriesAPI.cellRatio,
        "slidesCount": storyData.storyData.slidesCount,
        "statTitle": storyData.storyData.title,
      ])
    }
    self.favoriteStoriesAPI.storyListUpdate = { storiesList, isFavorite, feed in
      callback([
        "stories": storiesList.map {
          [
            "storyID": storyIDForJS($0.storyID),
            "title": $0.title,
            "coverImagePath": $0.coverImagePath,
            "coverVideoPath": $0.coverVideoPath,
            "backgroundColor": $0.backgroundColor,
            "titleColor": $0.titleColor,
            "opened": $0.opened,
            "hasAudio": $0.hasAudio,
            "list": "favorites",
            "feed": "default",
            "aspectRatio": self.favoriteStoriesAPI.cellRatio,
            "slidesCount": $0.storyData.slidesCount,
            "statTitle": $0.storyData.title,
          ]
        },
        "feed": "default",
        "list": "favorites",
      ])
    }

    self.favoriteStoriesAPI.favoritesUpdate = { [weak self] favorites in
      guard let self else { return }
      let ids = Set((favorites ?? []).map { $0.serverID })
      guard ids != self.lastFavoriteIDs else { return }
      self.lastFavoriteIDs = ids
      DispatchQueue.main.async {
        self.favoriteStoriesAPI.getStoriesList()
      }
    }

    DispatchQueue.main.async {
      self.favoriteStoriesAPI.getStoriesList()
    }
  }

  @objc public func selectStoryCellWith(_ storyID: String, uniqueId: String) {
    DispatchQueue.main.async {
      self.storiesAPIs[uniqueId]?.selectStoryCellWith(id: storyID)
    }
  }

  @objc public func selectFavoriteStoryCellWith(_ storyID: String) {
    DispatchQueue.main.async {
      self.favoriteStoriesAPI.selectStoryCellWith(id: storyID)
    }
  }

  @objc public func setVisibleWith(_ storyIDs: [String], uniqueId: String) {
    DispatchQueue.main.async {
      self.storiesAPIs[uniqueId]?.setVisibleWith(storyIDs: storyIDs)
    }
  }

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

  @objc public func setTags(_ tags: [String]) {
    DispatchQueue.main.async {
      NSLog("setTags")
      self._tags = tags
      //InAppStory.shared.settings = Settings(userID:self._userID,tags: self._tags, lang: self._lang)
      InAppStory.shared.settings?.tags = tags
      InAppStory.shared.setTags(tags)
    }
  }

  @objc public func addTags(_ tags: [String]) {
    DispatchQueue.main.async {
      NSLog("addTags")
      let current = InAppStory.shared.settings?.tags ?? []
      let merged = current + tags.filter { !current.contains($0) }
      self._tags = merged
      InAppStory.shared.settings?.tags = merged
      InAppStory.shared.setTags(merged)
    }
  }

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

  @objc public func setOptions(_ options: [String: String]) {
    DispatchQueue.main.async {
      InAppStory.shared.options = options
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

  @objc public func showIAMById(
    _ iamID: String,
    onlyPreloaded: Bool,
    operationId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    showIAM(operationId: operationId, resolve: resolve) { container, completion in
      InAppStory.shared.showInAppMessageWith(
        id: iamID,
        targetView: container,
        onlyPreloaded: onlyPreloaded,
        completion: completion
      )
    }
  }

  @objc public func showIAMByEvent(
    _ event: String,
    onlyPreloaded: Bool,
    operationId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    showIAM(operationId: operationId, resolve: resolve) { container, completion in
      InAppStory.shared.showInAppMessageWith(
        event: event,
        targetView: container,
        onlyPreloaded: onlyPreloaded,
        completion: completion
      )
    }
  }

  private func showIAM(
    operationId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    present: @escaping (_ container: IAMContainerView, _ completion: @escaping (Bool) -> Void)
      -> CancellationToken?
  ) {
    DispatchQueue.main.async { [self] in
      guard let host = UIApplication.shared.firstKeyWindow?.rootViewController?.view
      else {
        resolve(false)
        return
      }
      InAppStory.shared.inAppMessageDidClose = { [weak self] in
        self?.removeIAMContainer()
      }
      let container = iamContainerView ?? makeIAMContainer(host: host)
      cancellationTokenMap[operationId] = present(container) { [weak self] show in
        resolve(show)
        if !show { self?.removeIAMContainer() }
        self?.cancellationTokenMap.removeValue(forKey: operationId)
      }
    }
  }

  private func makeIAMContainer(host: UIView) -> IAMContainerView {
    let container = IAMContainerView()
    container.attach(to: host)
    iamContainerView = container
    return container
  }

  private func removeIAMContainer() {
    iamContainerView?.removeFromSuperview()
    iamContainerView = nil
  }

  @objc public func preloadIAM(
    _ ids: [String]?,
    tags: [String]?,
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      InAppStory.shared.preloadInAppMessages(ids: ids, tags: tags) { result in
        switch result {
        case .success:
          resolve(true)
        case .failure:
          resolve(false)
        }
      }
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

  // @objc
  // override static func requiresMainQueueSetup() -> Bool {
  //   return true
  // }
}

final class IAMContainerView: UIView {
  func attach(to host: UIView) {
    translatesAutoresizingMaskIntoConstraints = false
    host.addSubview(self)
    NSLayoutConstraint.activate([
      topAnchor.constraint(equalTo: host.topAnchor),
      leadingAnchor.constraint(equalTo: host.leadingAnchor),
      trailingAnchor.constraint(equalTo: host.trailingAnchor),
      bottomAnchor.constraint(equalTo: host.bottomAnchor),
    ])
  }

  override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
    let hit = super.hitTest(point, with: event)
    return hit == self ? nil : hit
  }
}
