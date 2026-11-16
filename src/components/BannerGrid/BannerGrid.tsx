import { forwardRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import type { BannerCommonProps, BannerBaseRef } from '../Banner/types';
import {
  DEFAULT_BANNER_CORNER_RADIUS,
  DEFAULT_BANNER_INTER_ITEM_SPACING,
  DEFAULT_BANNER_SIDE_INSET,
} from '../Banner/types';
import { useBannerViewProps } from '../Banner/hooks';
import BannerGridNativeView from './BannerGridNativeView';
import { useEventCallback } from '../../hooks/useEventCallback';

export type BannerGridProps = BannerCommonProps & {
  /** Number of grid columns. Must be a positive 32-bit integer. Defaults to 2. */
  columnCount?: number;
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
      columnCount = 2,
      columnSpacing,
      rowSpacing,
      sideInset = DEFAULT_BANNER_SIDE_INSET,
      leadingInset,
      trailingInset,
      interItemSpacing = DEFAULT_BANNER_INTER_ITEM_SPACING,
      cornerRadius = DEFAULT_BANNER_CORNER_RADIUS,
      height,
      style,
      onPlaceLoaded,
    },
    ref
  ) => {
    if (
      !Number.isInteger(columnCount) ||
      columnCount < 1 ||
      columnCount > 2147483647
    ) {
      throw new RangeError(
        'BannerGrid columnCount must be a positive 32-bit integer'
      );
    }
    const [loadedHeight, setLoadedHeight] = useState<{
      placeId: string;
      height: number;
    }>();
    const hasExplicitHeight =
      height != null || StyleSheet.flatten(style)?.height != null;
    const contentHeight =
      loadedHeight?.placeId === placeId ? loadedHeight.height : undefined;
    const resolvedHeight =
      height ?? (hasExplicitHeight ? undefined : contentHeight);
    const { viewStyle, handlePlaceLoaded } = useBannerViewProps({
      height: resolvedHeight,
      style,
      onPlaceLoaded,
    });
    const handleLoaded = useEventCallback(
      (event: { nativeEvent: { size: number; widgetHeight: number } }) => {
        if (!hasExplicitHeight) {
          setLoadedHeight({
            placeId,
            height: event.nativeEvent.widgetHeight,
          });
        }
        handlePlaceLoaded(event);
      }
    );

    return (
      <BannerGridNativeView
        ref={ref}
        placeId={placeId}
        columnCount={columnCount}
        columnSpacing={columnSpacing ?? interItemSpacing}
        rowSpacing={rowSpacing ?? interItemSpacing}
        sideInset={sideInset}
        leadingInset={leadingInset ?? sideInset}
        trailingInset={trailingInset ?? sideInset}
        interItemSpacing={interItemSpacing}
        cornerRadius={cornerRadius}
        style={viewStyle}
        onPlaceLoaded={handleLoaded}
      />
    );
  }
);

BannerGrid.displayName = 'BannerGrid';
