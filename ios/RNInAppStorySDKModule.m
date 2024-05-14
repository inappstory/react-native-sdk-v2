//
//  RNInAppStorySDKModule.m
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNInAppStorySDKModule, NSObject)
RCT_EXTERN_METHOD(initWith:(NSString *)apiKey userID:(NSString *)userID)
RCT_EXTERN_METHOD(showGame:(NSString *)gameID)

RCT_EXTERN_METHOD(showSingle:(NSString *)storyID)

RCT_EXTERN_METHOD(removeFromFavorite:(NSString *)gameID)
RCT_EXTERN_METHOD(removeAllFavorites)

RCT_EXTERN_METHOD(setTags:(NSArray<NSString *> *)tags)
RCT_EXTERN_METHOD(addTags:(NSArray<NSString *> *)tags)
RCT_EXTERN_METHOD(removeTags:(NSArray<NSString *> *)tags)

RCT_EXTERN_METHOD(setPlaceholders:(NSDictionary<NSString *, NSString *>))
RCT_EXTERN_METHOD(setImagesPlaceholders:(NSDictionary<NSString *, NSString *>))

RCT_EXTERN_METHOD(changeSound:(BOOL *)value)

RCT_EXTERN_METHOD(setHasLike:(BOOL *)value)
RCT_EXTERN_METHOD(setHasFavorites:(BOOL *)value)
RCT_EXTERN_METHOD(setHasShare:(BOOL *)value)

RCT_EXTERN_METHOD(setUserID:(NSString *)userID)

RCT_EXTERN_METHOD(getFavoritesCount:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getFrameworkInfo:((RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getBuildNumber:((RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getVersion:((RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setTimerGradientEnable:(NSString *)value)
RCT_EXTERN_METHOD(setSwipeToClose:(NSString *)value)
RCT_EXTERN_METHOD(setOverScrollToClose:(NSString *)value)
RCT_EXTERN_METHOD(setTimerGradient:(NSString *)value)
RCT_EXTERN_METHOD(setPlaceholderElementColor:(NSString *)value)
RCT_EXTERN_METHOD(setPlaceholderBackgroundColor:(NSString *)value)
RCT_EXTERN_METHOD(setReaderBackgroundColor:(NSString *)value)

RCT_EXTERN_METHOD(setReaderCornerRadius:(double *)radius)
RCT_EXTERN_METHOD(setCoverQuality:(NSString *)value)
RCT_EXTERN_METHOD(setShowCellTitle:(BOOL *)value)
RCT_EXTERN_METHOD(setCellGradientEnabled:(BOOL *)value)
RCT_EXTERN_METHOD(setCellGradientRadius:(double *)radius)
RCT_EXTERN_METHOD(setCellBorderColor:(NSString *)color)

RCT_EXTERN_METHOD(setGoodsCellImageBackgroundColor:(NSString *)color)
RCT_EXTERN_METHOD(setGoodsCellImageCornerRadius:(double *)color)
RCT_EXTERN_METHOD(setGoodsCellMainTextColor:(NSString *)color)
RCT_EXTERN_METHOD(setGoodsCellOldPriceTextColor:(NSString *)color)



RCT_EXTERN_METHOD(setPresentationStyle:(NSString *)presentationStyle)
RCT_EXTERN_METHOD(setScrollStyle:(NSString *)scrollStyle)
RCT_EXTERN_METHOD(setCloseButtonPosition:(NSString *)position)

RCT_EXTERN_METHOD(closeReader)
RCT_EXTERN_METHOD(clearCache)

RCT_EXTERN_METHOD(showOnboardings:(NSString *)gameID limit:(NSInteger)limit tags:(nullable NSArray<NSString *> *)tags)

RCT_EXTERN_METHOD(setLogging:(BOOL *)value)
RCT_EXTERN_METHOD(useDeviceID:(BOOL *)value)

@end
