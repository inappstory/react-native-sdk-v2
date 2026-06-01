import InAppStorySDK

@objc(BannerViewManager)
class BannerViewManager: RCTViewManager {
  override func view() -> UIView! {
    return BannerView()
  }

  override static func requiresMainQueueSetup() -> Bool { return true }

  @objc override func commandsMap() -> [AnyHashable: Any]! {
    return [
      "pause": 0,
      "resume": 1,
      "showNext": 2,
      "showPrevious": 3,
      "showBannerWith": 4,
    ]
  }

  @objc override func receiveCommand(_ view: UIView, commandType: Any, args: [Any]?) {
    guard let bannerView = view as? BannerView else { return }

    var commandId: Int = -1
    if let numId = commandType as? NSNumber {
      commandId = numId.intValue
    } else if let strId = commandType as? String, let parsed = Int(strId) {
      commandId = parsed
    }

    switch commandId {
    case 0:
      bannerView.pause()
    case 1:
      bannerView.resume()
    case 2:
      bannerView.showNext()
    case 3:
      bannerView.showPrevious()
    case 4:
      if let args = args, let index = args.first as? NSNumber {
        bannerView.showBannerWith(index: index.intValue)
      }
    default:
      break
    }
  }
}
