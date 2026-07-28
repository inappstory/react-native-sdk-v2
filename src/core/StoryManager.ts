import { Linking } from 'react-native';
import type { AppearanceManager } from './AppearanceManager';
import { generateId } from '../utils/generateId';
import { isFunction } from '../utils/isFunction';
import NativeAppearanceManager from '../specs/NativeAppearanceManager';
import { subscribeNativeEvent } from '../utils/subscribeNativeEvent';
import NativeStoryManager from '../specs/NativeStoryManager';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';
import NativeIamEvents from '../specs/NativeIamEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';

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

export type ProductCartOffer = {
  offerId: string;
  groupId?: string;
  name?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  imageUrls?: string[];
  currency?: string;
  price?: string;
  oldPrice?: string;
  adult?: boolean;
  availability?: number;
  size?: string;
  color?: string;
  quantity?: number;
};

export type ProductCart = {
  offers: ProductCartOffer[];
  price?: string;
  oldPrice?: string;
  priceCurrency?: string;
};

export type ProductCartHandlers = {
  onUpdate: (
    offer: ProductCartOffer
  ) => ProductCart | null | Promise<ProductCart | null>;
  getState: () => ProductCart | null | Promise<ProductCart | null>;
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
  /** Native story cache size. Android-only (iOS SDK manages its cache itself). */
  cacheSize?: 'small' | 'medium' | 'large';
  /** Anonymous mode: no userId is sent to the backend. */
  anonymous?: boolean;
};

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
  productCartHandlers: ProductCartHandlers | null = null;
  sandbox: boolean = false;
  sendStatistics: boolean = true;
  cacheSize: string | null = null;
  anonymous: boolean = false;
  appVersion: { version: string; build: number } | null = null;
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

    if (config.sendStatistics != null) {
      this.sendStatistics = config.sendStatistics;
    }

    if (config.cacheSize) {
      this.cacheSize = config.cacheSize;
    }

    if (config.anonymous) {
      this.anonymous = true;
    }

    if (config.appVersion != null) {
      this.appVersion = config.appVersion;
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

  private async applyNativeConfig(): Promise<void> {
    await NativeStoryManager.initWith(
      this.apiKey,
      this.userId,
      this.userIdSign,
      this.sandbox,
      this.sendStatistics,
      this.cacheSize,
      this.anonymous
    );

    if (this.tags.length) {
      NativeStoryManager.setTags(this.tags);
    }

    if (this.placeholders) {
      NativeStoryManager.setPlaceholders(this.placeholders);
    }

    if (this.imagePlaceholders) {
      NativeStoryManager.setImagesPlaceholders(this.imagePlaceholders);
    }

    if (this.lang) {
      NativeStoryManager.setLang(this.lang);
    }
    NativeStoryManager.changeSound(this.soundEnabled);

    if (this.appVersion != null) {
      NativeStoryManager.setAppVersion(
        this.appVersion.version,
        this.appVersion.build
      );
    }

    NativeFeedEvents.setupFeedEvents();
    NativeStoriesEvents.setupStoriesEvents();
    NativeBannerEvents.setupBannerEvents();
    NativeGoodsEvents.setupGoodsEvents();
    NativeSystemEvents.setupSystemEvents();
    NativeGameEvents.setupGameEvents();
    NativeIamEvents.setupIamEvents();
  }

  public static async create(
    config: StoryManagerConfig
  ): Promise<StoryManager> {
    const manager = new StoryManager(config);

    await manager.applyNativeConfig();

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

    const answerCart = async (
      requestId: string,
      run: (handlers: ProductCartHandlers) => Promise<ProductCart | null>
    ) => {
      let cart: ProductCart | null = null;
      try {
        if (manager.productCartHandlers) {
          cart = await run(manager.productCartHandlers);
        }
      } catch (e) {
        console.error(e);
      }
      NativeGoodsEvents.resolveProductCart(requestId, cart);
    };
    subscribeNativeEvent(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'productCartUpdate',
      (event: any) => {
        answerCart(event.body.requestId, (handlers) =>
          Promise.resolve(handlers.onUpdate(event.body.offer))
        );
      }
    );
    subscribeNativeEvent(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'productCartGetState',
      (event: any) => {
        answerCart(event.body.requestId, (handlers) =>
          Promise.resolve(handlers.getState())
        );
      }
    );
    return manager;
  }

  setProductCartHandlers(handlers: ProductCartHandlers) {
    this.productCartHandlers = handlers;
  }

  onProductCartClicked(listener: any) {
    subscribeNativeEvent(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'productCartClicked',
      listener
    );
  }

  onGoodItemSelected(listener: any) {
    subscribeNativeEvent(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'goodItemSelected',
      listener
    );
  }

  async fetchGoods(skus: string[]) {
    const goods = (await this.getGoodsCallback(skus)) ?? [];
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
    this.tags = tags;
    NativeStoryManager.setTags(tags);
  }

  addTags(tags: string[]) {
    this.tags = [...new Set([...this.tags, ...tags])];
    NativeStoryManager.addTags(tags);
  }

  removeTags(tags: string[]) {
    this.tags = this.tags.filter((tag) => !tags.includes(tag));
    NativeStoryManager.removeTags(tags);
  }

  setLang(lang: string) {
    this.lang = lang;
    NativeStoryManager.setLang(lang);
  }

  /** Runtime sound toggle: true = sound on. */
  changeSound(soundOn: boolean) {
    this.soundEnabled = soundOn;
    NativeStoryManager.changeSound(soundOn);
  }

  setAppVersion(version: string, build: number) {
    this.appVersion = { version, build };
    NativeStoryManager.setAppVersion(version, build);
  }

  private reinit() {
    this.applyNativeConfig().catch((e) =>
      console.error('InAppStory: reinit failed', e)
    );
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.reinit();
  }

  setSendStatistics(sendStatistics: boolean): void {
    this.sendStatistics = sendStatistics;
    this.reinit();
  }

  setOptions(options: Record<string, string>): void {
    NativeStoryManager.setOptions(options);
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

  /**
   * Runs a native operation that can be aborted while it is loading:
   * the operationId lets native cancel the pending open.
   */
  private runCancelable<T>(
    signal: Option<AbortSignal>,
    rejectValue: T,
    run: (operationId: string) => Promise<boolean>
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        return reject(rejectValue);
      }
      const operationId = generateId();
      const onAbort = () => {
        NativeStoryManager.cancelOperation(operationId);
        reject(rejectValue);
      };
      signal?.addEventListener('abort', onAbort);
      run(operationId).then((success) => {
        signal?.removeEventListener('abort', onAbort);
        if (success) {
          resolve(success);
        } else {
          reject(rejectValue);
        }
      });
    });
  }

  showStory(
    storyId: string | number,
    signal?: Option<AbortSignal>,
    appearanceManager?: AppearanceManager
  ): Promise<{ loaded: boolean }> {
    const commonOptions = appearanceManager?.commonOptions;
    if (commonOptions?.hasLike) {
      NativeAppearanceManager.setHasLike(commonOptions.hasLikeButton);
      NativeAppearanceManager.setHasFavorites(commonOptions.hasFavorite);
      NativeAppearanceManager.setHasShare(commonOptions.hasShare);
    }
    return this.runCancelable(signal, { loaded: false }, (operationId) =>
      NativeStoryManager.showSingle(String(storyId), operationId)
    ).then(() => ({ loaded: true }));
  }

  showStoryOnce(
    storyId: string | number,
    signal?: Option<AbortSignal>
  ): Promise<boolean> {
    return this.runCancelable(signal, false, (operationId) =>
      NativeStoryManager.showStoryOnce(String(storyId), operationId)
    );
  }

  showGame(id: string): Promise<boolean> {
    return NativeStoryManager.showGame(id);
  }

  showOnboardings(
    feed: string = 'onboarding',
    limit: number = 1000,
    tags?: string[],
    signal?: Option<AbortSignal>
  ): Promise<boolean> {
    return this.runCancelable(signal, false, (operationId) =>
      NativeStoryManager.showOnboardings(feed, limit, tags ?? null, operationId)
    );
  }

  showIAMById(
    id: string,
    onlyPreloaded: boolean,
    signal?: Option<AbortSignal>
  ): Promise<boolean> {
    return this.runCancelable(signal, false, (operationId) =>
      NativeStoryManager.showIAMById(id, onlyPreloaded, operationId)
    );
  }

  showIAMByEvent(
    event: string,
    onlyPreloaded: boolean,
    signal?: Option<AbortSignal>
  ): Promise<boolean> {
    return this.runCancelable(signal, false, (operationId) =>
      NativeStoryManager.showIAMByEvent(event, onlyPreloaded, operationId)
    );
  }

  preloadIAM(ids?: string[], tags?: string[]): Promise<boolean> {
    return NativeStoryManager.preloadIAM(ids ?? null, tags ?? null).then(
      (success) => {
        if (!success) throw false;
        return success;
      }
    );
  }

  clearCache(): void {
    NativeStoryManager.clearCache();
  }

  preloadGames(): void {
    NativeStoryManager.preloadGames();
  }

  removeFromFavorite(storyId: string | number): void {
    NativeStoryManager.removeFromFavorite(String(storyId));
  }

  removeAllFavorites(): void {
    NativeStoryManager.removeAllFavorites();
  }

  favoritesCount(): Promise<number> {
    return NativeStoryManager.favoritesCount();
  }

  /** Log out the current user (clears user session on the native SDK). */
  logout(): void {
    NativeStoryManager.logout();
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

  private favoriteCellListener?: (...args: any[]) => void;

  onFavoriteCell(listener: any) {
    this.favoriteCellListener = listener;
  }

  favoriteCellPressed(feed: string) {
    NativeStoryManager.onFavoriteCell();
    this.fetchFavorites(feed);
    if (isFunction(this.favoriteCellListener)) this.favoriteCellListener?.();
  }

  onStoryReaderWillShow(listener: any) {
    subscribeNativeEvent(
      NativeFeedEvents,
      'NativeFeedEvents',
      'storyReaderWillShow',
      listener
    );
  }

  onStoryReaderDidClose(listener: any) {
    subscribeNativeEvent(
      NativeFeedEvents,
      'NativeFeedEvents',
      'storyReaderDidClose',
      listener
    );
  }

  onStoryWidgetEvent(listener: any) {
    subscribeNativeEvent(
      NativeStoriesEvents,
      'NativeStoriesEvents',
      'storyWidgetEvent',
      listener
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
      listener
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

  onGameEvent(listener: any) {
    for (const name of [
      'startGame',
      'closeGame',
      'eventGame',
      'gameFailure',
    ] as const) {
      subscribeNativeEvent(
        NativeGameEvents,
        'NativeGameEvents',
        name,
        listener
      );
    }
  }

  onIamEvent(listener: any) {
    for (const name of [
      'showInAppMessage',
      'closeInAppMessage',
      'inAppMessageWidgetEvent',
    ] as const) {
      subscribeNativeEvent(NativeIamEvents, 'NativeIamEvents', name, listener);
    }
  }

  onFailure(listener: any) {
    for (const name of [
      'sessionFailure',
      'storyFailure',
      'currentStoryFailure',
      'networkFailure',
      'requestFailure',
    ] as const) {
      subscribeNativeEvent(
        NativeSystemEvents,
        'NativeSystemEvents',
        name,
        listener
      );
    }
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
