import InAppStorySDK

@objc(BannerViewManager)
class BannerViewManager: RCTViewManager {
  override func view() -> UIView! {
    return BannerView()
  }

  override static func requiresMainQueueSetup() -> Bool { return true }

  private func withView(_ reactTag: NSNumber, _ action: @escaping (BannerView) -> Void) {
    DispatchQueue.main.async {
      guard let view = BannerView.view(forReactTag: reactTag) else { return }
      action(view)
    }
  }

  @objc func pause(_ reactTag: NSNumber) {
    withView(reactTag) { $0.pause() }
  }

  @objc func resume(_ reactTag: NSNumber) {
    withView(reactTag) { $0.resume() }
  }

  @objc func showNext(_ reactTag: NSNumber) {
    withView(reactTag) { $0.showNext() }
  }

  @objc func showPrevious(_ reactTag: NSNumber) {
    withView(reactTag) { $0.showPrevious() }
  }

  @objc func showBannerWith(_ reactTag: NSNumber, index: NSInteger) {
    withView(reactTag) { $0.showBannerWith(index: index) }
  }
}
