# react-native-inappstory-sdk

Wrapper for InAppStory

## Installation

```sh
npm install react-native-inappstory-sdk
```

or

```sh
yarn add react-native-inappstory-sdk
```

## iOS Requirements (This step will be removed after CocoaPods release)

1. Add required dependencies to Podfile

```ruby
#pod 'InAppStory', :git => 'https://github.com/inappstory/ios-sdk.git', :tag => '1.23.5'
pod 'InAppStoryUGC', :git => 'https://github.com/inappstory/ios-ugc-sdk.git', :tag => '1.3.1'
pod 'IASFilePicker', :git => 'https://github.com/inappstory/ios-filepicker.git', :tag => '0.1.0'
```

2. Run pod install
3. Open project in Xcode
4. Add **InAppStory.xcframework** (you can find it in example/ios/) to the project.
5. Open **Pods** in sidebar
6. Find **react-native-inappstory-sdk** in Pods
7. Open **Build Phases**
8. Add InAppStory.xcframework, InAppStoryUGC, IASFilePicker to **Link Binary With Libraries** step

FYI: You have to repeat steps 5-8 every time you run pod install.

## Android Requirements

Import InAppStory SDK in MainApplication

```java
import com.inappstorysdk.InAppStory;
```

Add following code to onCreate() function

```java
    InAppStory.initSDK(getApplicationContext())
```

## Usage

To use the library, create **storyManager** singleton with your API key and **appearanceManager** with styles (you can copy src/services/StoryService.js from example project to get started)

```js
const storyManagerConfig: StoryManagerConfig = {
  apiKey: 'test-key',
  userId: '1',
  tags: [],
  placeholders: {
    username: 'Guest',
  },
  lang: 'en',
  defaultMuted: true,
};
const createStoryManager = () => {
 return new StoryManager(storyManagerConfig);
}

export const storyManager = createStoryManager();
```

## Story View

To display feed, use StoriesList component

```js
import { StoriesList } from 'react-native-inappstory-sdk';

<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed={feedId}
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
  viewModelExporter={viewModelExporter}
/>;
```

## Custom Story Cell

To render custom cells, add renderCell function to **StoriesList**

```js
<StoriesList
  ...props
  renderCell={(story) => {
    return <Text>{story.storyID}</Text>;
  }}
/>
```

## Games

```js
InAppStorySDK.showGame(gameID);
```

## Tags

```js
InAppStorySDK.setTags(['tag1']);
```

## Placeholders

```js
InAppStorySDK.setPlaceholders({ username: 'John Doe' });
```

## Image Placeholders

```js
InAppStorySDK.setImagesPlaceholders({
  image1: 'https://example.com/image.jpg',
});
```

## Story Reader Appearance

```js
InAppStorySDK.setOverScrollToClose(value);
InAppStorySDK.setSwipeToClose(value);
InAppStorySDK.setTimerGradientEnable(value);
InAppStorySDK.setCloseButtonPosition(value);
InAppStorySDK.setScrollStyle(value);
InAppStorySDK.setPresentationStyle(value);
InAppStorySDK.setReaderBackgroundColor(value);
InAppStorySDK.setReaderCornerRadius(value);
```

## Likes, Share, Favorites

```js
InAppStorySDK.setHasLike(value);
InAppStorySDK.setHasShare(value);
InAppStorySDK.setHasFavorites(value);
```

## Sound

```js
//To change sound settings
InAppStorySDK.changeSound(value);
//Get sound status
const soundEnabled = await InAppStorySDK.getSound();
```

### UGC editor

```js
InAppStorySDK.showEditor();
```

### Goods

To use goods widget, add a function that returns products to getGoodsObject

```js
storyManager.getGoodsObject((skus) => {
  //TODO: return array of Goods
});
```

### Events

To subscribe to events, use **storyManager.on** or **storyManager.once**

```js
storyManager.on(eventName, (payload) => {
  console.log(eventName, payload);
});
```

| Event Name        |     |     |     |
| ----------------- | --- | --- | --- |
| storiesLoaded     |     |     |     |
| ugcStoriesLoaded  |     |     |     |
| clickOnStory      |     |     |     |
| showStory         |     |     |     |
| closeStory        |     |     |     |
| clickOnButton     |     |     |     |
| showSlide         |     |     |     |
| likeStory         |     |     |     |
| dislikeStory      |     |     |     |
| favoriteStory     |     |     |     |
| clickOnShareStory |     |     |     |
| storyWidgetEvent  |     |     |     |

## Feed Events

| Event                 |     |     |     |
| --------------------- | --- | --- | --- |
| storyListUpdate       |     |     |     |
| storyUpdate           |     |     |     |
| favoritesUpdate       |     |     |     |
| favoriteCellDidSelect |     |     |     |
| editorCellDidSelect   |     |     |     |
| favoritesUpdate       |     |     |     |

## Reader events

| Event               |     |     |     |
| ------------------- | --- | --- | --- |
| storyReaderWillShow |     |     |     |
| storyReaderDidClose |     |     |     |
| storiesDidUpdated   |     |     |     |
| scrollUpdate        |     |     |     |

## Failure events

| Event               |     |     |     |
| ------------------- | --- | --- | --- |
| sessionFailure      |     |     |     |
| storyFailure        |     |     |     |
| currentStoryFailure |     |     |     |
| networkFailure      |     |     |     |
| requestFailure      |     |     |     |

## Game Events

| Event              |     |     |     |
| ------------------ | --- | --- | --- |
| startGame          |     |     |     |
| finishGame         |     |     |     |
| closeGame          |     |     |     |
| eventGame          |     |     |     |
| gameFailure        |     |     |     |
| gameReaderWillShow |     |     |     |
| gameReaderDidClose |     |     |     |
| gameComplete       |     |     |     |

## Goods events

| Event            |     |     |     |
| ---------------- | --- | --- | --- |
| goodItemSelected |     |     |     |

## Share events

| Event        |     |     |     |
| ------------ | --- | --- | --- |
| customShare  |     |     |     |
| onActionWith |     |     |     |

### Migrating from old version

Breaking changes:

1. Font settings are defined using separate variables (fontSize, fontWeight, fontFamily) instead of a string
2. If you used svgMask in appearance manager, try to use custom cells to achieve same results.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
