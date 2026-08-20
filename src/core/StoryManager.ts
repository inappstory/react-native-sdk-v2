import type { AppearanceManager } from './AppearanceManager';
import { generateId } from '../utils/generateId';
import { isFunction } from '../utils/isFunction';
import NativeAppearanceManager from '../specs/NativeAppearanceManager';
import NativeStoryManager from '../specs/NativeStoryManager';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';
import NativeIamEvents from '../specs/NativeIamEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';
import { CTAHandler } from './CTAHandler';
import { StoryEvents } from './StoryEvents';
import { assertUserIdLength, tagsAreValid } from '../utils/validation';
import type { Option } from '../types/common';
import type { ProductCart, ProductCartHandlers } from '../types/ProductCart';
import type { StoryManagerConfig } from '../types/StoryManager';

export class StoryManager extends StoryEvents {
  apiKey: string = '';
  userId: string = '';
  userIdSign: string | null = null;
  tags: string[] = [];
  placeholders: any = '';
  imagePlaceholders: any = '';
  lang: string = '';
  soundEnabled: boolean = true;
  private goodsCallback: Function = () => {};
  productCartHandlers: ProductCartHandlers | null = null;
  sandbox: boolean = false;
  sendStatistics: boolean = true;
  cacheSize: string | null = null;
  anonymous: boolean = false;
  appVersion: { version: string; build: number } | null = null;
  listeners: any = [];

  protected readonly cta = new CTAHandler();

  /** Resolves once the native SDK has been initialised with the current config. */
  private nativeReady: Promise<void>;

  constructor(config: StoryManagerConfig) {
    super();
    const userId = assertUserIdLength(
      config.userId != null ? String(config.userId) : ''
    );
    const userIdSign =
      config.userIdSign != null ? String(config.userIdSign) : null;

    this.apiKey = config.apiKey;
    this.userId = userId;
    this.userIdSign = userIdSign;

    if (config.tags && tagsAreValid(config.tags)) {
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

    this.setupJsEventBridge();
    this.nativeReady = this.reinit();
  }

  /**
   * Native -> JS bridges that are not `on*` listeners the app registers, but
   * plumbing the manager always needs: CTA routing, goods and the product
   * cart. Lives in the constructor so it is wired on every construction path,
   * not only `create()` — `new StoryManager()` plus `setApiKey()` initialises
   * native just as well and used to leave these unsubscribed.
   */
  private setupJsEventBridge(): void {
    this.subscribe(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'getGoodsObject',
      (event: any) => {
        this.fetchGoods(event.body.skus);
      }
    );

    this.subscribe(
      NativeSystemEvents,
      'NativeSystemEvents',
      'handleCTA',
      (event: any) => {
        this.handleCTA(event.body);
      }
    );

    const answerCart = async (
      requestId: string,
      run: (handlers: ProductCartHandlers) => Promise<ProductCart | null>
    ) => {
      let cart: ProductCart | null = null;
      try {
        if (this.productCartHandlers) {
          cart = await run(this.productCartHandlers);
        }
      } catch (e) {
        console.error(e);
      }
      NativeGoodsEvents.resolveProductCart(requestId, cart);
    };
    this.subscribe(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'productCartUpdate',
      (event: any) => {
        answerCart(event.body.requestId, (handlers) =>
          Promise.resolve(handlers.onUpdate(event.body.offer))
        );
      }
    );
    this.subscribe(
      NativeGoodsEvents,
      'NativeGoodsEvents',
      'productCartGetState',
      (event: any) => {
        answerCart(event.body.requestId, (handlers) =>
          Promise.resolve(handlers.getState())
        );
      }
    );
  }

  private async applyNativeConfig(): Promise<void> {
    if (!tagsAreValid(this.tags)) {
      this.tags = [];
    }
    await NativeStoryManager.initWith(
      this.apiKey,
      this.userId,
      this.userIdSign,
      this.sandbox,
      this.sendStatistics,
      this.cacheSize,
      this.anonymous,
      this.tags
    );

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

  /**
   * The recommended entry point: same as `new StoryManager(config)`, but waits
   * for the native SDK to finish initialising and rejects if it fails.
   */
  public static async create(
    config: StoryManagerConfig
  ): Promise<StoryManager> {
    const manager = new StoryManager(config);
    await manager.nativeReady;
    return manager;
  }

  setProductCartHandlers(handlers: ProductCartHandlers) {
    this.productCartHandlers = handlers;
  }

  async fetchGoods(skus: string[]) {
    const goods = (await this.goodsCallback(skus)) ?? [];
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
    this.goodsCallback = (skus: string[]) =>
      new Promise((resolve) => resolve(callback(skus)));
  }

  setUserId(userId: string, userIdSign: string | null) {
    assertUserIdLength(userId);
    NativeStoryManager.setUserID(userId, userIdSign);
  }

  setTags(tags: string[]) {
    if (!tagsAreValid(tags)) return;
    this.tags = tags;
    NativeStoryManager.setTags(tags);
  }

  addTags(tags: string[]) {
    const merged = [...new Set([...this.tags, ...tags])];
    if (!tagsAreValid(merged)) return;
    this.tags = merged;
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

  /**
   * (Re)apply the current config to the native SDK. Returns the pending init
   * so `create()` can await it; the rejection is also logged here, because the
   * constructor and the `set*` setters start it without anyone awaiting.
   */
  private reinit(): Promise<void> {
    this.nativeReady = this.applyNativeConfig();
    this.nativeReady.catch((e) =>
      console.error('InAppStory: reinit failed', e)
    );
    return this.nativeReady;
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
  }
  async fetchFavorites(feed: string) {
    NativeStoryManager.getFavoriteStories(feed);
  }

  preloadBannerPlace(placeId: string, tags?: string[]): Promise<boolean> {
    if (tags && !tagsAreValid(tags)) return Promise.reject(false);
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
    if (tags && !tagsAreValid(tags)) return Promise.reject(false);
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
    if (tags && !tagsAreValid(tags)) return Promise.reject(false);
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

  private favoriteCellListener?: (...args: any[]) => void;

  onFavoriteCell(listener: any) {
    this.favoriteCellListener = listener;
  }

  favoriteCellPressed(feed: string) {
    NativeStoryManager.onFavoriteCell();
    this.fetchFavorites(feed);
    if (isFunction(this.favoriteCellListener)) this.favoriteCellListener();
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
    this.cta.clickHandler = callback;
  }

  handleCTA(event: { url?: string; action?: string }) {
    this.cta.handle(event);
  }
}
