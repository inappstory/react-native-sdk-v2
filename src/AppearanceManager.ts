import NativeAppearanceManager from './NativeAppearanceManager';
import type { Option } from './StoryManager';
import type { StyleProp, ViewStyle } from 'react-native';
import parseSides from 'parse-css-sides';
import type { CoverQuality } from './data/Enum';
import { deepmerge } from 'deepmerge-ts';

export enum StoryReaderCloseButtonPosition {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum StoryReaderSwipeStyle {
  FLAT = 'flat',
  COVER = 'cover',
  CUBE = 'cube',
}

export declare enum StoriesListSliderAlign {
  CENTER = 'center',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum StoriesListCardTitlePosition {
  CARD_INSIDE_BOTTOM = 'cardInsideBottom',
  CARD_OUTSIDE_TOP = 'cardOutsideTop',
  CARD_OUTSIDE_BOTTOM = 'cardOutsideBottom',
}

export enum StoriesListCardViewVariant {
  CIRCLE = 'circle',
  QUAD = 'quad',
  RECTANGLE = 'rectangle',
}

export enum StoriesListCardTitleTextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export declare type StoriesListFavoriteCardOptions = StoriesListCardOptions &
  Partial<{
    title: Partial<{
      content: string;
      color: string;
      padding: string | number;
      font: string;
    }>;
    customStyles?: StyleProp<ViewStyle>;
  }>;

export declare type StoriesListClickEvent = {
  id: number;
  index: number;
  isDeeplink: boolean;
  url: string | undefined;
};

export declare type StoriesListOptions = Partial<{
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

export interface AppearanceManagerCommonOptions {
  hasFavorite: boolean;
  hasLike: boolean;
  hasLikeButton: boolean;
  hasDislikeButton: boolean;
  hasShare: boolean;
  coverQuality?: CoverQuality;
}

export class AppearanceManager {
  hasLike = true;
  hasDislike = true;
  hasFavorites = true;
  hasShare = true;
  storiesListOptions: any = null;
  storyReaderOptions: any = null;
  storyFavoriteReaderOptions: any = null;
  commonOptions: AppearanceManagerCommonOptions = {
    hasFavorite: false,
    hasLike: false,
    hasLikeButton: false,
    hasDislikeButton: false,
    hasShare: false,
  };
  //TODO: Migrate the APIs from JS to Native

  setCommonOptions(options: AppearanceManagerCommonOptions) {
    this.commonOptions = deepmerge(this.commonOptions, options);
    NativeAppearanceManager.setHasLike(this.commonOptions.hasLike);
    NativeAppearanceManager.setHasFavorites(this.commonOptions.hasFavorite);
    NativeAppearanceManager.setHasShare(this.commonOptions.hasShare);
    if (this.commonOptions.coverQuality !== undefined) {
      NativeAppearanceManager.setCoverQuality(this.commonOptions.coverQuality);
    }
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
    NativeAppearanceManager.setCloseButtonPosition(
      this.storyReaderOptions.closeButtonPosition || 'right'
    );
    NativeAppearanceManager.setScrollStyle(
      this.storyReaderOptions.scrollStyle || 'cover'
    );
    NativeAppearanceManager.setReaderCornerRadius(
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

  setCoverQuality(quality: CoverQuality): void {
    NativeAppearanceManager.setCoverQuality(quality);
  }

  setReaderCornerRadius(value: number): void {
    NativeAppearanceManager.setReaderCornerRadius(value);
  }

  setScrollStyle(value: string): void {
    NativeAppearanceManager.setScrollStyle(value);
  }

  setReaderBackgroundColor(value: string): void {
    NativeAppearanceManager.setReaderBackgroundColor(value);
  }

  setOverScrollToClose(value: boolean): void {
    NativeAppearanceManager.setOverScrollToClose(value);
  }

  setSwipeToClose(value: boolean): void {
    NativeAppearanceManager.setSwipeToClose(value);
  }

  setTimerGradientEnable(value: boolean): void {
    NativeAppearanceManager.setTimerGradientEnable(value);
  }

  setPresentationStyle(value: string): void {
    NativeAppearanceManager.setPresentationStyle(value);
  }

  setLikeImage(image: string, selected: string): void {
    NativeAppearanceManager.setLikeImage(image, selected);
  }

  setDislikeImage(image: string, selected: string): void {
    NativeAppearanceManager.setDislikeImage(image, selected);
  }

  setFavoriteImage(image: string, selected: string): void {
    NativeAppearanceManager.setFavoriteImage(image, selected);
  }

  setShareImage(image: string, selected: string): void {
    NativeAppearanceManager.setShareImage(image, selected);
  }

  setSoundImage(image: string, selected: string): void {
    NativeAppearanceManager.setSoundImage(image, selected);
  }

  setCloseReaderImage(image: string): void {
    NativeAppearanceManager.setCloseReaderImage(image);
  }

  setRefreshImage(image: string): void {
    NativeAppearanceManager.setRefreshImage(image);
  }

  setRefreshGoodsImage(image: string): void {
    NativeAppearanceManager.setRefreshGoodsImage(image);
  }

  setCloseGoodsImage(image: string): void {
    NativeAppearanceManager.setCloseGoodsImage(image);
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
