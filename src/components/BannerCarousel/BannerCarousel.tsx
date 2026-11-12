import { forwardRef } from 'react';

import BannerNativeView, { type BannerViewRef } from './BannerNativeView';
import {
  DEFAULT_BANNER_CORNER_RADIUS,
  DEFAULT_BANNER_INTER_ITEM_SPACING,
  DEFAULT_BANNER_SIDE_INSET,
  type BannerCommonProps,
} from '../Banner/types';
import { useBannerViewProps } from '../Banner/hooks';
import { useEventCallback } from '../../hooks/useEventCallback';

export type BannerCarouselProps = BannerCommonProps & {
  shouldLoop?: boolean;
  height?: number;
  onScroll?: (index: number) => void;
};

export const BannerCarousel = forwardRef<BannerViewRef, BannerCarouselProps>(
  (
    {
      placeId = 'default',
      shouldLoop = true,
      sideInset = DEFAULT_BANNER_SIDE_INSET,
      leadingInset,
      trailingInset,
      interItemSpacing = DEFAULT_BANNER_INTER_ITEM_SPACING,
      cornerRadius = DEFAULT_BANNER_CORNER_RADIUS,
      height = 150,
      style,
      onScroll,
      onPlaceLoaded,
    },
    ref
  ) => {
    const { viewStyle, handlePlaceLoaded } = useBannerViewProps({
      height,
      style,
      onPlaceLoaded,
    });
    const handleScroll = useEventCallback(
      (e: { nativeEvent: { index: number } }) => onScroll?.(e.nativeEvent.index)
    );

    return (
      <BannerNativeView
        ref={ref}
        placeId={placeId}
        shouldLoop={shouldLoop}
        sideInset={sideInset}
        leadingInset={leadingInset ?? sideInset}
        trailingInset={trailingInset ?? sideInset}
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
