import { forwardRef, useCallback, useState } from 'react';
import type { BannerCommonProps, BannerBaseRef } from '../Banner/types';
import {
  DEFAULT_BANNER_CORNER_RADIUS,
  DEFAULT_BANNER_INTER_ITEM_SPACING,
  DEFAULT_BANNER_SIDE_INSET,
} from '../Banner/types';
import { useBannerViewProps } from '../Banner/hooks';
import BannerGridNativeView from './BannerGridNativeView';

export type BannerGridProps = BannerCommonProps & {
  /** Horizontal space between grid columns (dp). Defaults to `interItemSpacing`. */
  columnSpacing?: number;
  /** Vertical space between grid rows (dp). Defaults to `interItemSpacing`. */
  rowSpacing?: number;
  /**
   * Fixed widget height (dp). When omitted, the widget adopts the height
   * reported by the native SDK after loading its banners.
   */
  height?: number;
};

export type BannerGridRef = BannerBaseRef;

export const BannerGrid = forwardRef<BannerGridRef, BannerGridProps>(
  (
    {
      placeId = 'default',
      columnSpacing,
      rowSpacing,
      sideInset = DEFAULT_BANNER_SIDE_INSET,
      leadingInset = DEFAULT_BANNER_SIDE_INSET,
      trailingInset = DEFAULT_BANNER_SIDE_INSET,
      interItemSpacing = DEFAULT_BANNER_INTER_ITEM_SPACING,
      cornerRadius = DEFAULT_BANNER_CORNER_RADIUS,
      height,
      style,
      onPlaceLoaded,
    },
    ref
  ) => {
    const [contentHeight, setContentHeight] = useState<number>();
    const resolvedHeight = height ?? contentHeight;
    const { viewStyle, handlePlaceLoaded } = useBannerViewProps({
      height: resolvedHeight,
      style,
      onPlaceLoaded,
    });
    const handleLoaded = useCallback(
      (event: { nativeEvent: { size: number; widgetHeight: number } }) => {
        if (height == null) {
          setContentHeight(event.nativeEvent.widgetHeight);
        }
        handlePlaceLoaded(event);
      },
      [handlePlaceLoaded, height]
    );

    return (
      <BannerGridNativeView
        ref={ref}
        placeId={placeId}
        columnSpacing={columnSpacing ?? interItemSpacing}
        rowSpacing={rowSpacing ?? interItemSpacing}
        sideInset={sideInset}
        leadingInset={leadingInset}
        trailingInset={trailingInset}
        interItemSpacing={interItemSpacing}
        cornerRadius={cornerRadius}
        style={viewStyle}
        onPlaceLoaded={handleLoaded}
      />
    );
  }
);

BannerGrid.displayName = 'BannerGrid';
