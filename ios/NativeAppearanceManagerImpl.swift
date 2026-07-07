import Foundation
@_spi(QAApp) import InAppStorySDK
@_spi(IAS_API) import InAppStorySDK
import React

@objc(NativeAppearanceManagerImpl)
public class NativeAppearanceManagerImpl: NSObject {

  @objc private var _hasLike: Bool = true
  @objc private var _hasDislike: Bool = true
  @objc private var _hasFavorites: Bool = true
  @objc private var _hasShare: Bool = true

  @objc public static let shared = NativeAppearanceManagerImpl()

  override init() {
    super.init()
  }

  @objc public func setHasLike(_ value: Bool) {
    _hasLike = value
    InAppStory.shared.panelSettings = PanelSettings(
      like: self._hasLike,
      favorites: self._hasFavorites,
      share: self._hasShare
    )
  }

  @objc public func setHasFavorites(_ value: Bool) {
    _hasFavorites = value
    InAppStory.shared.panelSettings = PanelSettings(
      like: self._hasLike,
      favorites: self._hasFavorites,
      share: self._hasShare
    )
  }

  @objc public func setHasShare(_ value: Bool) {
    _hasShare = value
    InAppStory.shared.panelSettings = PanelSettings(
      like: self._hasLike,
      favorites: self._hasFavorites,
      share: self._hasShare
    )
  }

  @objc public func setTimerGradientEnable(_ value: Bool) {
    DispatchQueue.main.async {
      InAppStory.shared.timerGradientEnable = value
    }
  }

  @objc public func setSwipeToClose(_ value: Bool) {
    DispatchQueue.main.async {
      InAppStory.shared.swipeToClose = value
    }
  }

  @objc public func setOverScrollToClose(_ value: Bool) {
    DispatchQueue.main.async {
      InAppStory.shared.overScrollToClose = value
    }
  }
  // @objc
  // func setTimerGradient(_ value: Bool) {
  //       DispatchQueue.main.async {
  //         //FIXME: InAppStory.shared.timerGradient = value
  //       }
  // }
  // @objc
  // func setPlaceholderElementColor(_ value: String) {
  //       DispatchQueue.main.async {
  //           InAppStory.shared.placeholderElementColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setPlaceholderBackgroundColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.placeholderBackgroundColor = UIColor(hex: value)!
  //       }
  // }

  @objc public func setReaderBackgroundColor(_ value: String) {
    DispatchQueue.main.async {
      InAppStory.shared.readerBackgroundColor = UIColor(hex: value)!
    }
  }

  @objc public func setReaderCornerRadius(_ value: Double) {
    DispatchQueue.main.async {
      InAppStory.shared.readerCornerRadius = CGFloat(value)
    }
  }

  @objc public func setCoverQuality(_ value: String) {
    DispatchQueue.main.async {
      switch value {
      case "medium":
        InAppStory.shared.coverQuality = .medium
      case "high":
        InAppStory.shared.coverQuality = .high
      default:
        InAppStory.shared.coverQuality = .medium
      }
    }
  }

  // @objc
  // func setShowCellTitle(_ value: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.showCellTitle = value
  //       }
  // }

  // @objc
  // func setCellGradientEnabled(_ value: Bool) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.cellGradientEnabled = value
  //       }
  // }

  // @objc
  // func setCellGradientRadius(_ value: Double) {
  //     DispatchQueue.main.async {
  //       InAppStory.shared.cellBorderRadius = CGFloat(value)
  //     }
  // }

  // @objc
  // func setCellBorderColor(_ value: String) {
  //       DispatchQueue.main.async {
  //           InAppStory.shared.cellBorderColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setGoodsCellImageBackgroundColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellImageBackgroundColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setGoodsCellImageCornerRadius(_ value: Double) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellImageCornerRadius = CGFloat(value)
  //       }
  // }

  // @objc
  // func setGoodsCellMainTextColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellMainTextColor = UIColor(hex: value)!
  //       }
  // }

  // @objc
  // func setGoodsCellOldPriceTextColor(_ value: String) {
  //       DispatchQueue.main.async {
  //         InAppStory.shared.goodsCellOldPriceTextColor = UIColor(hex: value)!
  //       }
  // }
  /*
    @objc
    func setCellFont(_ value: String) {
          DispatchQueue.main.async {
            InAppStory.shared.cellFont = RCTConvert.uiColor(value)
          }
    }
  */
  @objc public func setPresentationStyle(_ value: String) {
    DispatchQueue.main.async {
      switch value {
      case "crossDissolve":
        InAppStory.shared.presentationStyle = .crossDissolve
      case "modal":
        InAppStory.shared.presentationStyle = .modal
      case "zoom":
        InAppStory.shared.presentationStyle = .zoom
      default:
        InAppStory.shared.presentationStyle = .crossDissolve
      }
    }
  }

  @objc public func setScrollStyle(_ value: String) {
    DispatchQueue.main.async {
      switch value {
      case "cover":
        InAppStory.shared.scrollStyle = .cover
      case "flat":
        InAppStory.shared.scrollStyle = .flat
      case "cube":
        InAppStory.shared.scrollStyle = .cube
      case "depth":
        InAppStory.shared.scrollStyle = .depth
      default:
        InAppStory.shared.scrollStyle = .cover
      }
    }
  }

