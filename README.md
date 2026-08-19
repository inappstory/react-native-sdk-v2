# @inappstory/react-native-sdk

Wrapper for InAppStory

## Installation

```sh
npm install @inappstory/react-native-sdk
```

or

```sh
yarn add @inappstory/react-native-sdk
```

## iOS Requirements

You need to install pods with static frameworks, use USE_FRAMEWORKS = 'static' or have this in your Podfile:

```js
use_frameworks! :linkage => :static
```

## Android Requirements

Make sure you update your Android SDK versions in build.gradle

```
minSdkVersion = 23
compileSdkVersion = 34
targetSdkVersion = 34
```

Import InAppStory SDK in MainApplication

```java
import com.inappstory.reactnativesdk.InAppStory;
```

Add following code to onCreate() function

```java
    InAppStory.initSDK(getApplicationContext())
```

## Usage

To use the library, create StoryService.ts, configure **storyManagerConfig** with your API key and adjust **appearanceManager** styles

```ts
import {
  AppearanceManager,
  StoriesListCardTitlePosition,
  StoriesListCardViewVariant,
  StoryManager,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  StoriesListCardTitleTextAlign,
  type StoryManagerConfig, 
  CoverQuality
} from '@inappstory/react-native-sdk';

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
  storyManager.onShareStory((event: any) =>
    console.log('clickOnShareStory', event.body)
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
      coverQuality: CoverQuality.MEDIUM,
    })
    .setStoriesListOptions({
      card: {
        title: {
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

To display feed, use StoriesList component. **storiesListViewModel** allows to reload the story feed using **storiesListViewModel.current.reload()**.

```tsx
import { StoriesList } from '@inappstory/react-native-sdk';
import {
  type StoriesListViewModel,
} from '@inappstory/react-native-sdk';
...
const storiesListViewModel = React.useRef<StoriesListViewModel>();
const viewModelExporter = React.useCallback(
  (viewModel: StoriesListViewModel) =>
    (storiesListViewModel.current = viewModel),
  []
);
...

<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed={feedId}
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
  viewModelExporter={viewModelExporter}
/>;
```

## Favorites

If you use favorites, use **onFavoriteCell** event that fires when user clicks on favorites cell

```ts
storyManager.onFavoriteCell(() => {
  //Navigate to favorites screen
});
```

To display favorite stories, pass **favoritesOnly** to <StoriesList>

```tsx
<StoriesList favoritesOnly={true} />
```

## Vertical Stories list

To display items vertically, use **vertical=true**

```tsx
<StoriesList vertical={true} />
```

## Custom Story Cell

To render custom cells, add renderCell function to **StoriesList**

```tsx
<StoriesList
  ...props
  renderCell={(story, {isFirstItem, isLastItem}) => {
    return <Text>{story.storyID}</Text>;
  }}
/>
```

## Games

```ts
InAppStorySDK.showGame(gameID);
```

## Tags

```ts
InAppStorySDK.setTags(['tag1']);
```

A tag may contain only letters (any alphabet), digits, `_` and `-`, and the total
list size must not exceed 4096 bytes in UTF-8 (tag + separator; a Cyrillic
character counts as 2 bytes). If a rule is violated, the error is written to
`console.error` and the call never reaches the native SDK — the tags are not
applied, but the app does not crash.

## Placeholders

```ts
InAppStorySDK.setPlaceholders({ username: 'John Doe' });
```

## Image Placeholders

```ts
InAppStorySDK.setImagesPlaceholders({
  image1: 'https://example.com/image.jpg',
});
```

## Story Reader Appearance

```ts
InAppStorySDK.setOverScrollToClose(value);
InAppStorySDK.setSwipeToClose(value);
InAppStorySDK.setTimerGradientEnable(value);
InAppStorySDK.setCloseButtonPosition(value); // 'left' | 'right' | 'bottomLeft' | 'bottomRight'
InAppStorySDK.setScrollStyle(value); // 'cover' | 'flat' | 'cube' | 'depth'
InAppStorySDK.setPresentationStyle(value); // 'zoom' | 'modal' | 'fade'
InAppStorySDK.setReaderBackgroundColor(value);
InAppStorySDK.setReaderCornerRadius(value);
```

## Likes, Share, Favorites

```ts
InAppStorySDK.setHasLike(value);
InAppStorySDK.setHasShare(value);
InAppStorySDK.setHasFavorites(value);
```

## Sound

```ts
//To change sound settings
InAppStorySDK.changeSound(value);
//Get sound status
const soundEnabled = await InAppStorySDK.getSound();
```

### Goods

To use goods widget, add a function that returns products to getGoodsObject

```ts
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

