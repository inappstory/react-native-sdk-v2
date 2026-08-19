import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

// Story/favorite list APIs, subscriptions and banner preloading.
extension NativeStoryManagerImpl {
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
}
