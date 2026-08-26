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

## iOS Setup

Install CocoaPods dependencies:

```sh
cd ios && pod install
```

> **Note on `use_frameworks!`:** The SDK works out of the box with standard CocoaPods setups. If your project explicitly requires static frameworks (`use_frameworks! :linkage => :static` or `USE_FRAMEWORKS=static`), that is also supported.

## Android Requirements

Make sure you update your Android SDK versions in `build.gradle`:

```groovy
minSdkVersion = 23
compileSdkVersion = 34
targetSdkVersion = 34
```

Import InAppStory SDK in `MainApplication.kt` (or `MainApplication.java`):

```kotlin
import com.inappstory.reactnativesdk.InAppStory
```

Add following code to `onCreate()` function:

```kotlin
InAppStory.initSDK(this)
```

*(In Java: `InAppStory.Companion.initSDK(this);`)*

## Usage

To use the library, create `StoryService.ts`, configure **storyManagerConfig** with your API key and adjust **appearanceManager** styles:

```ts
import {
  AppearanceManager,
  CoverQuality,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  StoryManager,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  type StoryManagerConfig,
  type LogEntry,
} from '@inappstory/react-native-sdk';
import { Linking, Platform } from 'react-native';

export const storyManagerConfig: StoryManagerConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  userId: '1',
  tags: [],
  placeholders: {
    username: 'Guest',
  },
  lang: 'en',
  defaultMuted: true,
  sendStatistics: true,
};

export const createStoryManager = (config: StoryManagerConfig = storyManagerConfig) => {
  const storyManager = new StoryManager(config);

  // Enable and forward native SDK logs to JS console
  storyManager.setLoggingEnabled(true);
  storyManager.onLog((entry: LogEntry) => {
    console.log(`[IAS ${entry.level}] ${entry.message ?? ''}`);
  });

  // Failure events: session / story / network / request errors
  storyManager.onFailure((event: { withName: string; body: any }) => {
    console.warn(`[IAS failure] ${event.withName}`, event.body);
  });

  // Goods for the goods widget
  storyManager.getGoods((skus: string[]) => {
    // TODO: Fetch goods information
    return skus.map((sku) => ({
      sku: sku, // item sku
      title: 'title of ' + sku, // item title for cell
      subtitle: 'subtitle of ' + sku, // item subtitle for cell
      imageURL: 'URL', // image url for cell
      price: Number(Math.random() * 1000).toFixed(2), // price value for cell
      oldPrice: Number(Math.random() * 1000).toFixed(2),
    }));
  });

  // Button / CTA link handler
  storyManager.storyLinkClickHandler = (payload: any) => {
    console.log('CTA clicked', payload);
    if (payload.data?.url != null) {
      Linking.openURL(payload.data.url);
    }
  };

  return storyManager;
};

export const createAppearanceManager = () => {
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
          padding: '10px 10 10 10',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: Platform.OS === 'ios' ? 'Bradley Hand' : 'Comic Sans',
          lineHeight: 14,
          lineClamp: 3,
          textAlign: StoriesListCardTitleTextAlign.LEFT,
          position: StoriesListCardTitlePosition.CARD_INSIDE_BOTTOM,
        },
        gap: 12,
        height: 150,
        variant: StoriesListCardViewVariant.RECTANGLE,
        border: {
          radius: 8,
          color: '#2c60eaff',
          width: 2,
          gap: 4,
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
      sidePadding: 12,
      topPadding: 12,
      bottomPadding: 12,
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
    });
};

export const storyManager = createStoryManager();
export const appearanceManager = createAppearanceManager();
```

> **Note on async initialization:** `new StoryManager(config)` starts native initialization in the background. Alternatively, `await StoryManager.create(config)` returns a Promise that rejects if native initialization fails.

## Story View

To display the feed, use the `StoriesList` component. Pass a `ref` with `StoriesListRef` to imperatively reload the feed via `storiesListRef.current?.reload()`.

```tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  StoriesList,
  type StoriesListRef,
  type ListLoadStatus,
} from '@inappstory/react-native-sdk';
import { storyManager, appearanceManager } from './StoryService';

export const FeedScreen = () => {
  const storiesListRef = useRef<StoriesListRef>(null);

  useEffect(() => {
    // Subscribe to reader events
    storyManager.onStoryReaderWillShow((event: any) => {
      console.log('Story reader will show:', event);
    });
    storyManager.onShowStory((event: any) => {
      console.log('Show story:', event);
    });
  }, []);

  const onLoadStart = () => {
    console.log('Feed load started');
  };

  const onLoadEnd = (status: ListLoadStatus) => {
    console.log(`Feed loaded: ${status.defaultListLength} stories`);
  };

  return (
    <View style={styles.container}>
      <StoriesList
        ref={storiesListRef}
        storyManager={storyManager}
        appearanceManager={appearanceManager}
        feed="default"
        showFavorites={true}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Favorites

If you use favorites, use the `onFavoriteCell` event that fires when the user clicks on the favorites cell:

```ts
storyManager.onFavoriteCell(() => {
  // Navigate to favorites screen
});
```

To display favorite stories only, pass `favoritesOnly={true}`:

```tsx
<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed="default"
  favoritesOnly={true}
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
/>
```

To show the favorites cell inside the normal feed, pass `showFavorites={true}`:

```tsx
<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed="default"
  showFavorites={true}
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
/>
```

### Favorite Management Methods

```ts
// Get the number of favorite stories
const count = await storyManager.favoritesCount();

// Remove a specific story from favorites
storyManager.removeFromFavorite(storyId);

// Clear all favorites
storyManager.removeAllFavorites();
```

## Vertical Stories List

To display stories in a vertical layout, pass `vertical={true}`:

```tsx
<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed="default"
  vertical={true}
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
/>
```

## Custom Story Cell

To render custom cells, pass `renderCell` and/or `renderFavoriteCell` to `StoriesList`:

```tsx
<StoriesList
  storyManager={storyManager}
  appearanceManager={appearanceManager}
  feed="default"
  onLoadStart={onLoadStart}
  onLoadEnd={onLoadEnd}
  renderCell={(story, { isFirstItem, isLastItem }) => {
    return <Text>{story.storyID}</Text>;
  }}
  renderFavoriteCell={(stories) => {
    return <Text>Favorites ({stories.length})</Text>;
  }}
/>
```

## Single Story Opening & Onboardings

```ts
// Open a single story by ID (supports optional AbortSignal and AppearanceManager)
await storyManager.showStory(storyId, abortSignal, appearanceManager);

// Open a story once (will not open again if already marked as viewed)
await storyManager.showStoryOnce(storyId, abortSignal);

// Open onboarding stories
await storyManager.showOnboardings('onboarding', 1000, ['tag1'], abortSignal);
```

## Banners

To display native banner carousels, use the `BannerCarousel` component:

```tsx
import {
  BannerCarousel,
  type BannerViewRef,
} from '@inappstory/react-native-sdk';
import { useRef } from 'react';

const bannerRef = useRef<BannerViewRef>(null);

<BannerCarousel
  ref={bannerRef}
  placeId="main_banner"
  height={150}
  cornerRadius={16}
  shouldLoop={true}
  interItemSpacing={8}
  sideInset={16}
  onScroll={(index) => console.log('Banner scrolled to', index)}
  onPlaceLoaded={(size, widgetHeight) =>
    console.log(`Banner loaded: size=${size}, height=${widgetHeight}`)
  }
/>;
```

Preload banner data in advance:

```ts
await storyManager.preloadBannerPlace('main_banner', ['tag1']);
```

## In-App Messages (IAM)

```ts
// Preload In-App Messages
await storyManager.preloadIAM(['iam_id_1'], ['tag1']);

// Show IAM by ID
await storyManager.showIAMById('iam_id_1', false, abortSignal);

// Show IAM by event trigger
await storyManager.showIAMByEvent('user_purchased', false, abortSignal);

// Listen to IAM events (showInAppMessage, closeInAppMessage, inAppMessageWidgetEvent)
storyManager.onIamEvent((event) => {
  console.log('IAM event', event);
});
```

## Games

```ts
// Preload games
storyManager.preloadGames();

// Open a game by ID
await storyManager.showGame(gameID);

// Listen to game events (startGame, closeGame, eventGame, gameFailure)
storyManager.onGameEvent((event) => {
  console.log('Game event', event);
});
```

## Tags

```ts
// Replace tags
storyManager.setTags(['tag1']);

// Add tags to existing ones
storyManager.addTags(['tag2']);

