import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
    type HostComponent,
    requireNativeComponent,
    type NativeSyntheticEvent,
    UIManager,
    findNodeHandle,
} from 'react-native';

import { cacheNativeView, getCachedNativeView } from './GlobalsWrapper';

let NativeBannerView: HostComponent<BannerNativeViewProps>;
const globalView = getCachedNativeView();

if (__DEV__ && !globalView) {
    NativeBannerView = requireNativeComponent<BannerNativeViewProps>('BannerView');
    cacheNativeView(NativeBannerView);
} else if (__DEV__ && globalView) {
    NativeBannerView = globalView as HostComponent<BannerNativeViewProps>;
} else {
    NativeBannerView = requireNativeComponent<BannerNativeViewProps>('BannerView');
}

type BannerNativeViewProps = {
    placeId: string;
    shouldLoop: boolean;
    sideInset: number;
    leadingInset: number;
    trailingInset: number;
    interItemSpacing: number;
    cornerRadius: number;
    style: object;
    onScroll: (e: NativeSyntheticEvent<{ index: number }>) => void;
    onPlaceLoaded: (e: NativeSyntheticEvent<{ size: number; widgetHeight: number }>) => void;
    onActionWith: (e: NativeSyntheticEvent<{ url: string }>) => void;
};

export type BannerViewRef = {
    pause: () => void;
    resume: () => void;
    showNext: () => void;
    showPrevious: () => void;
    showBannerWith: (index: number) => void;
};

export type BannerViewProps = BannerNativeViewProps;

const dispatchCommand = (ref: React.RefObject<any>, command: string, args: any[] = []) => {
    const tag = findNodeHandle(ref.current);
    if (tag == null) return;
    const commands = UIManager.getViewManagerConfig('BannerView').Commands;
    const commandId = commands[command];
    if (commandId == null) return;
    UIManager.dispatchViewManagerCommand(tag, commandId as string | number, args);
};

const BannerViewComponent = forwardRef<BannerViewRef, BannerViewProps>(
    (props, ref) => {
        const nativeRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            pause: () => dispatchCommand(nativeRef, 'pause'),
            resume: () => dispatchCommand(nativeRef, 'resume'),
            showNext: () => dispatchCommand(nativeRef, 'showNext'),
            showPrevious: () => dispatchCommand(nativeRef, 'showPrevious'),
            showBannerWith: (index: number) => dispatchCommand(nativeRef, 'showBannerWith', [index]),
        }));

        return <NativeBannerView ref={nativeRef} {...props} />;
    }
);

export default BannerViewComponent;
