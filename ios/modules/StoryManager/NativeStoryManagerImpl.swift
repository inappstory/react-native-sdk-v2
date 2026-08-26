import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeStoryManagerImpl)
public class NativeStoryManagerImpl: NSObject {
  @objc var _userID: String = ""
  @objc var _userIdSign: String? = nil
  @objc var _lang: String = ""
  @objc private var goodsCache: [GoodObject] = []

  var storiesAPIs: [String: StoryListAPI] = [:]
  var favoriteStoriesAPI = StoryListAPI(isFavorite: true)
  var lastFavoriteIDs: Set<String>?
  var cancellationTokenMap: [String: CancellationToken] = [:]
  var iamContainerView: IAMContainerView?

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
    tags: [String],
    resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      // Logging state is owned by NativeStoryManager.setLoggingEnabled (off by
      // default); re-apply it here so this init doesn't reset the flag.
      NativeSystemEventsImpl.shared.applyLogging()
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
          anonymous: anonymous,
          tags: tags
        )
      )

      resolve(nil)
    }
  }
}
