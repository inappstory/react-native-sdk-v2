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
import com.inappstorysdk.InAppStory;
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
storyManager.on('onFavoriteCell', () => {
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
InAppStorySDK.setCloseButtonPosition(value);
InAppStorySDK.setScrollStyle(value);
InAppStorySDK.setPresentationStyle(value);
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
| storiesLoaded     |                                                           |     |     |
| ugcStoriesLoaded  |                                                           |     |     |
| clickOnStory      | {id: String, feed: String, index: Number}                 |     |     |
| showStory         | {id: String, feed: String, action: String}                |     |     |
| closeStory        | {id: String, feed: String, index: Number, action: String} |     |     |
| clickOnButton     |                                                           |     |     |
| showSlide         | {id: String, index: Number}                               |     |     |
| likeStory         | {id: String, feed: String, value: Boolean}                |     |     |
| dislikeStory      | {id: String, feed: String, value: Boolean}                |     |     |
| favoriteStory     | {id: String, feed: String, value: Boolean}                |     |     |
| clickOnShareStory |                                                           |     |     |
| storyWidgetEvent  | {id: String, feed: String, name: String, data: String }   |     |     |

## Feed Events

| Event                 | Payload                |     |     |
|-----------------------|------------------------|-----|-----|
| storyListUpdate       | {stories: [StoryData]} |     |     |
| storyUpdate           | StoryData              |     |     |
| favoritesUpdate       | {}                     |     |     |
| favoriteCellDidSelect | {}                     |     |     |
| editorCellDidSelect   | {}                     |     |     |
| favoritesUpdate       | {}                     |     |     |

## Reader events

| Event               |                                        |     |     |
|---------------------|----------------------------------------|-----|-----|
| storyReaderWillShow | {type: String}                         |     |     |
| storyReaderDidClose | {type: String}                         |     |     |
| storiesDidUpdated   | {isContent: String, storyType: String} |     |     |
| scrollUpdate        | {index: String}                        |     |     |

## Failure events

| Event               |                                       |     |     |
|---------------------|---------------------------------------|-----|-----|
| sessionFailure      | {message: String}                     |     |     |
| storyFailure        | {message: String}                     |     |     |
| currentStoryFailure | {message: String}                     |     |     |
| networkFailure      | {message: String}                     |     |     |
| requestFailure      | {message: String, statusCode: String} |     |     |

## Game Events

| Event              | Payload                                                     |     |     |
|--------------------|-------------------------------------------------------------|-----|-----|
| startGame          | {id: String, gameID: String}                                |
| finishGame         | {id: String, gameID: String, result: String}                |     |     |
| closeGame          | {id: String, gameID: String}                                |     |     |
| eventGame          | {id: String, gameID: String, name: String, payload: Object} |     |     |
| gameFailure        | {id: String, gameID: String, message: String}               |     |     |
| gameReaderWillShow | {}                                                          |     |     |
| gameReaderDidClose | {}                                                          |     |     |
| gameComplete       | {data: Object, result: String, url: String}                 |     |     |

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
