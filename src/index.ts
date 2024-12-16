//import './wdyr';
import { Linking, NativeEventEmitter, NativeModules } from 'react-native';
import InAppStorySDK from '@inappstory/react-native-sdk';
import { StoriesList } from './stories/StoriesList';
import { useStore } from './hooks/useStore';
import deepmerge from 'deepmerge';
import parseSides from 'parse-css-sides';
import { isFunction } from './helpers/isFunction';

export {
  StoriesList,
  useStore,
  StoriesListCardTitlePosition,
  StoriesListCardViewVariant,
  StoriesListCardTitleTextAlign,
};
export declare type StoriesListClickEvent = {
  id: number;
  index: number;
  isDeeplink: boolean;
  url: string | undefined;
};
export declare type StoriesListFavoriteCardOptions = StoriesListCardOptions &
  Partial<{
    title: Partial<{
      content: string;
      color: string;
      padding: string | number;
      font: string;
    }>;
  }>;

export declare type OnboardingLoadStatus = {
  feed: string | number;
  defaultListLength: number;
  favoriteListLength: number;
  success: boolean;
  error: Option<{
    name: string;
    networkStatus: number;
    networkMessage: string;
  }>;
};

export enum AndroidWindowSoftInputMode {
  AdjustNothing = 'AdjustNothing',
  AdjustPan = 'AdjustPan',
  AdjustResize = 'AdjustResize',
  AdjustUnspecified = 'AdjustUnspecified',
  AlwaysHidden = 'AlwaysHidden',
  AlwaysVisible = 'AlwaysVisible',
  Visible = 'Visible',
  Hidden = 'Hidden',
  Unchanged = 'Unchanged',
}

export declare type ClickPayload = {
  id: number;
  index: number;
  url: string;
};

export declare type ClickHandlerPayload = {
  data: ClickPayload;
};

export declare enum StoriesListSliderAlign {
  CENTER = 'center',
  LEFT = 'left',
  RIGHT = 'right',
}
export type Option<T> = T | null | undefined;

export type Dict<T = any> = {
  [key: string]: T | undefined;
  [key: number]: T | undefined;
};
export enum StoryReaderSwipeStyle {
  FLAT = 'flat',
  COVER = 'cover',
  CUBE = 'cube',
}
export enum StoryReaderCloseButtonPosition {
  LEFT = 'left',
  RIGHT = 'right',
}
export type StoriesListDimensions = {
  totalHeight: number;
};
export declare type StoryManagerConfig = {
  apiKey: string;
  userId?: Option<string | number>;
  tags?: Option<Array<string>>;
  placeholders?: Option<Dict<string>>;
  lang?: string;
  defaultMuted?: boolean;
  appVersion?: {
    version: string;
    build: number;
  };
};

enum StoriesListCardTitlePosition {
  CARD_INSIDE_BOTTOM = 'cardInsideBottom',
  CARD_OUTSIDE_TOP = 'cardOutsideTop',
  CARD_OUTSIDE_BOTTOM = 'cardOutsideBottom',
}

enum StoriesListCardViewVariant {
  CIRCLE = 'circle',
  QUAD = 'quad',
  RECTANGLE = 'rectangle',
}
enum StoriesListCardTitleTextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}
export declare class StoriesListViewModel {
  get feedSlug(): string;

  get testKey(): Option<string>;

  get listLoadStatus(): ListLoadStatus;

  get containerOptions(): Record<any, any>;

  get viewOptions(): Record<any, any>;

  reload(): Promise<ListLoadStatus>;

  // public get storiesListDimensions(): StoriesListDimensions;
}
export declare class AppearanceManagerV1 {
  public setCommonOptions(
    options: AppearanceCommonOptions
  ): AppearanceManagerV1;

  public get commonOptions(): AppearanceCommonOptions;

  public setStoriesListOptions(
    options: StoriesListOptions
  ): AppearanceManagerV1;

  public get storiesListOptions(): StoriesListOptions;

  public setStoryReaderOptions(
    options: StoryReaderOptions
  ): AppearanceManagerV1;

  public get storyReaderOptions(): StoryReaderOptions;

  public setStoryFavoriteReaderOptions(
    options: StoryFavoriteReaderOptions
  ): AppearanceManager;

  public get storyFavoriteReaderOptions(): StoryFavoriteReaderOptions;

  // public setGoodsWidgetOptions(options: GoodsWidgetOptions): AppearanceManager;
  // public get goodsWidgetOptions(): GoodsWidgetOptions;
}

export type ListLoadStatus = {
  feed: string | number;
  defaultListLength: number;
  favoriteListLength: number;
  success: boolean;
  error: Option<{
    name: string;
    networkStatus: number;
    networkMessage: string;
  }>;
};

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

