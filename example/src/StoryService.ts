import {
  AppearanceManager,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  StoryManager,
  type StoryManagerConfig,
} from '@inappstory/react-native-sdk';

let storyManagerConfig: StoryManagerConfig = {
  apiKey: 'test-key',
  userId: '',
  tags: [],
  placeholders: {
    username: 'Guest',
  },
  lang: 'en-US',
  defaultMuted: true,
};

//configure StoryManager
export const createStoryManager = () => {
  const storyManager = new StoryManager(storyManagerConfig);
  // storyManager.getGoodsCallback((skus: string[]) => {
  //     //TODO: Fetch goods information
  //     return skus.map((sku) => ({
  //         sku: sku, //item sku
  //         title: 'title of ' + sku, //item title for cell
  //         subtitle: 'subtitle of ' + sku, //item subtitle for cell
  //         imageURL: 'URL', //image url for cell
  //         price: Number(Math.random() * 1000).toFixed(2), //price value for cell
  //         oldPrice: Number(Math.random() * 1000).toFixed(2),
  //     }));
  // });

  //subscribe to events
  // storyManager.on('clickOnStory', (payload: any) =>
  //     console.log('clickOnStory', { payload })
  // );
  // storyManager.on('showStory', (payload: any) =>
  //     console.log('showStory', { payload })
  // );
  // storyManager.on('closeStory', (payload: any) =>
  //     console.log('closeStory', { payload })
  // );
  // storyManager.on('showSlide', (payload: any) =>
  //     console.log('showSlide', { payload })
  // );
  // // storyManager.on('clickOnButton', (payload: any) =>
  // //     console.log('clickOnButton', { payload })
  // // );
  // storyManager.on('likeStory', (payload: any) =>
  //     console.log('likeStory', { payload })
  // );
  // storyManager.on('dislikeStory', (payload: any) =>
  //     console.log('dislikeStory', { payload })
  // );
  // storyManager.on('favoriteStory', (payload: any) =>
  //     console.log('favoriteStory', { payload })
  // );
  // storyManager.on('shareStory', (payload: any) =>
  //     console.log('shareStory', { payload })
  // );
  // storyManager.on('shareStoryWithPath', (payload: any) =>
  //     console.log('shareStoryWithPath', { payload })
  // );

  // btn handler
  // storyManager.storyLinkClickHandler = (payload: any) => {
  //     console.log({ payload });
  //     if (payload.data.url != null) {
  //         Linking.openURL(payload.data.url);
  //     }
  // };

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
