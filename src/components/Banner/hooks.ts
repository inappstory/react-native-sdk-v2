import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { BannerCommonProps } from './types';
import { useEventCallback } from '../../hooks/useEventCallback';

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
  const handlePlaceLoaded = useEventCallback(
    (event: { nativeEvent: { size: number; widgetHeight: number } }) =>
      onPlaceLoaded?.(event.nativeEvent.size, event.nativeEvent.widgetHeight)
  );

  return { viewStyle, handlePlaceLoaded };
}
