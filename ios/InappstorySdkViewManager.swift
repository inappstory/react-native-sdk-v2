import InAppStorySDK

@objc(InappstorySdkViewManager)
class InappstorySdkViewManager: RCTViewManager {
  var storyView: StoryView!
  override func view() -> (InappstorySdkView) {
    let rect = CGRect(x: 0, y: 0, width: 300, height: 150);
    let v = InappstorySdkView()
    storyView = StoryView(frame: rect, feed: "default", favorite: false)
    storyView.target = {
          let vc = UIApplication.shared.firstKeyWindow?.rootViewController

          return vc }()
    //storyView.insetForSection UIEdgeInsets
    //storyView.minimumLineSpacingForSection CGFloat
    //storyView.minimumInteritemSpacingForSection CGFloat
    storyView.sizeForItem = { return CGSize(width: 120.0, height: 120.0)}
    storyView.translatesAutoresizingMaskIntoConstraints = false
    //storyView.panelSettings = PanelSettings(like: true, favorites:false, share: true)
    v.addSubview(storyView)
     /// configuring the constants to display the list correctly
    var allConstraints: [NSLayoutConstraint] = []
    /// horizontally - from edge to edge
    let horConstraint = NSLayoutConstraint.constraints(withVisualFormat: "H:|-(0)-[storyView]-(0)-|",
                                                        options: [.alignAllLeading, .alignAllTrailing],
                                                        metrics: nil,
                                                        views: ["storyView": storyView!])
    allConstraints += horConstraint
    /// vertically - height 180pt with a 16pt indent at the top
    let vertConstraint = NSLayoutConstraint.constraints(withVisualFormat: "V:|-(16)-[storyView(180)]",
                                                        options: [.alignAllTop, .alignAllBottom],
                                                        metrics: nil,
                                                        views: ["storyView": storyView!])
    allConstraints += vertConstraint
    /// constraints activation
    NSLayoutConstraint.activate(allConstraints)

    storyView.create()
    
    return v
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

class InappstorySdkView : UIView {
  @objc var color: String = "" {
    didSet {
      self.backgroundColor = hexStringToUIColor(hexColor: color)
    }
  }
  @objc var userID: String = "" {
    didSet {
      let storyview = self.subviews.first(where: { $0 is StoryView }) as! StoryView
      storyview.refresh()
    }
  }
  @objc var tags: [String] = [""] {
    didSet {
      let storyview = self.subviews.first(where: { $0 is StoryView }) as! StoryView
      storyview.refresh(newTags: tags)
    }
  }

  @objc var placeholders: [String] = [""] {
    didSet {
      let storyview = self.subviews.first(where: { $0 is StoryView }) as! StoryView
      storyview.refresh()
    }
  }

  @objc var imagePlaceholders: [String] = [""] {
    didSet {
      let storyview = self.subviews.first(where: { $0 is StoryView }) as! StoryView
      storyview.refresh()
    }
  }

  func hexStringToUIColor(hexColor: String) -> UIColor {
    let stringScanner = Scanner(string: hexColor)

    if(hexColor.hasPrefix("#")) {
      stringScanner.scanLocation = 1
    }
    var color: UInt32 = 0
    stringScanner.scanHexInt32(&color)

    let r = CGFloat(Int(color >> 16) & 0x000000FF)
    let g = CGFloat(Int(color >> 8) & 0x000000FF)
    let b = CGFloat(Int(color) & 0x000000FF)

    return UIColor(red: r / 255.0, green: g / 255.0, blue: b / 255.0, alpha: 1)
  }
}
