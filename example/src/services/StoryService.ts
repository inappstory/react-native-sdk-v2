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
  userId: null,
  tags: [],
  placeholders: {
    user: 'Guest',
  },
  lang: 'en',
  defaultMuted: true,
};

const createStoryManager = () => {
  const storyManager = new StoryManager(storyManagerConfig);

  storyManager.on('clickOnStory', (payload) =>
    console.log('clickOnStory', { payload })
  );
  storyManager.on('clickOnFavoriteCell', (payload) =>
    console.log('clickOnFavoriteCell', { payload })
  );
  storyManager.on('showStory', (payload) =>
    console.log('showStory', { payload })
  );
  storyManager.on('closeStory', (payload) =>
    console.log('closeStory', { payload })
  );
  storyManager.on('showSlide', (payload) =>
    console.log('showSlide', { payload })
  );
  storyManager.on('clickOnButton', (payload) =>
    console.log('clickOnButton', { payload })
  );
  storyManager.on('likeStory', (payload) =>
    console.log('likeStory', { payload })
  );
  storyManager.on('dislikeStory', (payload) =>
    console.log('dislikeStory', { payload })
  );
  storyManager.on('favoriteStory', (payload) =>
    console.log('favoriteStory', { payload })
  );
  storyManager.on('shareStory', (payload) =>
    console.log('shareStory', { payload })
  );
  storyManager.on('shareStoryWithPath', (payload) =>
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
          color: 'black',
          font: 'bold normal 14px/16px "InternalPrimaryFont"',
          padding: '30px 0 0 0',
          lineClamp: 3,
          textAlign: StoriesListCardTitleTextAlign.CENTER,
          position: StoriesListCardTitlePosition.CARD_OUTSIDE_BOTTOM,
        },
        gap: 10,
        height: 100,
        variant: StoriesListCardViewVariant.CIRCLE,
        border: {
          radius: 0,
          color: 'purple',
          width: 2,
          gap: 3,
        },
        boxShadow: null,
        opacity: 1,
        mask: {
          color: 'rgba(34, 34, 34, 0.3)',
        },
        svgMask: {
          cardMask: null,
          overlayMask: [
            {
              mask: `<svg width="100%" height="auto" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="57" cy="6" r="6" fill="#D9D9D9"/>
</svg>`,
              background: '#F31A37',
            },
          ],
        },
        opened: {
          border: {
            radius: 0,
            color: 'transparent',
            width: 2,
            gap: 3,
          },
          boxShadow: null,
          opacity: null,
          mask: {
            color: 'rgba(34, 34, 34, 0.1)',
          },
          svgMask: {
            cardMask: null,
            overlayMask: [
              {
                mask: `<svg width="100%" height="auto" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="57" cy="6" r="6" fill="#D9D9D9"/>
</svg>`,
                background: '#F31A37',
              },
            ],
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
      sidePadding: 20,
      topPadding: 20,
      bottomPadding: 0,
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
      // loader: {
      //   default: {
      //     color: "transparent",
      //     accentColor: "white"
      //   }
      // }
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
