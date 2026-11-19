import InAppStorySDK
import React

@objc(BannerListViewManager)
class BannerListViewManager: RCTViewManager {
  override func view() -> UIView! {
    BannerView(frame: .zero, layoutType: .verticalList)
  }

  override static func requiresMainQueueSetup() -> Bool { true }

  private func withView(_ reactTag: NSNumber, _ action: @escaping (BannerView) -> Void) {
    DispatchQueue.main.async {
      guard let view = BannerView.view(forReactTag: reactTag) else { return }
      action(view)
    }
  }

  @objc func refresh(_ reactTag: NSNumber) {
    withView(reactTag) { $0.refresh() }
  }

  @objc func pause(_ reactTag: NSNumber) {
    withView(reactTag) { $0.pause() }
  }

  @objc func resume(_ reactTag: NSNumber) {
    withView(reactTag) { $0.resume() }
  }
}
