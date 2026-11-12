import Foundation
import React
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
  private let layoutType: IASBannersAppearance.LayoutType
  private var needsAppearanceUpdate = false
  private var manuallyPaused = false
  private var generation = 0
  private var configuration: BannerConfiguration?

  private struct BannerConfiguration: Equatable {
    let placeId: String
    let shouldLoop: Bool
    let sideInset: CGFloat
    let leadingInset: CGFloat
    let trailingInset: CGFloat
    let interItemSpacing: CGFloat
    let cornerRadius: CGFloat
    let columnSpacing: CGFloat
    let rowSpacing: CGFloat
  }

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

  @objc var columnSpacing: CGFloat = 8.0 {
    didSet {
      updateComponent()
    }
  }

  @objc var rowSpacing: CGFloat = 8.0 {
    didSet {
      updateComponent()
    }
  }

  convenience override init(frame: CGRect) {
    self.init(frame: frame, layoutType: .horizontalCenterend)
  }

  init(frame: CGRect = .zero, layoutType: IASBannersAppearance.LayoutType) {
    self.layoutType = layoutType
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    self.layoutType = .horizontalCenterend
    super.init(coder: coder)
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil || manuallyPaused {
      _bannersView?.pause()
    } else {
      _bannersView?.resume()
    }
    // reactTag is assigned at creation time, so it is available here.
    guard window != nil, let tag = reactTag?.intValue else { return }
    registeredTag = tag
    BannerView.registry[tag] = WeakRef(self)
  }

  deinit {
    _bannersView?.bannersDidUpdated = nil
    _bannersView?.bannersDidScroll = nil
    _bannersView?.pause()
    if let tag = registeredTag {
      BannerView.registry.removeValue(forKey: tag)
    }
  }

  func updateComponent() {
    needsAppearanceUpdate = true
  }

  override func didSetProps(_ changedProps: [String]!) {
    super.didSetProps(changedProps)
    if needsAppearanceUpdate {
      needsAppearanceUpdate = false
      applyAppearance()
    }
  }

  private func applyAppearance() {
    let next = BannerConfiguration(
      placeId: placeId as String,
      shouldLoop: shouldLoop,
      sideInset: sideInset,
      leadingInset: leadingInset,
      trailingInset: trailingInset,
      interItemSpacing: interItemSpacing,
      cornerRadius: cornerRadius,
      columnSpacing: columnSpacing,
      rowSpacing: rowSpacing
    )
    guard next != configuration else { return }
    configuration = next
    self.bannersAppearance = IASBannersAppearance(
      layoutType: self.layoutType,
      shouldLoop: self.shouldLoop,
      sideInset: self.sideInset,
      leadingInset: self.leadingInset,
      trailingInset: self.trailingInset,
      interItemSpacing: self.interItemSpacing,
      cornerRadius: self.cornerRadius,
      maxBannersCount: self.layoutType == .verticalList ? nil : 20,
      columnSpacing: self.columnSpacing,
      rowSpacing: self.rowSpacing
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
    generation += 1
    let currentGeneration = generation
    if self._bannersView != nil {
      self._bannersView?.bannersDidUpdated = nil
      self._bannersView?.bannersDidScroll = nil
      self._bannersView?.pause()
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
        guard generation == currentGeneration else { return }
        if onPlaceLoaded != nil {
          let emptyList = layoutType == .verticalList && (!isContent || count <= 0)
          onPlaceLoaded!(["size": emptyList ? 0 : count, "widgetHeight": emptyList ? 0 : listHeight])
        }
      }
    }
    
    self._bannersView?.bannersDidScroll = { [weak self] index in
      guard let self else { return }
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        guard generation == currentGeneration else { return }
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
    if manuallyPaused || window == nil {
      _bannersView?.pause()
    }
  }

  @objc func pause() {
    manuallyPaused = true
    _bannersView?.pause()
  }

  @objc func resume() {
    manuallyPaused = false
    guard window != nil else { return }
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

  @objc func refresh() {
    _bannersView?.refresh()
  }
}
