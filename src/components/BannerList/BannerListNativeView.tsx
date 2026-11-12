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
import type { BannerListRef } from './BannerList';

type Props = {
  placeId: string;
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

const COMPONENT_NAME = 'BannerListView';
const cached = __DEV__ ? getCachedNativeView(COMPONENT_NAME) : undefined;
const NativeBannerListView: HostComponent<Props> =
  (cached as HostComponent<Props> | undefined) ??
  requireNativeComponent<Props>(COMPONENT_NAME);

if (__DEV__ && !cached) cacheNativeView(NativeBannerListView, COMPONENT_NAME);

type NativeRef = React.ComponentRef<typeof NativeBannerListView>;
interface Commands {
  refresh: (viewRef: NativeRef) => void;
  pause: (viewRef: NativeRef) => void;
  resume: (viewRef: NativeRef) => void;
}

const Commands = codegenNativeCommands<Commands>({
  supportedCommands: ['refresh', 'pause', 'resume'],
});

const BannerListNativeView = forwardRef<BannerListRef, Props>((props, ref) => {
  const nativeRef = useRef<NativeRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => nativeRef.current && Commands.refresh(nativeRef.current),
      pause: () => nativeRef.current && Commands.pause(nativeRef.current),
      resume: () => nativeRef.current && Commands.resume(nativeRef.current),
    }),
    []
  );

  return <NativeBannerListView ref={nativeRef} {...props} />;
});

BannerListNativeView.displayName = 'BannerListNativeView';

export default BannerListNativeView;
