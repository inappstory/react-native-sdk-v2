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

## iOS Requirements

You need to install pods with static frameworks, use USE_FRAMEWORKS = 'static' or have this in your Podfile:

```js
use_frameworks! :linkage => :static
```

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

To use the library, create StoryService.ts, configure **storyManagerConfig** with your API key and adjust **appearanceManager** styles

```js
import {
  AppearanceManager,
  StoriesListCardTitlePosition,
  StoriesListCardViewVariant,
  StoryManager,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  StoriesListCardTitleTextAlign,
  type StoryManagerConfig,
} from 'react-native-inappstory-sdk';

import { Linking } from 'react-native';
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
  const storyManager = new StoryManager(storyManagerConfig);
  storyManager.getGoodsCallback((skus: string[]) => {
    //TODO: Fetch goods information
    return skus.map((sku) => ({
      sku: sku, //item sku
      title: 'title of ' + sku, //item title for cell
      subtitle: 'subtitle of ' + sku, //item subtitle for cell
      imageURL: 'URL', //image url for cell
      price: Number(Math.random() * 1000).toFixed(2), //price value for cell
      oldPrice: Number(Math.random() * 1000).toFixed(2),
    }));
  });
  storyManager.on('clickOnStory', (payload: any) =>
    console.log('clickOnStory', { payload })
  );
  storyManager.on('showStory', (payload: any) =>
    console.log('showStory', { payload })
  );
  storyManager.on('closeStory', (payload: any) =>
    console.log('closeStory', { payload })
  );
  storyManager.on('showSlide', (payload: any) =>
    console.log('showSlide', { payload })
  );
  storyManager.on('clickOnButton', (payload: any) =>
    console.log('clickOnButton', { payload })
  );
  storyManager.on('likeStory', (payload: any) =>
    console.log('likeStory', { payload })
  );
  storyManager.on('dislikeStory', (payload: any) =>
    console.log('dislikeStory', { payload })
  );
  storyManager.on('favoriteStory', (payload: any) =>
    console.log('favoriteStory', { payload })
  );
  storyManager.on('shareStory', (payload: any) =>
    console.log('shareStory', { payload })
  );
  storyManager.on('shareStoryWithPath', (payload: any) =>
    console.log('shareStoryWithPath', { payload })
  );

  // btn handler
  storyManager.storyLinkClickHandler = (payload: any) => {
    console.log({ payload });
    if (payload.data.url != null) {
      Linking.openURL(payload.data.url);
    }
  };

  return storyManager;
};

const createAppearanceManager = () => {
  return new AppearanceManager()
    .setCommonOptions({
      hasLike: true,
      hasLikeButton: true,
      hasDislikeButton: false,
      hasFavorite: true,
      hasShare: true,
    })
    .setStoriesListOptions({
      card: {
        title: {
          color: 'white',
          font: 'bold normal 14px/16px "InternalPrimaryFont"',
          padding: '0px 0 0 0',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: Platform.OS == 'ios' ? 'Bradley Hand' : 'Comic Sans',
          lineHeight: 13,
          lineClamp: 3,
          textAlign: StoriesListCardTitleTextAlign.LEFT,
          position: StoriesListCardTitlePosition.CARD_INSIDE_BOTTOM,
        },
        gap: 3,
        height: 150,
        variant: StoriesListCardViewVariant.RECTANGLE,
        border: {
          radius: 1,
          color: 'black',
          width: 2,
          gap: 1,
        },
        boxShadow: null,
        opacity: 1,
        mask: {
          color: 'rgba(34, 34, 34, 0.3)',
        },
        opened: {
          border: {
            radius: 0,
            color: 'red',
            width: 0,
            gap: 0,
          },
          boxShadow: null,
          opacity: 1,
          mask: {
            color: 'rgba(34, 34, 34, 0.1)',
          },
        },
      },
      favoriteCard: {
        title: {
          content: 'Saved',
        },
      },
      layout: {
        height: 0,
        backgroundColor: 'transparent',
      },
      sidePadding: 5,
      topPadding: 5,
      bottomPadding: 2,
      navigation: {
        showControls: false,
        controlsSize: 48,
        controlsBackgroundColor: 'white',
        controlsColor: 'black',
      },
    })
    .setStoryReaderOptions({
      closeButtonPosition: StoryReaderCloseButtonPosition.RIGHT,
      scrollStyle: StoryReaderSwipeStyle.FLAT,
      slideBorderRadius: 5,
    })
    .setStoryFavoriteReaderOptions({
      title: {
        content: 'Favorite',
        font: '1.6rem/1.4 InternalPrimaryFont',
        color: 'white',
      },
    });
};

export const storyManager = createStoryManager();

export const appearanceManager = createAppearanceManager();
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

### Goods

To use goods widget, add a function that returns products to getGoodsObject

```js
storyManager.getGoodsObject((skus) => {
  //TODO: return array of Goods
  return skus.map((sku) => ({
    sku: sku, //item sku
    title: 'title of ' + sku, //item title for cell
    subtitle: 'subtitle of ' + sku, //item subtitle for cell
    imageURL: '', //image url for cell
    price: Number(Math.random() * 1000).toFixed(2), //price value for cell
    oldPrice: Number(Math.random() * 1000).toFixed(2),
  }));
});
```

After goods item is selected,

```js
storyManager.on('goodItemSelected', (payload: any) => {
   // User selected payload.sku SKU
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

### Custom Icons

1. Add images to your project assets

2. Configure required InAppStorySDK icons before showing stories:

```js
InAppStorySDK.setLikeImage(image, activeImage);
InAppStorySDK.setDislikeImage(image, activeImage);
InAppStorySDK.setFavoriteImage(image, activeImage);
InAppStorySDK.setShareImage(image, activeImage);
InAppStorySDK.setSoundImage(image, activeImage);
InAppStorySDK.setCloseReaderImage(image);
InAppStorySDK.setRefreshImage(image);
InAppStorySDK.setRefreshGoodsImage(image);
InAppStorySDK.setCloseGoodsImage(image);
```

image and activeImage parameters are the names of the images in your assets folder.

```js
InAppStorySDK.setLikeImage('like', 'likeSelected');
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
