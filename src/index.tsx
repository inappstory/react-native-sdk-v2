import './wdyr';
import { NativeEventEmitter, NativeModules } from 'react-native';
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
import { useInAppStory } from './context/InAppStoryContext';
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
  useInAppStory,
};
//import AsyncStorage from '@react-native-async-storage/async-storage';
const eventEmitter = new NativeEventEmitter(
  NativeModules.RNInAppStorySDKModule
);
const EVENTS_MAP = {
  shareStory: 'clickOnShareStory',
};
const getEventName = (eventName) => {
  return EVENTS_MAP[eventName] || eventName;
};
export class StoryManager extends StoryManagerV1 {
  apiKey: string = '';
  userId: string | number = '';
  tags: string[] = [];
  placeholders: any = '';
  imagePlaceholders: any = '';
  lang: string = '';
  soundEnabled: boolean = true;
  getGoodsCallback: Function = () => {};
  sandbox: boolean = true;
  sendStatistics: boolean = true;
  listeners: any = [];
  constructor(config: StoryManagerConfig) {
    super(config);
    InAppStorySDK.initWith(
      config.apiKey,
      config.userId,
      this.sandbox,
      this.sendStatistics
    );
    InAppStorySDK.setUserID(config.userId);
    this.apiKey = config.apiKey;
    this.userId = String(config.userId);
    if (config.tags) {
      this.tags = config.tags;
      InAppStorySDK.setTags(config.tags);
    }
    if (config.placeholders) {
      this.placeholders = config.placeholders;
      InAppStorySDK.setPlaceholders(config.placeholders);
    }
    if (config.lang) {
      this.lang = config.lang;
      InAppStorySDK.setLang(config.lang);
    }
    if (config.defaultMuted) {
      this.soundEnabled = false;
      InAppStorySDK.changeSound(false);
    }
    eventEmitter.addListener('getGoodsObject', (event) => {
      this.fetchGoods(event.skus);
    });
  }
  async fetchGoods(skus: string[]) {
    this.getGoodsCallback(skus).then((goods) => {
      goods.map((good) => {
        InAppStorySDK.addProductToCache(
          good.sku,
          good.title,
          good.subtitle,
          good.imageURL,
          good.price,
          good.oldPrice
        );
      });
    });
  }
  getGoods(callback: any) {
    this.getGoodsCallback = (skus) => {
      return new Promise((resolve, _reject) => {
        resolve(callback(skus));
      });
    };
  }
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    InAppStorySDK.initWith(
      this.apiKey,
      this.userId,
      this.sandbox,
      this.sendStatistics
    );
  }
  setSandbox(sandbox: boolean): void {
    this.sandbox = sandbox;
    InAppStorySDK.initWith(
      this.apiKey,
      this.userId,
      this.sandbox,
      this.sendStatistics
    );
  }
  setSendStatistics(sendStatistics: boolean): void {
    this.sendStatistics = sendStatistics;
    InAppStorySDK.initWith(
      this.apiKey,
      this.userId,
      this.sandbox,
      this.sendStatistics
    );
  }
  async fetchFeed(feed: string) {
    InAppStorySDK.getStories(feed);
    //if (include_favorites) {
    InAppStorySDK.getFavoriteStories(feed);
    //}
  }
  async fetchFavorites(feed) {
    InAppStorySDK.getFavoriteStories(feed);
  }

  on(eventName: string | symbol, listener: any) {
    //super.on(eventName, listener);
    eventEmitter.addListener(getEventName(eventName), async (event) => {
      listener(event);
    });
    return this;
  }
  once(eventName: string | symbol, listener: any) {
    //super.on(eventName, listener);
    eventEmitter.addListener(getEventName(eventName), async (event) => {
      listener(event);
    });
    return this;
  }

  setTags(tags: string[]) {
    super.setTags(tags);
    this.tags = tags;
    InAppStorySDK.setTags(tags);
  }
  removeTags(tags: string[]) {
    //super.removeTags(tags);
    //this.tags =
    InAppStorySDK.removeTags(tags);
  }
  setUserId(userId: string | number): void {
    super.setUserId(userId);
    this.userId = userId;
    InAppStorySDK.setUserID(userId);
  }
  setLang(lang: string): void {
    super.setLang(lang);
    this.lang = lang;
    InAppStorySDK.setLang(lang);
  }
  setPlaceholders(placeholders: any): void {
    super.setPlaceholders(placeholders);
    this.placeholders = placeholders;
    InAppStorySDK.setPlaceholders(placeholders);
  }
  setImagePlaceholders(placeholders: any): void {
    //super.setImagePlaceholders(placeholders);
    this.imagePlaceholders = placeholders;
    InAppStorySDK.setImagesPlaceholders(placeholders);
  }
  showStory(
    storyId: string | number,
    appearanceManager: AppearanceManagerV1
  ): Promise<{ loaded: boolean }> {
    return new Promise((resolve, reject) => {
      if (appearanceManager.commonOptions.hasLike) {
        InAppStorySDK.setHasLike(appearanceManager.commonOptions.hasLikeButton);
        /*InAppStorySDK.setHasDislike(
          appearanceManager.commonOptions.hasDislikeButton
        );*/

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
  showGame(id: string) {
    return InAppStorySDK.showGame(id);
  }
  showOnboardingStories(
    _appearanceManager: AppearanceManagerV1,
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
        options?.limit || 10,
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
    //InAppStorySDK.setHasDislike(options.hasDislikeButton);
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
    /*InAppStorySDK.setCloseButtonPosition(
      options.closeButtonPosition || 'right'
    );
    InAppStorySDK.setScrollStyle(options.scrollStyle || 'cover');*/
    return super.setStoryReaderOptions(options);
  }
  setStoriesListOptions(
    options: Partial<{
      title: Partial<{
        content: string;
        color: string;
        font: string;
        fontSize: number;
        marginBottom: number;
      }>;
      card: Partial<{
        title: Partial<{
          color: string;
          padding: string | number;
          font: string;
          display: boolean;
          fontSize: number;
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

export default NativeModules.RNInAppStorySDKModule;
