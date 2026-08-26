import { forwardRef, useCallback, useMemo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import BannerNativeView, { type BannerViewRef } from './BannerNativeView';

export type BannerCarouselProps = {
  placeId?: string;
  shouldLoop?: boolean;
  sideInset?: number;
  leadingInset?: number;
  trailingInset?: number;
  interItemSpacing?: number;
  cornerRadius?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  onScroll?: (index: number) => void;
  onPlaceLoaded?: (size: number, widgetHeight: number) => void;
};

export const BannerCarousel = forwardRef<BannerViewRef, BannerCarouselProps>(
  (
    {
      placeId = 'default',
      shouldLoop = true,
      sideInset = 16,
      leadingInset = 16,
      trailingInset = 16,
      interItemSpacing = 8,
      cornerRadius = 16,
      height = 150,
      style,
      onScroll,
      onPlaceLoaded,
    },
    ref
  ) => {
    const viewStyle = useMemo(
      () => [{ height, width: '100%' as const }, style],
      [height, style]
    );

    const handleScroll = useCallback(
      (e: { nativeEvent: { index: number } }) =>
        onScroll?.(e.nativeEvent.index),
      [onScroll]
    );

    const handlePlaceLoaded = useCallback(
      (e: { nativeEvent: { size: number; widgetHeight: number } }) =>
        onPlaceLoaded?.(e.nativeEvent.size, e.nativeEvent.widgetHeight),
      [onPlaceLoaded]
    );

    return (
      <BannerNativeView
        ref={ref}
        placeId={placeId}
        shouldLoop={shouldLoop}
        sideInset={sideInset}
        leadingInset={leadingInset}
        trailingInset={trailingInset}
        interItemSpacing={interItemSpacing}
        cornerRadius={cornerRadius}
        style={viewStyle}
        onScroll={handleScroll}
        onPlaceLoaded={handlePlaceLoaded}
      />
    );
  }
);

BannerCarousel.displayName = 'BannerCarousel';
