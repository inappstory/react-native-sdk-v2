import { NativeEventEmitter, Platform } from 'react-native';
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
import { storyManager } from '../example/src/services/StoryService';
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
//import AsyncStorage from '@react-native-async-storage/async-storage';

export const useEvents = () => {
  const [events, setEvents] = React.useState<any>([]);
  React.useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.RNInAppStorySDKModule
    );
    let eventListeners = [];
    //console.error(NativeModules.RNInAppStorySDKModule)
    const gameEvents = [
      'startGame',
      'finishGame',
      'closeGame',
      'eventGame',
      'gameFailure',
      'getGoodsObject',
    ];
    gameEvents.forEach((eventName) => {
      eventListeners.push(
        eventEmitter.addListener(eventName, (event) => {
          if (eventName == 'getGoodsObject') {
            storyManager.fetchGoods(event);
          }
          console.error('new event', eventName, event);
          setEvents((_events) => {
            _events.push({
              event: eventName,
              data: event,
            });
            return _events;
          });
        })
      );
    });
    // Removes the listener once unmounted
    return () => {
      eventListeners.forEach((eventListener) => {
        eventListener.remove();
      });
    };
  }, []);
  return events;
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
        'X-App-Package-Id': 'com.inappstory.ios',
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
        'X-App-Package-Id': 'com.inappstory.ios',
      },
    }
  );
  const feedData = await getFeed.json();
  return feedData;
};

