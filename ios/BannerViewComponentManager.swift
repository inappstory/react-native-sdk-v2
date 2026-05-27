import InAppStorySDK

@objc(BannerViewManager)
class BannerViewManager: RCTViewManager {
  override func view() -> UIView! {
    let bannerView = BannerView()
    bannerView.createBannerView()
    return bannerView
  }

  override static func requiresMainQueueSetup() -> Bool { return true }

  @objc func pause(_ reactTag: NSNumber) {
    self.bridge.uiManager.addUIBlock { uiManager, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? BannerView else { return }
      view.pause()
    }
  }

  @objc func resume(_ reactTag: NSNumber) {
    self.bridge.uiManager.addUIBlock { uiManager, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? BannerView else { return }
      view.resume()
    }
  }

  @objc func showNext(_ reactTag: NSNumber) {
    self.bridge.uiManager.addUIBlock { uiManager, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? BannerView else { return }
      view.showNext()
    }
  }

  @objc func showPrevious(_ reactTag: NSNumber) {
    self.bridge.uiManager.addUIBlock { uiManager, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? BannerView else { return }
      view.showPrevious()
    }
  }

  @objc func showBannerWith(_ reactTag: NSNumber, index: Int) {
    self.bridge.uiManager.addUIBlock { uiManager, viewRegistry in
      guard let view = viewRegistry?[reactTag] as? BannerView else { return }
      view.showBannerWith(index: index)
    }
  }
}
