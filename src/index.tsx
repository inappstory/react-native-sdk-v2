import { Platform } from 'react-native';
import * as React from 'react';
import { Button, NativeModules, StyleSheet, Text, View } from 'react-native';
import {
  AppearanceManager as AppearanceManagerV1,
  type ListLoadStatus,
  type StoriesListViewModel,
  type StoryManagerConfig,
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
import { StoriesList } from './stories/StoriesList';
export {
  type ListLoadStatus,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  type StoriesListViewModel,
  type StoryManagerConfig,
  StoryReader,
  StoriesList,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  useIas,
};

const createSession = async (apiKey: string, userId: any) => {
  const openSession = await fetch(
    'https://api.inappstory.ru/v2/session/open?expand=cache&fields=session%2Cserver_timestamp%2Cplaceholders%2Cimage_placeholders%2Cis_allow_profiling%2Cis_allow_statistic_v1%2Cis_allow_statistic_v2%2Cis_allow_ugc%2Ccache%2Cpreview_aspect_ratio&format=json',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        platform: Platform.OS,
        features:
          'animation,data,deeplink,webp,placeholder,resetTimers,gameReader,swipeUpItems,sendApi,imgPlaceholder',
        user_id: userId,
      }),
    }
  );
  const sessionData = await openSession.json();
  console.error('session = ', sessionData);
  return sessionData.session.id;
};

const fetchFeed = async (
  apiKey: string,
  sessionId: string,
  userId: any,
  feed: string,
  tags: string[]
) => {
  const getFeed = await fetch(
    `https://api.inappstory.ru/v2/feed/${feed}?format=json${tags ? '&' + tags.map((t) => `tags=${t}`).join('&') : ''}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Auth-Session-id': `${sessionId}}`,
        'X-User-id': `${userId}}`,
      },
    }
  );
  const feedData = await getFeed.json();
  return feedData;
};

export class StoryManager extends StoryManagerV1 {
  sessionId: string = '';
  apiKey: string = '';
  userId: any = '';
  tags: string[] = [];
  placeholders: any = '';
  imagePlaceholders: any = '';
  lang: string = '';
  soundEnabled: boolean = true;
  constructor(config: StoryManagerConfig) {
    super(config);
    InAppStorySDK.initWith(config.apiKey, config.userId);
    this.apiKey = config.apiKey;
    this.userId = config.userId;
    createSession(config.apiKey, config.userId).then((sessionId) => {
      this.sessionId = sessionId;
    });
    if (config.tags) {
      this.tags = config.tags;
      InAppStorySDK.setTags(config.tags);
    }
    if (config.placeholders) {
      this.placeholders = config.placeholders;
      //InAppStorySDK.setPlaceholders(JSON.stringify(config.placeholders));
    }
    if (config.lang) {
      this.lang = config.lang;
      //FIXME
      //InAppStorySDK.setLang(config.lang);
    }
    if (config.defaultMuted) {
      this.soundEnabled = false;
      InAppStorySDK.changeSound(false);
    }
  }
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    InAppStorySDK.initWith(this.apiKey, this.userId);
    /*this.sessionId = '';
    createSession(this.apiKey, this.userId).then((sessionId) => {
      this.sessionId = sessionId;
    });*/
  }
  async fetchFeed(feed: string) {
    if (this.sessionId) {
      return await fetchFeed(
        this.apiKey,
        this.sessionId,
        this.userId,
        feed,
        this.tags
      );
    } else {
      this.sessionId = await createSession(this.apiKey, this.userId);
      return await fetchFeed(
        this.apiKey,
        this.sessionId,
        this.userId,
        feed,
        this.tags
      );
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

  setTags(tags: string[]) {
    super.setTags(tags);
    this.tags = tags;
    InAppStorySDK.setTags(tags);
  }
  setUserId(userId: string | number): void {
    super.setUserId(userId);
    this.userId = userId;
    InAppStorySDK.setUserID(userId);
  }
  setLang(lang: string): void {
    super.setLang(lang);
    this.lang = lang;
    //InAppStorySDK.setLang(lang);
  }
  setPlaceholders(placeholders: any): void {
    super.setPlaceholders(placeholders);
    this.placeholders = placeholders;
    InAppStorySDK.setPlaceholders(placeholders);
  }
  showStory(
    storyId: string | number,
    appearanceManager: AppearanceManagerV1
  ): Promise<{ loaded: boolean }> {
    return new Promise((resolve, reject) => {
      if (appearanceManager.commonOptions.hasLike) {
        InAppStorySDK.setHasLike(appearanceManager.commonOptions.hasLikeButton);
        InAppStorySDK.setHasDislike(
          appearanceManager.commonOptions.hasDislikeButton
        );

        InAppStorySDK.setHasFavorites(
          appearanceManager.commonOptions.hasFavorite
        );
        InAppStorySDK.setHasShare(appearanceManager.commonOptions.hasShare);
      }
      //InAppStorySDK.setAppearance(appearanceManager);
      InAppStorySDK.showSingle(storyId).then((success: boolean) => {
        if (success) {
          resolve({ loaded: true });
        } else {
          reject({ loaded: false });
        }
      });
    });
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
    return new Promise((resolve, reject) => {
      InAppStorySDK.showOnboardingStories(
        options?.limit,
        options?.feed,
        options?.customTags
      ).then((success) => {
        if (success) {
          resolve(success);
        } else {
          reject(null);
        }
      });
    });
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
  hasLike = true;
  hasDislike = true;
  hasFavorites = true;
  hasShare = true;
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
    InAppStorySDK.setHasLike(options.hasLike);
    InAppStorySDK.setHasDislike(options.hasDislikeButton);
    InAppStorySDK.setHasFavorites(options.hasFavorite);
    InAppStorySDK.setHasShare(options.hasShare);
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
    InAppStorySDK.setCloseButtonPosition(
      options.closeButtonPosition || 'right'
    );
    InAppStorySDK.setScrollStyle(options.scrollStyle || 'cover');
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
    height: 500,
  },
});

export default NativeModules.RNInAppStorySDKModule;
