import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setHasLike(value: boolean): void;

  setHasFavorites(value: boolean): void;

  setHasShare(value: boolean): void;

  setCloseButtonPosition(value: string): void;

  setScrollStyle(value: string): void;

  setReaderCornerRadius(value: number): void;

  setCoverQuality(value: string): void;

  setReaderBackgroundColor(value: string): void;

  setOverScrollToClose(value: boolean): void;

  setSwipeToClose(value: boolean): void;

  setTimerGradientEnable(value: boolean): void;

  setPresentationStyle(value: string): void;

  setLikeImage(image: string, selected: string): void;

  setDislikeImage(image: string, selected: string): void;

  setFavoriteImage(image: string, selected: string): void;

  setShareImage(image: string, selected: string): void;

  setSoundImage(image: string, selected: string): void;

  setCloseReaderImage(image: string): void;

  setRefreshImage(image: string): void;

  setRefreshGoodsImage(image: string): void;

  setCloseGoodsImage(image: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeAppearanceManager'
);