export class StoryManager extends StoryManagerV1 {
  sessionId: string = '';
  apiKey: string = '';
  userId: string | number = '';
  tags: string[] = [];
  placeholders: any = '';
  imagePlaceholders: any = '';
  lang: string = '';
  soundEnabled: boolean = true;
  getGoodsCallback: Function = () => {};
  constructor(config: StoryManagerConfig) {
    super(config);
    InAppStorySDK.initWith(config.apiKey, config.userId);
    /*InAppStorySDK.setLikeImage(`<?xml version="1.0" encoding="utf-8"?>

    <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
    <svg width="800px" height="800px" viewBox="0 -97.01 334.289 334.289" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    
    <path d="M12.266 137.77c-5.385 0-9.766-4.382-9.766-9.768V12.265C2.5 6.88 6.881 2.5 12.266 2.5h309.755c5.386 0 9.768 4.381 9.768 9.765v115.737c0 5.386-4.382 9.768-9.768 9.768H12.266z" fill="#ebecf6"/>
    
    <path d="M322.021 5a7.267 7.267 0 0 1 7.268 7.265v115.737a7.268 7.268 0 0 1-7.268 7.268H12.266A7.267 7.267 0 0 1 5 128.002V12.265A7.265 7.265 0 0 1 12.266 5h309.755m0-5H12.266C5.502 0 0 5.502 0 12.265v115.737c0 6.765 5.502 12.268 12.266 12.268h309.755c6.765 0 12.268-5.503 12.268-12.268V12.265C334.289 5.502 328.786 0 322.021 0z" fill="#c3c9d9"/>
    
    <path d="M322.021 6.942a5.33 5.33 0 0 1 5.325 5.323v115.737a5.33 5.33 0 0 1-5.325 5.325H12.266a5.33 5.33 0 0 1-5.324-5.325V12.265a5.329 5.329 0 0 1 5.324-5.322h309.755m0-1.943H12.266A7.265 7.265 0 0 0 5 12.265v115.737a7.267 7.267 0 0 0 7.266 7.268h309.755a7.268 7.268 0 0 0 7.268-7.268V12.265A7.267 7.267 0 0 0 322.021 5z" fill="#ffffff"/>
    
    <defs>
    
    <path id="a" d="M35.346 26.364h93.574v82.758H35.346z"/>
    
    </defs>
    
    <clipPath id="b">
    
    <use xlink:href="#a" overflow="visible"/>
    
    </clipPath>
    
    <g clip-path="url(#b)">
    
    <defs>
    
    <path id="c" d="M35.346 26.364h93.574v82.758H35.346z"/>
    
    </defs>
    
    <clipPath id="d">
    
    <use xlink:href="#c" overflow="visible"/>
    
    </clipPath>
    
    <g clip-path="url(#d)">
    
    <defs>
    
    <path id="e" d="M35.346 26.363h93.574v82.759H35.346z"/>
    
    </defs>
    
    <clipPath id="f">
    
    <use xlink:href="#e" overflow="visible"/>
    
    </clipPath>
    
    <path d="M126.233 71.672c4.741-4.72 3.276-14.267-4.934-14.267l-21.601.016c.817-4.578 2.006-12.159 1.958-12.876-.451-6.78-4.78-15.033-4.963-15.372-.786-1.467-4.768-3.459-8.774-2.603-5.184 1.109-5.712 4.41-5.69 5.321 0 0 .227 9.038.249 11.446-2.474 5.439-11.012 19.73-13.604 20.832a3.94 3.94 0 0 0-2.05-.575H39.527a4.181 4.181 0 0 0-4.181 4.181l.003 37.717a3.962 3.962 0 0 0 3.93 3.629h24.505a3.945 3.945 0 0 0 3.942-3.939v-1.252s.911-.062 1.323.198c1.576 1.001 3.525 2.261 6.065 2.261H111.7c13.668 0 12.203-12.137 10.957-13.797 2.309-2.518 3.738-6.951 1.788-10.459 1.509-1.585 4.148-5.946 1.788-10.461" clip-path="url(#f)" fill="#36383d"/>
    
    <path d="M120.681 61.362H94.889c.996-3.952 2.833-16.548 2.833-16.548-.417-6.115-4.506-13.788-4.506-13.788-4.86-2.046-7.045.76-7.045.76s.253 9.718.253 11.962c0 2.245-11.108 20.197-13.821 22.509-1.438 1.226-4.02 2.911-6.122 4.219v28.972l1.685.002c1.939 0 4.321 2.996 6.951 2.996l37.207-.017c7.479 0 8.669-8.423 3.734-9.231l.222-.93c4.731-.51 7.609-7.992 1.568-9.526l.222-.933c4.517-.477 7.87-7.738 1.567-9.527l.223-.932c5.93-.935 7.139-9.987.821-9.988" clip-path="url(#f)" fill="#ffffff"/>
    
    <path d="M119.634 72.282l.223-.932c5.932-.936 7.142-9.987.824-9.989h-12.459c6.318.002 5.109 9.053-.824 9.989l-.095.554c6.303 1.791 2.821 9.431-1.695 9.905l-.096.556c6.041 1.534 3.036 9.395-1.696 9.904l-.094.552c4.936.808 3.618 9.61-3.86 9.61l-24.822.01c.025 0 .05.006.075.006l37.207-.016c7.478 0 8.669-8.423 3.734-9.232l.222-.93c4.731-.51 7.609-7.991 1.568-9.526l.223-.934c4.514-.474 7.868-7.737 1.565-9.527" clip-path="url(#f)" fill="#eceef7"/>
    
    <path clip-path="url(#f)" fill="#7082ac" d="M39.28 67.536h24.562v37.644H39.28z"/>
    
    <path d="M39.28 105.18h24.562V67.536H39.28v37.644zm22.981-1.58h-21.4V72.401l21.4-.035V103.6z" clip-path="url(#f)" fill="#7c8db1"/>
    
    <g opacity=".5" clip-path="url(#f)">
    
    <defs>
    
    <path id="g" d="M66.479 68.063h3.71v32.134h-3.71z"/>
    
    </defs>
    
    <clipPath id="h">
    
    <use xlink:href="#g" overflow="visible"/>
    
    </clipPath>
    
    <path d="M70.189 100.197V68.064c-.054.038-3.44 2.247-3.711 2.414V99.45l1.685.002c.631-.001 1.308.319 2.026.745" clip-path="url(#h)" fill="#d2d2d1"/>
    
    </g>
    
    <path d="M89.757 30.281h-.002c.018.071 3.036 11.257 3.036 12.864 0 1.609-9.158 15.263-7.932 16.991 1.67 2.353 10.03 1.227 10.03 1.227.996-3.953 2.833-16.549 2.833-16.549-.416-6.114-4.505-13.787-4.505-13.787-.165-.069-1.563-.747-3.46-.746" clip-path="url(#f)" fill="#eceef7"/>
    
    </g>
    
    </g>
    
    <g fill="#465b94">
    
    <path d="M148 104.26V45.055h8.052v51.626h28.607v7.578H148zM195.638 51.307c-3.505 0-5.115-2.652-5.115-5.589s1.61-5.589 5.115-5.589 5.115 2.652 5.115 5.589-1.61 5.589-5.115 5.589zm-3.884 52.953V60.685l7.768-1.231v44.806h-7.768zM218.26 82.852v21.408h-7.768V40.414l7.768-1.231v41.585h.189l17.902-19.893h9.852L226.311 81.43l19.988 22.83h-9.947L218.45 82.852h-.19zM254.416 83.893c.285 8.525 5.969 14.588 14.305 14.588 4.547 0 9.473-1.23 12.977-3.6l1.422 7.199c-3.885 2.369-9.094 3.6-14.588 3.6-13.072 0-21.977-9.377-21.977-22.639 0-14.02 9.283-23.587 21.408-23.587 10.514 0 16.576 6.631 16.576 16.957 0 2.367-.379 5.02-.947 6.914l-29.176.189v.379zm22.641-6.252v-.662c0-6.442-3.031-10.705-9.852-10.705-7.389 0-11.746 5.873-12.41 11.556l22.262-.189z"/>
    
    </g>
    
    </svg>`);
    */
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
  }
  async fetchGoods(_skus: string[]) {
    //AsyncStorage.setItem('IAS_GOODS_LOADING', '1');
    /*const goods = await this.getGoodsCallback(skus);
    goods.map((good) => {
      // AsyncStorage.setItem('IAS_GOODS_' + good.sku, JSON.stringify(good));
    });*/
    //AsyncStorage.setItem('IAS_GOODS_LOADING', '0');
  }
  getGoodsObject(callback: any) {
    this.getGoodsCallback = callback;
  }
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    InAppStorySDK.initWith(this.apiKey, this.userId);
    this.sessionId = '';
    createSession(this.apiKey, this.userId).then((sessionId) => {
      this.sessionId = sessionId;
    });
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
