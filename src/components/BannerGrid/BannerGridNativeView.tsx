import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  codegenNativeCommands,
  requireNativeComponent,
  type HostComponent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  cacheNativeView,
  getCachedNativeView,
} from '../BannerCarousel/nativeViewCache';
import type { BannerBaseRef } from '../Banner/types';

type Props = {
  placeId: string;
  columnSpacing: number;
  rowSpacing: number;
  sideInset: number;
  leadingInset: number;
  trailingInset: number;
  interItemSpacing: number;
  cornerRadius: number;
  style: StyleProp<ViewStyle>;
  onPlaceLoaded: (
    event: NativeSyntheticEvent<{ size: number; widgetHeight: number }>
  ) => void;
};

const COMPONENT_NAME = 'BannerGridView';
const cached = __DEV__ ? getCachedNativeView(COMPONENT_NAME) : undefined;
const NativeBannerGridView: HostComponent<Props> =
  (cached as HostComponent<Props> | undefined) ??
  requireNativeComponent<Props>(COMPONENT_NAME);

if (__DEV__ && !cached) cacheNativeView(NativeBannerGridView, COMPONENT_NAME);

type NativeRef = React.ComponentRef<typeof NativeBannerGridView>;
interface Commands {
  refresh: (viewRef: NativeRef) => void;
}

const Commands = codegenNativeCommands<Commands>({
  supportedCommands: ['refresh'],
});

const BannerGridNativeView = forwardRef<BannerBaseRef, Props>((props, ref) => {
  const nativeRef = useRef<NativeRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => nativeRef.current && Commands.refresh(nativeRef.current),
    }),
    []
  );

  return <NativeBannerGridView ref={nativeRef} {...props} />;
});

BannerGridNativeView.displayName = 'BannerGridNativeView';

export default BannerGridNativeView;