// Remove specific tags
storyManager.removeTags(['tag1']);
```

A tag may contain only letters (any alphabet), digits, `_` and `-`, and the total
list size must not exceed 4096 bytes in UTF-8 (tag + separator; a Cyrillic
character counts as 2 bytes). If a rule is violated, the error is written to
`console.error` and the call never reaches the native SDK — the tags are not
applied, but the app does not crash.

## Placeholders

```ts
storyManager.setPlaceholders({ username: 'John Doe' });
```

## Image Placeholders

```ts
storyManager.setImagePlaceholders({
  image1: 'https://example.com/image.jpg',
});
```

## User Session & Cache

```ts
// Update user ID and optional HMAC signature
storyManager.setUserId('user-123', 'optional-signature');

// Log out (clears user session on the native SDK)
storyManager.logout();

// Clear story and game cache
storyManager.clearCache();
```

## Story Reader Appearance

```ts
appearanceManager.setOverScrollToClose(value);
appearanceManager.setSwipeToClose(value);
appearanceManager.setTimerGradientEnable(value);
appearanceManager.setScrollStyle(value); // 'cover' | 'flat' | 'cube' | 'depth'
appearanceManager.setPresentationStyle(value); // 'zoom' | 'modal' | 'fade'
appearanceManager.setReaderBackgroundColor(value);
appearanceManager.setReaderCornerRadius(value);
appearanceManager.setCoverQuality(CoverQuality.MEDIUM);

// the close button position is part of the reader options
appearanceManager.setStoryReaderOptions({
  closeButtonPosition: StoryReaderCloseButtonPosition.RIGHT,
});
```

## Likes, Share, Favorites

```ts
appearanceManager.setCommonOptions({
  hasLike: true,
  hasLikeButton: value,
  hasShare: value,
  hasFavorite: value,
});
```

## Sound

```ts
// To change sound settings
storyManager.changeSound(value);

// Get sound status
const soundEnabled = storyManager.soundEnabled;
```

## Goods & Product Cart

### Goods Widget

To use the goods widget, pass a function that returns products to `getGoods`:

```ts
storyManager.getGoods((skus) => {
  // TODO: return array of Goods
  return skus.map((sku) => ({
    sku: sku, // item sku
    title: 'title of ' + sku, // item title for cell
    subtitle: 'subtitle of ' + sku, // item subtitle for cell
    imageURL: '', // image url for cell
    price: Number(Math.random() * 1000).toFixed(2), // price value for cell
    oldPrice: Number(Math.random() * 1000).toFixed(2),
  }));
});
```

After a goods item is selected:

```ts
storyManager.onGoodItemSelected((event: any) => {
  // User selected event.body.sku SKU
});
```

### Product Cart Handlers

Configure interactive product cart handlers for stories:

```ts
import type {
  ProductCart,
  ProductCartOffer,
  ProductCartHandlers,
} from '@inappstory/react-native-sdk';

storyManager.setProductCartHandlers({
  onUpdate: async (offer: ProductCartOffer): Promise<ProductCart | null> => {
    // Update cart state
    return {
      offers: [offer],
      price: '99.99',
      priceCurrency: 'USD',
    };
  },
  getState: async (): Promise<ProductCart | null> => {
    // Return current cart state
    return {
      offers: [],
      price: '0.00',
      priceCurrency: 'USD',
    };
  },
});

