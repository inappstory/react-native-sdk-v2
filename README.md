# react-native-inappstory-sdk

Wrapper for InAppStory

## Installation

```sh
npm install react-native-inappstory-sdk
```

## Usage

To use the library, create storyManager singleton with your API key

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

```js
<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed={feedId}
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
  viewModelExporter={viewModelExporter}
/>
```

## Custom Story Cell

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
InAppStorySDK.changeSound(value);
```

### UGC

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