  @objc public func setCloseButtonPosition(_ value: String) {
    DispatchQueue.main.async {
      switch value {
      case "bottomLeft":
        InAppStory.shared.closeButtonPosition = .leadingBottom
      case "bottomRight":
        InAppStory.shared.closeButtonPosition = .trailingBottom
      case "left":
        InAppStory.shared.closeButtonPosition = .leading
      case "right":
        InAppStory.shared.closeButtonPosition = .trailing
      default:
        InAppStory.shared.closeButtonPosition = .trailing
      }
    }
  }

   @objc public func setLikeImage(_ image: String, selected selectedImage: String) {
     InAppStory.shared.likeImage = UIImage(named: image)!
     InAppStory.shared.likeSelectedImage = UIImage(named: selectedImage)!
   }

   @objc public func setDislikeImage(_ image: String, selected selectedImage: String) {
     InAppStory.shared.dislikeImage = UIImage(named: image)!
     InAppStory.shared.dislikeSelectedImage = UIImage(named: selectedImage)!
   }

   @objc public func setFavoriteImage(_ image: String, selected selectedImage: String) {
     InAppStory.shared.favoriteImage = UIImage(named: image)!
     InAppStory.shared.favoriteSelectedImag = UIImage(named: selectedImage)!
   }

   @objc public func setShareImage(_ image: String, selected selectedImage: String) {
     InAppStory.shared.shareImage = UIImage(named: image)!
     InAppStory.shared.shareSelectedImage = UIImage(named: selectedImage)!
   }

   @objc public func setSoundImage(_ image: String, selected selectedImage: String) {
     InAppStory.shared.soundImage = UIImage(named: image)!
     InAppStory.shared.soundSelectedImage = UIImage(named: selectedImage)!
   }

   @objc public func setCloseReaderImage(_ image: String) {
     InAppStory.shared.closeReaderImage = UIImage(named: image)!
   }

   @objc public func setRefreshImage(_ image: String) {
     InAppStory.shared.refreshImage = UIImage(named: image)!
   }

   @objc public func setRefreshGoodsImage(_ image: String) {
     InAppStory.shared.refreshImage = UIImage(named: image)!
   }

   @objc public func setCloseGoodsImage(_ image: String) {
     InAppStory.shared.goodsCloseImage = UIImage(named: image)!
   }

  // @objc
  // func addProductToCache(_ sku: String, title: String, subtitle: String, imageURL: String, price: String, oldPrice: String) {
  //   let goodObject = GoodObject(sku: sku,
  //                               title:title,
  //                               subtitle: subtitle,
  //                               imageURL: URL(string: imageURL),
  //                               price: price,
  //                               oldPrice: oldPrice)
  //     self.goodsCache.append(goodObject)
  // }

  //  @objc
  //  override static func requiresMainQueueSetup() -> Bool {
  //    return true
  //  }
}

// extension UIApplication {
//     var firstKeyWindow: UIWindow? {
//         if #available(iOS 15.0, *) {
//             return UIApplication.shared.connectedScenes
//                 .compactMap { $0 as? UIWindowScene }
//                 .filter { $0.activationState == .foregroundActive }
//                 .first?.keyWindow
//         } else {
//             return UIApplication.shared.connectedScenes
//                         .compactMap { $0 as? UIWindowScene }
//                         .filter { $0.activationState == .foregroundActive }
//                         .first?.windows

//                         .first(where: \.isKeyWindow)
//         }

//     }
// }

// extension UIColor {
//     public convenience init?(hex: String) {
//         let r, g, b, a: CGFloat

//         if hex.hasPrefix("#") {
//             let start = hex.index(hex.startIndex, offsetBy: 1)
//             let hexColor = String(hex[start...])

//             if hexColor.count == 6 {
//                 let scanner = Scanner(string: hexColor)
//                 var hexNumber: UInt64 = 0

//                 if scanner.scanHexInt64(&hexNumber) {
//                     r = CGFloat((hexNumber & 0xff000000) >> 24) / 255
//                     g = CGFloat((hexNumber & 0x00ff0000) >> 16) / 255
//                     b = CGFloat((hexNumber & 0x0000ff00) >> 8) / 255
//                     a = 1

//                     self.init(red: r, green: g, blue: b, alpha: a)
//                     return
//                 }
//             }
//             if hexColor.count == 8 {
//                 let scanner = Scanner(string: hexColor)
//                 var hexNumber: UInt64 = 0

//                 if scanner.scanHexInt64(&hexNumber) {
//                     r = CGFloat((hexNumber & 0xff000000) >> 24) / 255
//                     g = CGFloat((hexNumber & 0x00ff0000) >> 16) / 255
//                     b = CGFloat((hexNumber & 0x0000ff00) >> 8) / 255
//                     a = CGFloat(hexNumber & 0x000000ff) / 255

//                     self.init(red: r, green: g, blue: b, alpha: a)
//                     return
//                 }
//             }
//         }

//         return nil
//     }
// }
