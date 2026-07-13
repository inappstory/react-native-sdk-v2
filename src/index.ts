//import ReactNativeSdk from './NativeReactNativeSdk';
import { AppearanceManager } from './AppearanceManager';
import { StoryManager } from './StoryManager';

// export function multiply(a: number, b: number): number {
//   return ReactNativeSdk.multiply(a, b);
// }

// export function plus(a: number, b: number): number {
//   return ReactNativeSdk.plus(a, b);
// }

export { StoryManager, AppearanceManager };

export type { StoriesListCardOptions } from './AppearanceManager';

export type { StoryManagerConfig } from './StoryManager';

export { CTASource } from './StoryManager';
export type {
  CTAGameReaderPayload,
  CTAStoryReaderPayload,
  CTAStoryListPayload,
} from './StoryManager';

export { StoriesList } from './stories/StoriesList';
export type { StoriesListRef, ListLoadStatus } from './stories/StoriesList';

export { BannerCarousel } from './banners/BannerCarousel';
export type { BannerCarouselProps } from './banners/BannerCarousel';
export type { BannerViewRef } from './banners/BannerViewComponent';

export {
  StoryReaderSwipeStyle,
  StoriesListCardTitlePosition,
  StoriesListCardViewVariant,
  StoryReaderCloseButtonPosition,
  StoriesListCardTitleTextAlign,
} from './AppearanceManager';

export { CoverQuality } from './data/Enum';

// export function initWith(
//   apiKey: string,
//   userId: string,
//   userIdSign: string,
//   sandbox: boolean,
//   sendStatistics: boolean
// ): void {
//   NativeStoryManager.initWith(
//     apiKey,
//     userId,
//     userIdSign,
//     sandbox,
//     sendStatistics
//   );
//}
