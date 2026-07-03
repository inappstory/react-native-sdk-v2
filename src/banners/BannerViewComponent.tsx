import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  type HostComponent,
  requireNativeComponent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

import { cacheNativeView, getCachedNativeView } from '../GlobalsWrapper';

let NativeBannerView: HostComponent<BannerNativeViewProps>;
const globalView = getCachedNativeView();

if (__DEV__ && !globalView) {
  NativeBannerView =
    requireNativeComponent<BannerNativeViewProps>('BannerView');
  cacheNativeView(NativeBannerView);
} else if (__DEV__ && globalView) {
  NativeBannerView = globalView as HostComponent<BannerNativeViewProps>;
} else {
  NativeBannerView =
    requireNativeComponent<BannerNativeViewProps>('BannerView');
}

type BannerNativeViewProps = {
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

type BannerViewProps = BannerNativeViewProps;

type NativeViewRef = React.ComponentRef<typeof NativeBannerView>;

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

const BannerViewComponent = forwardRef<BannerViewRef, BannerViewProps>(
  (props, ref) => {
    const nativeRef = useRef<NativeViewRef>(null);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        if (nativeRef.current) {
          Commands.refresh(nativeRef.current);
        }
      },
      pause: () => {
        if (nativeRef.current) {
          Commands.pause(nativeRef.current);
        }
      },
      resume: () => {
        if (nativeRef.current) {
          Commands.resume(nativeRef.current);
        }
      },
      showNext: () => {
        if (nativeRef.current) {
          Commands.showNext(nativeRef.current);
        }
      },
      showPrevious: () => {
        if (nativeRef.current) {
          Commands.showPrevious(nativeRef.current);
        }
      },
      showBannerWith: (index: number) => {
        if (nativeRef.current) {
          Commands.showBannerWith(nativeRef.current, index);
        }
      },
    }));

    return <NativeBannerView ref={nativeRef} {...props} />;
  }
);

export default BannerViewComponent;