const eventEmitter = new NativeEventEmitter(
  NativeModules.RNInAppStorySDKModule
);
const EVENTS_MAP = {
  shareStory: 'clickOnShareStory',
  clickOnFavoriteCell: 'favoriteCellDidSelect',
  onFavoriteCell: 'favoriteCellDidSelect',
};
const getEventName = (eventName) => {
  return EVENTS_MAP[eventName] || eventName;
};
export class StoryManager {
  apiKey: string = '';
  userId?: string | number | null = null;
  tags: string[] = [];
  placeholders: any = '';
  imagePlaceholders: any = '';
  lang: string = '';
  soundEnabled: boolean = true;
  getGoodsCallback: Function = () => {};
  sandbox: boolean = false;
  sendStatistics: boolean = true;
  listeners: any = [];
  constructor(config: StoryManagerConfig) {
    // use string or null as userId (native sdk require String)
    const userId = config.userId != null ? String(config.userId) : null;
    InAppStorySDK.initWith(
      config.apiKey,
      userId,
      this.sandbox,
      this.sendStatistics
    );
    InAppStorySDK.setUserID(userId);
    this.apiKey = config.apiKey;
    this.userId = userId;
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

    if (
      config.appVersion != null &&
      config.appVersion.version != null &&
      config.appVersion.build != null
    ) {
      InAppStorySDK.setAppVersion(
        config.appVersion.version,
        config.appVersion.build
      );
    }

    eventEmitter.addListener('getGoodsObject', (event) => {
      this.fetchGoods(event.skus);
    });

    eventEmitter.addListener('handleCTA', (event) => {
      let src = CTASource.UNKNOWN;
      let payload:
        | CTAStoryListPayload
        | CTAStoryReaderPayload
        | CTAGameReaderPayload = null!;
      switch (event.action) {
        case 'button':
        case 'swipe':
          src = CTASource.STORY_READER;
          payload = {
            id: 0,
            url: event.url,
            index: 0,
            elementId: '',
          };
          break;
        case 'deeplink':
          src = CTASource.STORY_LIST;
          payload = {
            id: 0,
            index: 0,
            isDeeplink: true,
            url: event.url,
          };
          break;
        case 'game':
          src = CTASource.GAME_READER;
          payload = {
            url: event.url,
            gameInstanceId: '0',
          };
          break;
      }
      if (src !== CTASource.UNKNOWN) {
        this.clickOnButtonAction({ src, payload });
      }
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

  onFavoriteCell(feed) {
    InAppStorySDK.onFavoriteCell();
    this.fetchFavorites(feed);
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
    this.tags = tags;
    InAppStorySDK.setTags(tags);
  }
  removeTags(tags: string[]) {
    InAppStorySDK.removeTags(tags);
  }
  setUserId(userId: string | number): void {
    // use string or null as userId (native sdk require String)
    this.userId = userId != null ? String(userId) : null;
    InAppStorySDK.setUserID(this.userId);
  }
  setLang(lang: string): void {
    this.lang = lang;
    InAppStorySDK.setLang(lang);
  }
  setPlaceholders(placeholders: any): void {
    this.placeholders = placeholders;
    InAppStorySDK.setPlaceholders(placeholders);
  }
  setImagePlaceholders(placeholders: any): void {
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
        InAppStorySDK.setHasFavorites(
          appearanceManager.commonOptions.hasFavorite
        );
        InAppStorySDK.setHasShare(appearanceManager.commonOptions.hasShare);
      }
      InAppStorySDK.showSingle(storyId).then((success: boolean) => {
        if (success) {
          resolve({ loaded: true });
        } else {
          reject({ loaded: false });
        }
      });
    });
  }
  async closeStoryReader() {
    return InAppStorySDK.closeReader();
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
      InAppStorySDK.showOnboardings(
        options?.feed,
        options?.limit || 10,
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

  protected _callbacks: Dict<any> = {};

  public set storyLinkClickHandler(callback: Function) {
    if (isFunction(callback)) {
      this._callbacks.storyLinkClickHandler = callback;
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
        if (isFunction(this._callbacks.storyLinkClickHandler)) {
          this._callbacks.storyLinkClickHandler(cbPayload);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      this.defaultLinking(payload.url);
    }
  };
}
export class AppearanceManager {
  hasLike = true;
  hasDislike = true;
  hasFavorites = true;
  hasShare = true;
  storiesListOptions: any = null;
  storyReaderOptions: any = null;
  storyFavoriteReaderOptions: any = null;
  commonOptions: any = null;
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
    this.commonOptions = deepmerge(this.commonOptions, options);
    InAppStorySDK.setHasLike(this.commonOptions.hasLike);
    //InAppStorySDK.setHasDislike(options.hasDislikeButton);
    InAppStorySDK.setHasFavorites(this.commonOptions.hasFavorite);
    InAppStorySDK.setHasShare(this.commonOptions.hasShare);
    return this;
  }
  setStoryFavoriteReaderOptions(
    options: Partial<{
      title: Partial<{ content: string; font: string; color: string }>;
    }>
  ) {
    this.storyFavoriteReaderOptions = deepmerge(
      this.storyFavoriteReaderOptions,
      options
    );
    return this;
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
    }>
  ) {
    this.storyReaderOptions = deepmerge(this.storyReaderOptions, options);
    InAppStorySDK.setCloseButtonPosition(
      this.storyReaderOptions.closeButtonPosition || 'right'
    );
    InAppStorySDK.setScrollStyle(
      this.storyReaderOptions.scrollStyle || 'cover'
    );
    InAppStorySDK.setReaderCornerRadius(
      this.storyReaderOptions.slideBorderRadius || 0
    );
    return this;
  }
  setStoriesListOptions(options: StoriesListOptions) {
    this.storiesListOptions = deepmerge(this.storiesListOptions, options);
    this.storiesListOptions = this.proccessCardTitlePadding(
      this.storiesListOptions
    );
    return this;
  }

  private proccessCardTitlePadding(
    storiesListOptions: StoriesListOptions
  ): StoriesListOptions {
    const cardTitleOptions = storiesListOptions.card?.title;
    const cardTitlePadding = cardTitleOptions?.padding;

    let cardTitlePaddingParsed = {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    };
    try {
      if (typeof cardTitlePadding === 'number') {
        cardTitlePaddingParsed.paddingTop = cardTitlePadding;
        cardTitlePaddingParsed.paddingRight = cardTitlePadding;
        cardTitlePaddingParsed.paddingBottom = cardTitlePadding;
        cardTitlePaddingParsed.paddingLeft = cardTitlePadding;
      } else {
        const sides = parseSides(cardTitlePadding ?? '0px');
        cardTitlePaddingParsed.paddingTop = parseFloat(sides.top);
        cardTitlePaddingParsed.paddingRight = parseFloat(sides.right);
        cardTitlePaddingParsed.paddingBottom = parseFloat(sides.bottom);
        cardTitlePaddingParsed.paddingLeft = parseFloat(sides.left);
      }
    } catch (e) {
      console.error(e);
    }
    if (!storiesListOptions.card) {
      storiesListOptions.card = {};
    }
    if (!storiesListOptions.card.title) {
      storiesListOptions.card.title = {};
    }
    // @ts-ignore
    storiesListOptions.card.title.padding = cardTitlePaddingParsed;
    return storiesListOptions;
  }
}
export declare type AppearanceCommonOptions = Partial<{
  hasFavorite: boolean;
  hasLike: boolean;
  hasLikeButton: boolean;
  hasDislikeButton: boolean;
  hasShare: boolean;
}>;
export declare type StoryReaderOptions = Partial<{
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
  closeButton: {
    svgSrc: {
      baseState: string;
    };
  };
  likeButton: {
    svgSrc: {
      baseState: string;
      activeState: string;
    };
  };
  dislikeButton: {
    svgSrc: {
      baseState: string;
      activeState: string;
    };
  };
  favoriteButton: {
    svgSrc: {
      baseState: string;
      activeState: string;
    };
  };
  muteButton: {
    svgSrc: {
      baseState: string;
      activeState: string;
    };
  };
  shareButton: {
    svgSrc: {
      baseState: string;
    };
  };
}>;
export declare type StoryFavoriteReaderOptions = Partial<{
  title: Partial<{
    content: string;
    font: string;
    color: string;
  }>;
}>;

export declare type StoriesListTitleOptions = Partial<{
  content: string;
  color: string;
  font: string;
  marginBottom: number;
}>;
export declare type StoriesListOptions = Partial<{
  title: StoriesListTitleOptions;
  card: StoriesListCardOptions;
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

  // setCallback ?
  handleStoryLinkClick: (payload: StoriesListClickEvent) => void;

  handleStartLoad: (loaderContainer: HTMLElement) => void;
  handleStopLoad: (loaderContainer: HTMLElement) => void;

  // handleClickOnStory?: (event: StoriesListClickEvent) => void,
}>;
export declare type StoriesListCardOptions = Partial<{
  title: Partial<{
    color: string;
    padding: string | number;
    font: string;
    fontSize: number;
    fontWeight: string | number;
    fontFamily: string;
    lineHeight: number;
    display: boolean;
    textAlign: StoriesListCardTitleTextAlign;
    position: StoriesListCardTitlePosition;
    lineClamp: number;
  }>;
  aspectRatio: number;
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
  mask: Partial<{
    color: Option<string>;
  }>;
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
    mask: Partial<{
      color: Option<string>;
    }>;
  }>;
}>;

export default NativeModules.RNInAppStorySDKModule;
