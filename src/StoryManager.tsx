import { Linking } from 'react-native';
import { isFunction } from './helpers/isFunction';
import { subscribeNativeEvent } from './helpers/subscribeNativeEvent';
import NativeStoryManager from './NativeStoryManager';
import NativeBannerEvents from './specs/NativeBannerEvents';
import NativeFeedEvents from './specs/NativeFeedEvents';
import NativeGoodsEvents from './specs/NativeGoodsEvents';
import NativeStoriesEvents from './specs/NativeStoriesEvents';
import NativeSystemEvents from './specs/NativeSystemEvents';

export type Option<T> = T | null | undefined;

export enum CTASource {
  UNKNOWN = 'unknown',
  STORY_LIST = 'storyList',
  STORY_READER = 'storyReader',
  GAME_READER = 'gameReader',
}

export type CTAGameReaderPayload = { url: string; gameInstanceId: string };
export type CTAStoryReaderPayload = {
  id: number;
  index: number;
  url: string;
  elementId: string;
};
export type CTAStoryListPayload = {
  id: number;
  index: number;
  isDeeplink: boolean;
  url: string | undefined;
};

export type Dict<T = any> = {
  [key: string]: T | undefined;
  [key: number]: T | undefined;
};

export declare type StoryManagerConfig = {
  apiKey: string;
  userId?: Option<string | number>;
  userIdSign?: Option<string>;
  tags?: Option<Array<string>>;
  placeholders?: Option<Dict<string>>;
  lang?: string;
  defaultMuted?: boolean;
  appVersion?: {
    version: string;
    build: number;
  };
  sendStatistics?: boolean;
};

// const eventEmitter = new NativeEventEmitter(
//     NativeModules.RNInAppStorySDKModule
// );

// const EVENTS_MAP = {
//     shareStory: 'clickOnShareStory',
//     clickOnFavoriteCell: 'favoriteCellDidSelect',
//     onFavoriteCell: 'favoriteCellDidSelect',
// };
// const getEventName = (eventName: string) => {
//     return EVENTS_MAP[eventName] || eventName;
// };

export class StoryManager {
  apiKey: string = '';
  userId: string = '';
  userIdSign: string | null = null;
  tags: string[] = [];
  placeholders: any = '';
  imagePlaceholders: any = '';
  lang: string = '';
  soundEnabled: boolean = true;
  getGoodsCallback: Function = () => {};
  sandbox: boolean = false;
  sendStatistics: boolean = true;
  listeners: any = [];

  protected _callbacks: Dict<any> = {};

  constructor(config: StoryManagerConfig) {
    const userId = config.userId != null ? String(config.userId) : '';
    const userIdSign =
      config.userIdSign != null ? String(config.userIdSign) : null;

    this.apiKey = config.apiKey;
    this.userId = userId;
    this.userIdSign = userIdSign;

    if (config.tags) {
      this.tags = config.tags;
    }

    if (config.placeholders) {
      this.placeholders = config.placeholders;
    }

    if (config.lang) {
      this.lang = config.lang;
    }

    if (config.defaultMuted) {
      this.soundEnabled = false;
    } else {
      this.soundEnabled = true;
    }

    // eventEmitter.addListener('getGoodsObject', (event) => {
    //     this.fetchGoods(event.skus);
    // });

    // eventEmitter.addListener('handleCTA', (event) => {
    //     let src = CTASource.UNKNOWN;
    //     let payload:
    //         | CTAStoryListPayload
    //         | CTAStoryReaderPayload
    //         | CTAGameReaderPayload = null!;
    //     switch (event.action) {
    //         case 'button':
    //         case 'swipe':
    //             src = CTASource.STORY_READER;
    //             payload = {
    //                 id: 0,
    //                 url: event.url,
    //                 index: 0,
    //                 elementId: '',
    //             };
    //             break;
    //         case 'deeplink':
    //             src = CTASource.STORY_LIST;
    //             payload = {
    //                 id: 0,
    //                 index: 0,
    //                 isDeeplink: true,
    //                 url: event.url,
    //             };
    //             break;
    //         case 'game':
    //             src = CTASource.GAME_READER;
    //             payload = {
    //                 url: event.url,
    //                 gameInstanceId: '0',
    //             };
    //             break;
    //     }
    //     if (src !== CTASource.UNKNOWN) {
    //         this.clickOnButtonAction({ src, payload });
    //     }
    // });
  }

