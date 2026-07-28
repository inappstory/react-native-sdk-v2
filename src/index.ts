import { AppearanceManager } from './core/AppearanceManager';
import { StoryManager } from './core/StoryManager';

export { StoryManager, AppearanceManager };

export type { StoriesListCardOptions } from './core/AppearanceManager';

export type {
  StoryManagerConfig,
  ProductCartOffer,
  ProductCart,
  ProductCartHandlers,
} from './core/StoryManager';

export { CTASource } from './core/StoryManager';
export type {
  CTAGameReaderPayload,
  CTAStoryReaderPayload,
  CTAStoryListPayload,
} from './core/StoryManager';

export { StoriesList } from './components/StoriesList/StoriesList';
export type {
  StoriesListRef,
  ListLoadStatus,
} from './components/StoriesList/StoriesList';

export { BannerCarousel } from './components/BannerCarousel/BannerCarousel';
export type { BannerCarouselProps } from './components/BannerCarousel/BannerCarousel';
export type { BannerViewRef } from './components/BannerCarousel/BannerNativeView';

export {
  StoryReaderSwipeStyle,
  StoryReaderPresentationStyle,
  StoriesListCardTitlePosition,
  StoriesListCardViewVariant,
  StoryReaderCloseButtonPosition,
  StoriesListCardTitleTextAlign,
} from './core/AppearanceManager';

export { CoverQuality } from './types/CoverQuality';
