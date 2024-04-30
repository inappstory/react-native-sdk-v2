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
} from 'react-native-ias';
import InAppStorySDK from 'react-native-inappstory-sdk';
import type { OnboardingLoadStatus } from 'react-native-ias/types/StoryManager';
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
  //.on('clickOnStory', (payload) =>
  //console.log('clickOnStory', { payload })
  //);
  /*storyManager.on('clickOnFavoriteCell', (payload) =>
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
    );*/
}
export class AppearanceManager extends AppearanceManagerV1 {
  //TODO: Migrate the APIs from JS to Native
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