```ts
storyManager.on('goodItemSelected', (payload: any) => {
   // User selected payload.sku SKU
});
```

### AppVersion override
The app version is used by the platform to enable targeting of stories by app versions.\
By default, IAS-SDK uses appVersion and appBundle from the native part of the application.\
But you can override appVersion and appBundle via StoryManagerConfig.\
This might be useful for CodePush users.

```ts
const storyManagerConfig: StoryManagerConfig = {
  apiKey,
  appVersion: {
    version: '3.0.0',
    build: 777,
  },
};
const storyManager = new StoryManager(storyManagerConfig);
```


### Events

To subscribe to events, use **storyManager.on** or **storyManager.once**

```js
storyManager.on(eventName, (payload) => {
  console.log(eventName, payload);
});
```

| Event Name        |                                                           |     |     |
|-------------------|-----------------------------------------------------------|-----|-----|
| showStory         | {id: Number, feed: String, action: String, slidesCount: Number} |     |     |
| closeStory        | {id: Number, feed: String, index: Number, action: String} |     |     |
| clickOnButton     | {id: Number, feed: String, index: Number, url: String}    |     |     |
| showSlide         | {id: Number, index: Number}                               |     |     |
| likeStory         | {id: Number, feed: String, index: Number, value: Boolean} |     |     |
| dislikeStory      | {id: Number, feed: String, index: Number, value: Boolean} |     |     |
| favoriteStory     | {id: Number, feed: String, index: Number, value: Boolean} |     |     |
| clickOnShareStory | {id: Number, feed: String, index: Number, payload: String} |     |     |
| storyWidgetEvent  | {id: Number, feed: String, name: String, data: Object}    |     |     |

## Feed Events

| Event                 | Payload                |     |     |
|-----------------------|------------------------|-----|-----|
| storyListUpdate       | {stories: [StoryData]} |     |     |
| storyUpdate           | StoryData              |     |     |

## Reader events

| Event               |                                        |     |     |
|---------------------|----------------------------------------|-----|-----|
| storyReaderWillShow | {feed: String, type: String}           |     |     |
| storyReaderDidClose | {feed: String, type: String}           |     |     |

## Failure events

| Event               |                                       |     |     |
|---------------------|---------------------------------------|-----|-----|
| sessionFailure      | {message: String}                     |     |     |
| storyFailure        | {message: String}                     |     |     |
| currentStoryFailure | {message: String}                     |     |     |
| networkFailure      | {message: String}                     |     |     |
| requestFailure      | {message: String, statusCode: String} |     |     |

## Logger

Forward the native SDK's internal logs (requests/responses, errors, technical
messages) to JS. Disabled by default — enable it, then subscribe:

```ts
storyManager.setLoggingEnabled(true);
storyManager.onLog((entry) => {
  console.log(`[${entry.level}] ${entry.message ?? ''}`);
});
```

`LogEntry` is `{ level: 'debug' | 'error'; message?: string }`.
`setLoggingEnabled(false)` stops the stream. The payload is identical on both
platforms — `level` is the severity (iOS derives it from the log's error field,
Android from `showELog`/`showDLog`). iOS log categories (`network`, `reader`,
`cache`, …) are not surfaced, as Android has no equivalent.

## Game Events

| Event              | Payload                                                     |     |     |
|--------------------|-------------------------------------------------------------|-----|-----|
| startGame          | {id: Number, gameID: String, feed: String}                  | game reader opened |     |
| closeGame          | {id: Number, gameID: String, feed: String}                  | game reader closed, including when the game finished |     |
| eventGame          | {id: Number, gameID: String, feed: String, name: String, payload: String} |     |     |
| gameFailure        | {id: Number, gameID: String, feed: String, message: String} |     |     |

## Goods events

| Event            | Payload       |     |     |
|------------------|---------------|-----|-----|
| goodItemSelected | {sku: String} |     |     |

## Share events

| Event        |     |     |     |
|--------------|-----|-----|-----|
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
