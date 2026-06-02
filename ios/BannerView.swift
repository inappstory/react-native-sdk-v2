import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import UIKit

class BannerView: UIView {

  // On the New Architecture (Fabric) the view is created by the legacy
  // view-manager interop and is NOT registered in the Paper UIManager's
  // viewRegistry, so resolving it by reactTag through `addUIBlock` fails.
  // We keep our own reactTag -> view registry to dispatch commands reliably
  // on both architectures.
  private final class WeakRef {
    weak var view: BannerView?
    init(_ view: BannerView) { self.view = view }
  }
  private static var registry: [Int: WeakRef] = [:]
  private var registeredTag: Int?

  static func view(forReactTag reactTag: NSNumber) -> BannerView? {
    return registry[reactTag.intValue]?.view
  }

  private var _bannersView: IASBannersView?

  private var bannersAppearance: IASBannersAppearance?

  @objc var onScroll: RCTDirectEventBlock?
  @objc var onPlaceLoaded: RCTDirectEventBlock?

  @objc var placeId: NSString = "default" {
    didSet {
      updateComponent()
    }
  }

  @objc var shouldLoop: Bool = true {
    didSet {
      updateComponent()
    }
  }

  @objc var sideInset: CGFloat = 0.0 {
    didSet {
      updateComponent()
    }
  }

  @objc var leadingInset: CGFloat = 0.0 {
    didSet {
      updateComponent()
    }
  }

  @objc var trailingInset: CGFloat = 0.0 {
    didSet {
      updateComponent()
    }
  }

  @objc var interItemSpacing: CGFloat = 8.0 {
    didSet {
      updateComponent()
    }
  }

  @objc var cornerRadius: CGFloat = 16.0 {
    didSet {
      updateComponent()
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    //    createBannerView()

  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    // reactTag is assigned at creation time, so it is available here.
    guard window != nil, let tag = reactTag?.intValue else { return }
    registeredTag = tag
    BannerView.registry[tag] = WeakRef(self)
  }

  deinit {
    if let tag = registeredTag {
      BannerView.registry.removeValue(forKey: tag)
    }
  }

  func updateComponent() {
    self.bannersAppearance = IASBannersAppearance(
      shouldLoop: self.shouldLoop,
      sideInset: self.sideInset,
      leadingInset: self.leadingInset,
      trailingInset: self.trailingInset,
      interItemSpacing: self.interItemSpacing,
      cornerRadius: self.cornerRadius
    )
    createBannerView()
    //    guard let bannersView = _bannersView else { return }
    //    _view?.addSubview(_bannersView!)
    ////    NSLayoutConstraint.activate([
    ////      bannersView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
    ////      bannersView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    ////      bannersView.topAnchor.constraint(equalTo: view.topAnchor),
    ////      bannersView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ////    ])
    //    _bannersView?.create()
  }

  func setBannerAppearance(_ appearance: IASBannersAppearance) {
    self.bannersAppearance = appearance
  }

  func createBannerView() {
    if self._bannersView != nil {
      self._bannersView?.removeFromSuperview()
      self._bannersView = nil
    }
    if self.bannersAppearance != nil {

      self._bannersView = IASBannersView(
        placeID: self.placeId as String,
        appearance: self.bannersAppearance!,
        frame: .zero
      )
    } else {
      self._bannersView = IASBannersView(
        placeID: self.placeId as String,
        appearance: .init(),
        frame: .zero
      )
    }

    self._bannersView?.translatesAutoresizingMaskIntoConstraints = false
    self._bannersView?.bannersDidUpdated = {
      [weak self] isContent, count, listHeight in
      guard let self else { return }
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        if onPlaceLoaded != nil {
          onPlaceLoaded!(["size": count, "widgetHeight": listHeight])
        }
      }
    }
    
    self._bannersView?.bannersDidScroll = { [weak self] index in
      guard let self else { return }
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        if onScroll != nil {
          onScroll!(["index": index])
        }
      }
    }
    addSubview(self._bannersView!)

    var allConstraints: [NSLayoutConstraint] = []
    let horConstraint = NSLayoutConstraint.constraints(
      withVisualFormat: "H:|-(0)-[_bannersView]-(0)-|",
      options: [.alignAllLeading, .alignAllTrailing],
      metrics: nil,
      views: ["_bannersView": _bannersView!]
    )
    allConstraints += horConstraint
    let vertConstraint = NSLayoutConstraint.constraints(
      withVisualFormat: "V:|-(0)-[_bannersView]-(0)-|",
      options: [.alignAllTop, .alignAllBottom],
      metrics: nil,
      views: ["_bannersView": _bannersView!]
    )
    allConstraints += vertConstraint
    NSLayoutConstraint.activate(allConstraints)

    _bannersView?.create()
  }

  @objc func pause() {
    _bannersView?.pause()
  }

  @objc func resume() {
    _bannersView?.resume()
  }

  @objc func showNext() {
    _bannersView?.showNext()
  }

  @objc func showPrevious() {
    _bannersView?.showPrevious()
  }

  @objc func showBannerWith(index: Int) {
    _bannersView?.showBannerWith(index: index)
  }
}