storyManager.onProductCartClicked((event: any) => {
  console.log('Product cart icon clicked', event);
});
```

### AppVersion override

The app version is used by the platform to enable targeting of stories by app versions.
By default, IAS-SDK uses appVersion and appBundle from the native part of the application.
You can override appVersion and appBundle via `StoryManagerConfig` or `setAppVersion` (useful for CodePush users):

```ts
const storyManagerConfig: StoryManagerConfig = {
  apiKey,
  appVersion: {
    version: '3.0.0',
    build: 777,
  },
};
const storyManager = await StoryManager.create(storyManagerConfig);
```

### Events

There is no generic `on(eventName, ...)`. Each event stream has its own method
— `onShowStory`, `onCloseStory`, `onShowSlide`, `onClickOnButton`, `onLikeStory`,
`onDislikeStory`, `onFavoriteStory`, `onShareStory`, `onStoryWidgetEvent`,
`onStoryReaderWillShow`, `onStoryReaderDidClose`, `onGoodItemSelected`,
`onProductCartClicked`, `onBannerWidgetEvent`, `onGameEvent`, `onIamEvent`,
`onFailure`, `onLog`:

```js
storyManager.onShowStory((event) => {
  console.log('showStory', event);
});
```

### Replacing the manager

Subscriptions live on the instance. When the config changes (a new `apiKey`,
a user logging in or out) and you build a new manager, `destroy()` the old one
first — otherwise both stay subscribed and one CTA click is handled twice:

```ts
oldStoryManager.destroy();
const storyManager = await StoryManager.create(newConfig);
```

| Event Name        | Payload inside `event.body`                               |
|-------------------|-----------------------------------------------------------|
| showStory         | {id: Number, feed: String, action: String, slidesCount: Number} |
| closeStory        | {id: Number, feed: String, index: Number, action: String} |
| clickOnButton     | {id: Number, feed: String, index: Number, url: String}    |
| showSlide         | {id: Number, index: Number}                               |
| likeStory         | {id: Number, feed: String, index: Number, value: Boolean} |
| dislikeStory      | {id: Number, feed: String, index: Number, value: Boolean} |
| favoriteStory     | {id: Number, feed: String, index: Number, value: Boolean} |
| clickOnShareStory | {id: Number, feed: String, index: Number, payload: String} |
| storyWidgetEvent  | {id: Number, feed: String, name: String, data: Object}    |

## Reader Events

| Event               | Payload inside `event.body`            |
|---------------------|----------------------------------------|
| storyReaderWillShow | {feed: String, type: String}           |
| storyReaderDidClose | {feed: String, type: String}           |

## Failure Events (`onFailure`)

Subscribe via `storyManager.onFailure((event) => ...)`:

| Event Name          | Payload inside `event.body`           |
|---------------------|---------------------------------------|
| sessionFailure      | {message: String}                     |
| storyFailure        | {message: String}                     |
| currentStoryFailure | {message: String}                     |
| networkFailure      | {message: String}                     |
| requestFailure      | {message: String, statusCode: String} |

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

## Game Events (`onGameEvent`)

Subscribe via `storyManager.onGameEvent((event) => ...)`:

| Event Name          | Payload inside `event.body`                                 | Description |
|---------------------|-------------------------------------------------------------|-------------|
| startGame          | {id: Number, gameID: String, feed: String}                  | Game reader opened |
| closeGame          | {id: Number, gameID: String, feed: String}                  | Game reader closed |
| eventGame          | {id: Number, gameID: String, feed: String, name: String, payload: String} | Custom in-game event |
| gameFailure        | {id: Number, gameID: String, feed: String, message: String} | Game loading error |

## Goods Events

| Event Name          | Method / Payload                                           |
|---------------------|------------------------------------------------------------|
| goodItemSelected    | `storyManager.onGoodItemSelected((event) => ...)` (`{sku: String}`) |
| productCartClicked  | `storyManager.onProductCartClicked((event) => ...)`        |

### Custom Icons

1. Add images to your project assets

2. Configure the required icons on the AppearanceManager before showing stories:

```js
appearanceManager.setLikeImage(image, activeImage);
appearanceManager.setDislikeImage(image, activeImage);
appearanceManager.setFavoriteImage(image, activeImage);
appearanceManager.setShareImage(image, activeImage);
appearanceManager.setSoundImage(image, activeImage);
appearanceManager.setCloseReaderImage(image);
appearanceManager.setRefreshImage(image);
appearanceManager.setRefreshGoodsImage(image);
appearanceManager.setCloseGoodsImage(image);
```

`image` and `activeImage` parameters are the names of the images in your assets folder:

```js
appearanceManager.setLikeImage('like', 'likeSelected');
```

### Migrating from old version

Breaking changes:

1. `StoriesList` uses standard React `ref` with `StoriesListRef` (`ref.current?.reload()`) instead of `StoriesListViewModel` / `viewModelExporter`.
2. Font settings are defined using separate variables (`fontSize`, `fontWeight`, `fontFamily`) instead of a string.
3. If you used `svgMask` in appearance manager, use custom cells to achieve the same result.
4. `getGoodsCallback` is no longer a public field — use `storyManager.getGoods(fn)`.
5. `StoryManager` now has `destroy()`. Call it on the old instance whenever you build a replacement, or its listeners keep firing alongside the new one's.

## Running the Example App

To run the example app in the repository:

```sh
# Install dependencies from project root
yarn

# Start Metro bundler
yarn example start

# Run iOS example
yarn example ios

# Run Android example
yarn example android
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
