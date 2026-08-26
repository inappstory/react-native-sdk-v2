import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

// In-app messages: presentation, preloading and the host container view.
extension NativeStoryManagerImpl {
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
