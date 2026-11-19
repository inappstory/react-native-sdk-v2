import type { StyleProp, ViewStyle } from 'react-native';

export type BannerCommonProps = {
  placeId?: string;
  cornerRadius?: number;
  interItemSpacing?: number;
  sideInset?: number;
  leadingInset?: number;
  trailingInset?: number;
  style?: StyleProp<ViewStyle>;
  onPlaceLoaded?: (size: number, widgetHeight: number) => void;
};

export type BannerBaseRef = {
  refresh: () => void;
};

export const DEFAULT_BANNER_CORNER_RADIUS = 16;
export const DEFAULT_BANNER_INTER_ITEM_SPACING = 8;
export const DEFAULT_BANNER_SIDE_INSET = 16;
