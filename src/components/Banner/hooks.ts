import { useCallback, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { BannerCommonProps } from './types';

export function useBannerViewProps(
  props: BannerCommonProps & { height?: number }
) {
  const { height, style, onPlaceLoaded } = props;
  const viewStyle = useMemo(
    () =>
      [
        height != null
          ? { height, width: '100%' as const }
          : { width: '100%' as const },
        style,
      ] as StyleProp<ViewStyle>,
    [height, style]
  );
  const handlePlaceLoaded = useCallback(
    (event: { nativeEvent: { size: number; widgetHeight: number } }) =>
      onPlaceLoaded?.(event.nativeEvent.size, event.nativeEvent.widgetHeight),
    [onPlaceLoaded]
  );

  return { viewStyle, handlePlaceLoaded };
}
