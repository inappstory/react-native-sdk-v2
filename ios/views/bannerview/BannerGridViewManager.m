#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE (BannerGridViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(placeId, NSString)
RCT_EXPORT_VIEW_PROPERTY(columnSpacing, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(rowSpacing, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(sideInset, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(leadingInset, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(trailingInset, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(interItemSpacing, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(onPlaceLoaded, RCTDirectEventBlock)
RCT_EXTERN_METHOD(refresh:(nonnull NSNumber *)reactTag)
@end
