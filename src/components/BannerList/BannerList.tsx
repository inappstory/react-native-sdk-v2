import { forwardRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { BannerBaseRef, BannerCommonProps } from '../Banner/types';
import {
  DEFAULT_BANNER_CORNER_RADIUS,
  DEFAULT_BANNER_INTER_ITEM_SPACING,
  DEFAULT_BANNER_SIDE_INSET,
} from '../Banner/types';
import { useBannerViewProps } from '../Banner/hooks';
import BannerListNativeView from './BannerListNativeView';

export type BannerListProps = BannerCommonProps & {
  /** Viewport height (dp). Otherwise uses style.height or fills the parent. */
  height?: number;
};

export type BannerListRef = BannerBaseRef & {
  pause: () => void;
  resume: () => void;
};

export const BannerList = forwardRef<BannerListRef, BannerListProps>(
  (
    {
      placeId = 'default',
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
    const fillsParent =
      height == null && StyleSheet.flatten(style)?.height == null;
    const listStyle = useMemo(
      () => [fillsParent && styles.fill, style],
      [fillsParent, style]
    );
    const { viewStyle, handlePlaceLoaded } = useBannerViewProps({
      height,
      style: listStyle,
      onPlaceLoaded,
    });

    return (
      <BannerListNativeView
        ref={ref}
        placeId={placeId}
        sideInset={sideInset}
        leadingInset={leadingInset ?? sideInset}
        trailingInset={trailingInset ?? sideInset}
        interItemSpacing={interItemSpacing}
        cornerRadius={cornerRadius}
        style={viewStyle}
        onPlaceLoaded={handlePlaceLoaded}
      />
    );
  }
);

BannerList.displayName = 'BannerList';

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
