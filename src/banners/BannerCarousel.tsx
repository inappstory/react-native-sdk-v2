import React, { forwardRef, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import BannerViewComponent, { type BannerViewRef } from './BannerViewComponent';

export type BannerCarouselProps = {
    placeId?: string;
    shouldLoop?: boolean;
    sideInset?: number;
    leadingInset?: number;
    trailingInset?: number;
    interItemSpacing?: number;
    cornerRadius?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
    onScroll?: (index: number) => void;
    onPlaceLoaded?: (size: number, widgetHeight: number) => void;
};

export const BannerCarousel = forwardRef<BannerViewRef, BannerCarouselProps>(
    (
        {
            placeId = 'default',
            shouldLoop = true,
            sideInset = 16,
            leadingInset = 16,
            trailingInset = 16,
            interItemSpacing = 8,
            cornerRadius = 24,
            height = 150,
            style,
            onScroll,
            onPlaceLoaded
        },
        ref
    ) => {
        const [widgetHeight, setWidgetHeight] = useState(height);

        return (
            <BannerViewComponent
                placeId={placeId}
                ref={ref}
                shouldLoop={shouldLoop}
                sideInset={sideInset}
                leadingInset={leadingInset}
                trailingInset={trailingInset}
                interItemSpacing={interItemSpacing}
                cornerRadius={cornerRadius}
                style={[{ height: widgetHeight, width: '100%' }, style]}
                onScroll={(e) => onScroll?.(e.nativeEvent.index)}
                onPlaceLoaded={(e) => {
                    if (e.nativeEvent.widgetHeight > 0) {
                        setWidgetHeight(e.nativeEvent.widgetHeight);
                    }
                    onPlaceLoaded?.(e.nativeEvent.size, e.nativeEvent.widgetHeight);
                }}
            />
        );
    }
);
