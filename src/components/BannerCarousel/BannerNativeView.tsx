import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  codegenNativeCommands,
  requireNativeComponent,
  type HostComponent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { cacheNativeView, getCachedNativeView } from './nativeViewCache';

export type BannerNativeViewProps = {
  placeId: string;
  shouldLoop: boolean;
  sideInset: number;
  leadingInset: number;
  trailingInset: number;
  interItemSpacing: number;
  cornerRadius: number;
  style: StyleProp<ViewStyle>;
  onScroll: (e: NativeSyntheticEvent<{ index: number }>) => void;
  onPlaceLoaded: (
    e: NativeSyntheticEvent<{ size: number; widgetHeight: number }>
  ) => void;
};

export type BannerViewRef = {
  refresh: () => void;
  pause: () => void;
  resume: () => void;
  showNext: () => void;
  showPrevious: () => void;
  showBannerWith: (index: number) => void;
};

const cachedView = __DEV__ ? getCachedNativeView() : undefined;

const NativeBannerView: HostComponent<BannerNativeViewProps> =
  (cachedView as HostComponent<BannerNativeViewProps> | undefined) ??
  requireNativeComponent<BannerNativeViewProps>('BannerView');

if (__DEV__ && !cachedView) {
  cacheNativeView(NativeBannerView);
}

type NativeViewRef = React.ComponentRef<typeof NativeBannerView>;

// Commands are dispatched by name through the renderer, which works on both
// the legacy (Paper) and the New (Fabric) architecture. On Fabric the legacy
// view-manager interop matches the command name to the native method and
// prepends the reactTag for us.
interface NativeCommands {
  refresh: (viewRef: NativeViewRef) => void;
  pause: (viewRef: NativeViewRef) => void;
  resume: (viewRef: NativeViewRef) => void;
  showNext: (viewRef: NativeViewRef) => void;
  showPrevious: (viewRef: NativeViewRef) => void;
  showBannerWith: (viewRef: NativeViewRef, index: number) => void;
}

const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'pause',
    'resume',
    'showNext',
    'showPrevious',
    'showBannerWith',
    'refresh',
  ],
});

const BannerNativeViewComponent = forwardRef<
  BannerViewRef,
  BannerNativeViewProps
>((props, ref) => {
  const nativeRef = useRef<NativeViewRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => nativeRef.current && Commands.refresh(nativeRef.current),
      pause: () => nativeRef.current && Commands.pause(nativeRef.current),
      resume: () => nativeRef.current && Commands.resume(nativeRef.current),
      showNext: () => nativeRef.current && Commands.showNext(nativeRef.current),
      showPrevious: () =>
        nativeRef.current && Commands.showPrevious(nativeRef.current),
      showBannerWith: (index: number) =>
        nativeRef.current && Commands.showBannerWith(nativeRef.current, index),
    }),
    []
  );

  return <NativeBannerView ref={nativeRef} {...props} />;
});

BannerNativeViewComponent.displayName = 'BannerNativeView';

export default BannerNativeViewComponent;