  public static async create(
    config: StoryManagerConfig
  ): Promise<StoryManager> {
    const manager = new StoryManager(config);

    console.warn('Initializing StoryManager with config');

    await NativeStoryManager.initWith(
      manager.apiKey,
      manager.userId,
      manager.userIdSign,
      manager.sandbox,
      manager.sendStatistics
    );

    // if (manager.tags) {
    //     NativeStoryManager.setTags(manager.tags);
    // }

    // if (manager.placeholders) {
    //     NativeStoryManager.setPlaceholders(manager.placeholders);
    // }

    // if (manager.lang) {
    //     NativeStoryManager.setLang(manager.lang);
    // }
    // NativeStoryManager.changeSound(manager.soundEnabled);

    // if (
    //     config.appVersion != null &&
    //     config.appVersion.version != null &&
    //     config.appVersion.build != null
    // ) {
    //     NativeStoryManager.setAppVersion(
    //         config.appVersion.version,
    //         config.appVersion.build
    //     );
    // }

    NativeFeedEvents.setupFeedEvents();
    NativeStoriesEvents.setupStoriesEvents();
    NativeBannerEvents.setupBannerEvents();
    NativeGoodsEvents.setupGoodsEvents();
    NativeSystemEvents.setupSystemEvents();

    subscribeNativeEvent(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'getGoodsObject',
      (event: any) => {
        manager.fetchGoods(event.body.skus);
      }
    );

    subscribeNativeEvent(
      NativeSystemEvents,
      'NativeSystemEvents',
      'handleCTA',
      (event: any) => {
        manager.handleCTA(event.body);
      }
    );
    return manager;
  }

  async fetchGoods(skus: string[]) {
    const goods = await this.getGoodsCallback(skus);
    goods.forEach((good: any) => {
      NativeGoodsEvents.addProductToCache(
        good.sku,
        good.title,
        good.subtitle,
        good.imageURL,
        good.price,
        good.oldPrice
      );
    });
    NativeGoodsEvents.commitGoods();
  }

  getGoods(callback: (skus: string[]) => any) {
    this.getGoodsCallback = (skus: string[]) =>
      new Promise((resolve) => resolve(callback(skus)));
  }

  setUserId(userId: string, userIdSign: string | null) {
    NativeStoryManager.setUserID(userId, userIdSign);
  }

  setTags(tags: string[]) {
    NativeStoryManager.setTags(tags);
  }

  removeTags(tags: string[]) {
    NativeStoryManager.removeTags(tags);
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    NativeStoryManager.initWith(
      this.apiKey,
      this.userId,
      this.userIdSign,
      this.sandbox,
      this.sendStatistics
    );
  }

  setSendStatistics(sendStatistics: boolean): void {
    this.sendStatistics = sendStatistics;
    NativeStoryManager.initWith(
      this.apiKey,
      this.userId,
      this.userIdSign,
      this.sandbox,
      this.sendStatistics
    );
  }

  async createSubscriberList(feed: string, uniqueId?: string) {
    NativeStoryManager.createSubscriberList(feed, uniqueId ?? feed);
  }
  async fetchFeed(feed: string, uniqueId: string) {
    NativeStoryManager.getStories(feed, uniqueId);
    //if (include_favorites) {
    //NativeStoryManager.getFavoriteStories(feed);
    //}
  }
  async fetchFavorites(feed: string) {
    NativeStoryManager.getFavoriteStories(feed);
  }

  preloadBannerPlace(placeId: string, tags?: string[]): Promise<boolean> {
    return NativeStoryManager.preloadBannerPlace(placeId, tags ?? null).then(
      (success) => {
        if (!success) throw false;
        return success;
      }
    );
  }

  // setEventEmitter(emitter: EventEmitter) {
  //     this.emmitter = emitter;
  // }

