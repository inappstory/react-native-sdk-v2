import {
  requireNativeComponent,
  UIManager,
  Platform,
  type ViewStyle,
} from 'react-native';
import * as React from 'react';
import { Button, NativeModules, StyleSheet, Text, View } from 'react-native';
import {
  AppearanceManager as AppearanceManagerV1,
  type ListLoadStatus,
  type StoriesListViewModel,
  type StoryManagerConfig,
  StoriesList,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  StoryManager as StoryManagerV1,
  StoryReader,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  useIas,
  type Option,
  StoriesListSliderAlign,
} from 'react-native-ias';
import InAppStorySDK from 'react-native-inappstory-sdk';
import type { OnboardingLoadStatus } from 'react-native-ias/types/StoryManager';
import type {
  StoriesListFavoriteCardOptions,
  StoriesListClickEvent,
} from 'react-native-ias/types/AppearanceManager';
const LINKING_ERROR =
  `The package 'react-native-inappstory-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type InappstorySdkProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'InappstorySdkView';

export const InappstorySdkView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<InappstorySdkProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export {
  type ListLoadStatus,
  StoriesList,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  type StoriesListViewModel,
  type StoryManagerConfig,
  StoryReader,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  useIas,
};
export class StoryManager extends StoryManagerV1 {
  constructor(config: StoryManagerConfig) {
    super(config);
    InAppStorySDK.initWith(config.apiKey, config.userId);
    if (config.tags) {
      InAppStorySDK.setTags(config.tags);
    }
    if (config.placeholders) {
      InAppStorySDK.setPlaceholders(config.placeholders);
    }
    if (config.lang) {
      //InAppStorySDK.setLang(config.lang);
    }
    if (config.defaultMuted) {
      InAppStorySDK.changeSound(false);
    }
  }

  on(eventName: string | symbol, listener: any) {
    super.on(eventName, listener);
    //TODO: implement events
    return this;
  }
  once(eventName: string | symbol, listener: any) {
    super.on(eventName, listener);
    //TODO: implement events
    return this;
  }

  setTags(tags: [string]) {
    super.setTags(tags);
    InAppStorySDK.setTags(tags);
  }
  setUserId(userId: string | number): void {
    super.setUserId(userId);
    InAppStorySDK.setUserID(userId);
  }
  setLang(lang: string): void {
    super.setLang(lang);
    //InAppStorySDK.setLang(lang);
  }
  setPlaceholders(placeholders: any): void {
    super.setPlaceholders(placeholders);
    InAppStorySDK.setPlaceholders(placeholders);
  }
  showStory(
    storyId: string | number,
    appearanceManager: AppearanceManagerV1
  ): Promise<{ loaded: boolean }> {
    return super.showStory(storyId, appearanceManager);
    /*return new Promise((resolve) => {
      //if (appearanceManager.commonOptions.hasLike) {
      InAppStorySDK.setHasLike(appearanceManager.commonOptions.hasLikeButton);
      InAppStorySDK.setHasDislike(
        appearanceManager.commonOptions.hasDislikeButton
      );

      InAppStorySDK.setHasFavorites(
        appearanceManager.commonOptions.hasFavorite
      );
      InAppStorySDK.setHasShare(appearanceManager.commonOptions.hasShare);
      //}
      //InAppStorySDK.setAppearance(appearanceManager);
      //InAppStorySDK.showSingle(storyId);
      //FIXME: receive load status
      resolve({ loaded: true });
    });*/
  }
  showOnboardingStories(
    appearanceManager: AppearanceManagerV1,
    options?:
      | {
          feed?: Option<string>;
          customTags?: string[] | undefined;
          limit?: Option<number>;
        }
      | undefined
  ): Promise<OnboardingLoadStatus> {
    return super.showOnboardingStories(appearanceManager, options);
  }
  //TODO: Implement these events:
  //clickOnStory
  //clickOnFavoriteCell
  //showStory
  //closeStory
  //showSlide
  //clickOnButton
  //likeStory
  //dislikeStory
  //favoriteStory
  //shareStory
  //shareStoryWithPath
  //);
}
export class AppearanceManager extends AppearanceManagerV1 {
  //TODO: Migrate the APIs from JS to Native
  setCommonOptions(
    options: Partial<{
      hasFavorite: boolean;
      hasLike: boolean;
      hasLikeButton: boolean;
      hasDislikeButton: boolean;
      hasShare: boolean;
    }>
  ) {
    return super.setCommonOptions(options);
  }
  setStoryFavoriteReaderOptions(
    options: Partial<{
      title: Partial<{ content: string; font: string; color: string }>;
    }>
  ) {
    return super.setStoryFavoriteReaderOptions(options);
  }
  setStoryReaderOptions(
    options: Partial<{
      closeButtonPosition: StoryReaderCloseButtonPosition;
      scrollStyle: StoryReaderSwipeStyle;
      loader: Partial<{
        default: Partial<{
          color: Option<string>;
          accentColor: Option<string>;
        }>;
        custom: Option<string>;
      }>;
      slideBorderRadius: number;
      recycleStoriesList: boolean;
      closeOnLastSlideByTimer: boolean;
      closeButton: { svgSrc: { baseState: string } };
      //dislikeStory
      //favoriteStory
      //shareStory
      //shareStoryWithPath
      //);
      likeButton: {
        //favoriteStory
        //shareStory
        //shareStoryWithPath
        //);
        svgSrc: {
          //shareStory
          //shareStoryWithPath
          //);
          baseState: string;
          activeState: string;
        };
      };
      dislikeButton: { svgSrc: { baseState: string; activeState: string } };
      favoriteButton: { svgSrc: { baseState: string; activeState: string } };
      muteButton: { svgSrc: { baseState: string; activeState: string } };
      shareButton: { svgSrc: { baseState: string } };
    }>
  ) {
    return super.setStoryReaderOptions(options);
  }
  setStoriesListOptions(
    options: Partial<{
      title: Partial<{
        content: string;
        color: string;
        font: string;
        marginBottom: number;
      }>;
      card: Partial<{
        title: Partial<{
          color: string;
          padding: string | number;
          font: string;
          display: boolean;
          textAlign: StoriesListCardTitleTextAlign;
          position: StoriesListCardTitlePosition;
          lineClamp: number;
        }>;
        gap: number;
        height: number;
        variant: StoriesListCardViewVariant;
        border: Partial<{
          radius: number;
          color: string;
          width: number;
          gap: number;
        }>;
        boxShadow: Option<string>;
        dropShadow: Option<string>;
        opacity: Option<number>;
        mask: Partial<{ color: Option<string> }>;
        svgMask: Partial<
          Option<{
            cardMask: Option<string>;
            overlayMask: { mask: Option<string>; background: Option<string> }[];
          }>
        >;
        opened: Partial<{
          border: Partial<{
            radius: Option<number>;
            color: Option<string>;
            width: Option<number>;
            gap: Option<number>;
          }>;
          boxShadow: Option<string>;
          dropShadow: Option<string>;
          opacity: Option<number>;
          mask: Partial<{ color: Option<string> }>;
          svgMask: Partial<
            Option<{
              cardMask: Option<string>;
              overlayMask: {
                mask: Option<string>;
                background: Option<string>;
              }[];
            }>
          >;
        }>;
      }>;
      favoriteCard: StoriesListFavoriteCardOptions;
      layout: Partial<{
        storiesListInnerHeight: number | null;
        height: number;
        backgroundColor: string;
        sliderAlign: StoriesListSliderAlign;
      }>;
      sidePadding: number;
      topPadding: number;
      bottomPadding: number;
      bottomMargin: number;
      navigation: Partial<{
        showControls: boolean;
        controlsSize: number;
        controlsBackgroundColor: string;
        controlsColor: string;
      }>;
      extraCss: string;
      handleStoryLinkClick: (payload: StoriesListClickEvent) => void;
      handleStartLoad: (loaderContainer: HTMLElement) => void;
      handleStopLoad: (loaderContainer: HTMLElement) => void;
    }>
  ) {
    return super.setStoriesListOptions(options);
  }
}

export const addOne = (input: number) => input + 1;

export const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text>You pressed {count} times</Text>
      <Button onPress={() => setCount(addOne(count))} title="Press Me" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
});

export default NativeModules.RNInAppStorySDKModule;
