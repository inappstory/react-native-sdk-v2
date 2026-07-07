import { isFunction } from './helpers/isFunction';
import NativeStoryManager from './NativeStoryManager';
import NativeFeedEvents from './specs/NativeFeedEvents';
import NativeStoriesEvents from './specs/NativeStoriesEvents';

export type Option<T> = T | null | undefined;

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
    return manager;
  }

  // async fetchGoods(skus: string[]) {
  //     this.getGoodsCallback(skus).then((goods) => {
  //         goods.map((good) => {
  //             InAppStorySDK.addProductToCache(
  //                 good.sku,
  //                 good.title,
  //                 good.subtitle,
  //                 good.imageURL,
  //                 good.price,
  //                 good.oldPrice
  //             );
  //         });
  //     });
  // }
  // getGoods(callback: any) {
  //     this.getGoodsCallback = (skus) => {
  //         return new Promise((resolve, _reject) => {
  //             resolve(callback(skus));
  //         });
  //     };
  // }

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
    NativeFeedEvents.storyReaderWillShow((event) => {
      console.log('Story reader will show event received: ', event);
      listener(event);
    });
  }

  onShowStory(listener: any) {
    NativeStoriesEvents.showStory((event) => {
      console.log('Show story event received: ', event);
      listener(event);
    });
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
}