  // on(eventName: string | symbol, listener: any) {
  //     this.emmitter.addListener(eventName as string, async (event) => {
  //         listener(event);
  //     });
  //     // super.on(eventName, listener);
  //     return this;
  // }

  // on(eventName: string | symbol, listener: any) {
  //     //super.on(eventName, listener);
  //     // eventEmitter.addListener(getEventName(eventName), async (event) => {
  //     //     listener(event);
  //     // });
  //     return this;
  // }
  // once(eventName: string | symbol, listener: any) {
  //     //super.on(eventName, listener);
  //     // eventEmitter.addListener(getEventName(eventName), async (event) => {
  //     //     listener(event);
  //     // });
  //     return this;
  // }

  onFavoriteCell(feed: string) {
    NativeStoryManager.onFavoriteCell();
    this.fetchFavorites(feed);
  }

  onStoryReaderWillShow(listener: any) {
    subscribeNativeEvent(
      NativeFeedEvents,
      'NativeFeedEvents',
      'storyReaderWillShow',
      (event) => {
        console.log('Story reader will show event received: ', event);
        listener(event);
      }
    );
  }

  onBannerWidgetEvent(listener: any) {
    subscribeNativeEvent(
      NativeBannerEvents,
      'NativeBannerEvents',
      'bannerWidgetEvent',
      listener
    );
  }

  onShowStory(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'showStory',
      (event) => {
        console.log('Show story event received: ', event);
        listener(event);
      }
    );
  }

  onCloseStory(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'closeStory',
      listener
    );
  }

  onShowSlide(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'showSlide',
      listener
    );
  }

  onClickOnButton(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'clickOnButton',
      listener
    );
  }

  onLikeStory(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'likeStory',
      listener
    );
  }

  onDislikeStory(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'dislikeStory',
      listener
    );
  }

  onFavoriteStory(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'favoriteStory',
      listener
    );
  }

  onShareStory(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'clickOnShareStory',
      listener
    );
  }

  onShareStoryWithPath(listener: any) {
    subscribeNativeEvent(
      NativeSystemEvents,
      'NativeSystemEvents',
      'customShare',
      listener
    );
  }

  setPlaceholders(placeholders: any): void {
    this.placeholders = placeholders;
    NativeStoryManager.setPlaceholders(placeholders);
  }
  setImagePlaceholders(placeholders: any): void {
    this.imagePlaceholders = placeholders;
    NativeStoryManager.setImagesPlaceholders(placeholders);
  }

  public set storyLinkClickHandler(callback: Function) {
    if (isFunction(callback)) {
      this._callbacks.storyLinkClickHandler = callback;
    }
  }

  handleCTA(event: { url?: string; action?: string }) {
    let src = CTASource.UNKNOWN;
    let payload:
      | CTAStoryListPayload
      | CTAStoryReaderPayload
      | CTAGameReaderPayload = null!;
    switch (event.action) {
      case 'button':
      case 'swipe':
        src = CTASource.STORY_READER;
        payload = { id: 0, url: event.url!, index: 0, elementId: '' };
        break;
      case 'deeplink':
        src = CTASource.STORY_LIST;
        payload = { id: 0, index: 0, isDeeplink: true, url: event.url };
        break;
      case 'game':
        src = CTASource.GAME_READER;
        payload = { url: event.url!, gameInstanceId: '0' };
        break;
    }
    if (src !== CTASource.UNKNOWN) {
      this.clickOnButtonAction({ src, payload });
    }
  }

  protected async defaultLinking(url?: string) {
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          Linking.openURL(url);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  private clickOnButtonAction = ({
    src,
    payload,
  }: {
    src: CTASource;
    payload: CTAStoryListPayload | CTAStoryReaderPayload | CTAGameReaderPayload;
  }) => {
    if (isFunction(this._callbacks.storyLinkClickHandler)) {
      const cbPayload = { src, srcRef: 'default', data: payload };
      try {
        this._callbacks.storyLinkClickHandler(cbPayload);
      } catch (e) {
        console.error(e);
      }
    } else {
      this.defaultLinking(payload.url);
    }
  };
}
