import {
  AppearanceManager,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  StoryManager,
  type StoryManagerConfig,
  type LogEntry,
} from '@inappstory/react-native-sdk';
import { Linking } from 'react-native';
import { TEST_TAGS } from './TestTags';

let storyManagerConfig: StoryManagerConfig = {
  apiKey: '',
  userId: '',
  tags: TEST_TAGS,
  placeholders: {
    username: 'Guest',
  },
  lang: 'en-US',
  defaultMuted: true,
  sendStatistics: true,
};

//configure StoryManager
export const createStoryManager = () => {
  const storyManager = new StoryManager(storyManagerConfig);

  // forward native SDK logs to the JS console
  storyManager.setLoggingEnabled(true);
  storyManager.onLog((entry: LogEntry) => {
    console.log(`[IAS ${entry.level}] ${entry.message ?? ''}`);
  });

  // failure events: session/story/network/request errors
  storyManager.onFailure((event: { withName: string; body: any }) => {
    console.warn(`[IAS failure] ${event.withName}`, event.body);
  });

  // btn handler
  storyManager.storyLinkClickHandler = (payload: any) => {
    console.log({ payload });
    if (payload.data.url != null) {
      Linking.openURL(payload.data.url);
    }
  };

  return storyManager;
};

// configure appearance
export const createAppearanceManager = () => {
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
          padding: '10px 10 10 10',
          fontSize: 14,
          fontWeight: 600,
          //fontFamily: Platform.OS == 'ios' ? 'Bradley Hand' : 'Comic Sans',
          lineHeight: 14,
          lineClamp: 4,
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
    });
  // return new AppearanceManager()
  //     .setCommonOptions({
  //         hasLike: true,
  //         hasLikeButton: true,
  //         hasDislikeButton: false,
  //         hasFavorite: true,
  //         hasShare: true,
  //     })
  //     .setStoriesListOptions({
  //         card: {
  //             title: {
  //                 font: 'bold normal 14px/16px "InternalPrimaryFont"',
  //                 padding: '10px 10 10 10',
  //                 fontSize: 14,
  //                 fontWeight: 600,
  //                 //fontFamily: Platform.OS == 'ios' ? 'Bradley Hand' : 'Comic Sans',
  //                 lineHeight: 14,
  //                 lineClamp: 4,
  //                 textAlign: StoriesListCardTitleTextAlign.LEFT,
  //                 position: StoriesListCardTitlePosition.CARD_INSIDE_BOTTOM,
  //             },
  //             gap: 12,
  //             height: 150,
  //             variant: StoriesListCardViewVariant.RECTANGLE,
  //             border: {
  //                 radius: 8,
  //                 color: '#2c60eaff',
  //                 width: 2,
  //                 gap: 4,
  //             },
  //             boxShadow: null,
  //             opacity: 1,
  //             mask: {
  //                 color: 'rgba(34, 34, 34, 0.3)',
  //             },
  //             opened: {
  //                 border: {
  //                     radius: 0,
  //                     color: 'red',
  //                     width: 0,
  //                     gap: 0,
  //                 },
  //                 boxShadow: null,
  //                 opacity: 1,
  //                 mask: {
  //                     color: 'rgba(34, 34, 34, 0.1)',
  //                 },
  //             },
  //         },
  //         favoriteCard: {
  //             title: {
  //                 content: 'Saved',
  //             },
  //         },
  //         layout: {
  //             height: 0,
  //             backgroundColor: 'transparent',
  //         },
  //         sidePadding: 12,
  //         topPadding: 12,
  //         bottomPadding: 12,
  //         navigation: {
  //             showControls: false,
  //             controlsSize: 48,
  //             controlsBackgroundColor: 'white',
  //             controlsColor: 'black',
  //         },
  //     })
  // .setStoryReaderOptions({
  //     closeButtonPosition: StoryReaderCloseButtonPosition.RIGHT,
  //     scrollStyle: StoryReaderSwipeStyle.FLAT,
  //     slideBorderRadius: 5,
  // })
  // .setStoryFavoriteReaderOptions({
  //     title: {
  //         content: 'Favorite',
  //         font: '1.6rem/1.4 InternalPrimaryFont',
  //         color: 'white',
  //     },
  // });
};

export const storyManager = createStoryManager();

export function createStoryManagerWithConfig(config: StoryManagerConfig) {
  storyManagerConfig = config;
  return createStoryManager();
}

export const appearanceManager = createAppearanceManager();
