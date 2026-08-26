import UIKit

func storyIDForJS(_ id: String?) -> Int {
  guard let id, let value = Int(id) else { return -1 }
  return value
}

extension UIApplication {
  var firstKeyWindow: UIWindow? {
    if #available(iOS 15.0, *) {
      return UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .filter { $0.activationState == .foregroundActive }
        .first?.keyWindow
    } else {
      return UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .filter { $0.activationState == .foregroundActive }
        .first?.windows
        .first(where: \.isKeyWindow)
    }
  }
}

extension UIColor {
  /// "#RRGGBB" or "#RRGGBBAA"
  public convenience init?(hex: String) {
    guard hex.hasPrefix("#") else { return nil }
    let hexColor = String(hex.dropFirst())
    let scanner = Scanner(string: hexColor)
    var hexNumber: UInt64 = 0
    guard scanner.scanHexInt64(&hexNumber) else { return nil }

    switch hexColor.count {
    case 6:
      self.init(
        red: CGFloat((hexNumber & 0xff0000) >> 16) / 255,
        green: CGFloat((hexNumber & 0x00ff00) >> 8) / 255,
        blue: CGFloat(hexNumber & 0x0000ff) / 255,
        alpha: 1
      )
    case 8:
      self.init(
        red: CGFloat((hexNumber & 0xff00_0000) >> 24) / 255,
        green: CGFloat((hexNumber & 0x00ff_0000) >> 16) / 255,
        blue: CGFloat((hexNumber & 0x0000_ff00) >> 8) / 255,
        alpha: CGFloat(hexNumber & 0x0000_00ff) / 255
      )
    default:
      return nil
    }
  }
}
