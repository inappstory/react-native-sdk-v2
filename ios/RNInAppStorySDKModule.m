//
//  RNInAppStorySDKModule.m
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNInAppStorySDKModule, RCTEventEmitter)

RCT_EXTERN_METHOD(initWith:(NSString *)apiKey userID:(NSString *)userID sandbox:(BOOL *)sandbox sendStats:(BOOL *)sendStats)

RCT_EXTERN_METHOD(getStories:(NSString *)feed)
RCT_EXTERN_METHOD(getFavoriteStories:(NSString *)feed)
RCT_EXTERN_METHOD(getCellRatio:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(sliderEvent:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showGame:(NSString *)gameID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showOnboardings:(NSString *)feed limit:(NSInteger)limit tags:(nullable NSArray<NSString *> *)tags resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showSingle:(NSString *)storyID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showEditor:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(removeFromFavorite:(NSString *)storyID)
RCT_EXTERN_METHOD(removeAllFavorites)


RCT_EXTERN_METHOD(selectFavoriteStoryCellWith:(NSString *)storyID)


RCT_EXTERN_METHOD(selectStoryCellWith:(NSString *)storyID)
RCT_EXTERN_METHOD(setVisibleWith:(NSArray<NSString *> *)storyIDs)

RCT_EXTERN_METHOD(setTags:(NSArray<NSString *> *)tags)
RCT_EXTERN_METHOD(addTags:(NSArray<NSString *> *)tags)
RCT_EXTERN_METHOD(removeTags:(NSArray<NSString *> *)tags)

RCT_EXTERN_METHOD(setPlaceholders:(NSDictionary *))
RCT_EXTERN_METHOD(setImagesPlaceholders:(NSDictionary *))

RCT_EXTERN_METHOD(changeSound:(BOOL *)value)
RCT_EXTERN_METHOD(getSound:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setHasLike:(BOOL *)value)
RCT_EXTERN_METHOD(setHasFavorites:(BOOL *)value)
RCT_EXTERN_METHOD(setHasShare:(BOOL *)value)

RCT_EXTERN_METHOD(setUserID:(NSString *)userID)
RCT_EXTERN_METHOD(setLang:(NSString *)lang)


RCT_EXTERN_METHOD(getFavoritesCount:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getFrameworkInfo:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getBuildNumber:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getVersion:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setTimerGradientEnable:(NSString *)value)
RCT_EXTERN_METHOD(setSwipeToClose:(NSString *)value)
RCT_EXTERN_METHOD(setOverScrollToClose:(BOOL *)value)
RCT_EXTERN_METHOD(setTimerGradient:(NSString *)value)
RCT_EXTERN_METHOD(setReaderBackgroundColor:(NSString *)value)
RCT_EXTERN_METHOD(setReaderCornerRadius:(double *)radius)

RCT_EXTERN_METHOD(setPlaceholderElementColor:(NSString *)value)
RCT_EXTERN_METHOD(setPlaceholderBackgroundColor:(NSString *)value)


RCT_EXTERN_METHOD(setPresentationStyle:(NSString *)presentationStyle)
RCT_EXTERN_METHOD(setScrollStyle:(NSString *)scrollStyle)
RCT_EXTERN_METHOD(setCloseButtonPosition:(NSString *)position)

RCT_EXTERN_METHOD(closeReader)
RCT_EXTERN_METHOD(clearCache)


RCT_EXTERN_METHOD(setCoverQuality:(NSString *)value)

RCT_EXTERN_METHOD(setShowCellTitle:(BOOL *)value)
RCT_EXTERN_METHOD(setCellGradientEnabled:(BOOL *)value)
RCT_EXTERN_METHOD(setCellGradientRadius:(double *)radius)
RCT_EXTERN_METHOD(setCellBorderColor:(NSString *)color)

RCT_EXTERN_METHOD(setGoodsCellImageBackgroundColor:(NSString *)color)
RCT_EXTERN_METHOD(setGoodsCellImageCornerRadius:(double *)color)
RCT_EXTERN_METHOD(setGoodsCellMainTextColor:(NSString *)color)
RCT_EXTERN_METHOD(setGoodsCellOldPriceTextColor:(NSString *)color)

RCT_EXTERN_METHOD(setLikeImage:(NSString *)color)
RCT_EXTERN_METHOD(setLikeSelectedImage:(NSString *)color)
RCT_EXTERN_METHOD(setDislikeImage:(NSString *)color)
RCT_EXTERN_METHOD(setDislikeSelectedImage:(NSString *)color)
RCT_EXTERN_METHOD(setFavoriteImage:(NSString *)color)
RCT_EXTERN_METHOD(setFavoriteSelectedImag:(NSString *)color)
RCT_EXTERN_METHOD(setShareImage:(NSString *)color)
RCT_EXTERN_METHOD(setShareSelectedImage:(NSString *)color)
RCT_EXTERN_METHOD(setsoundmage:(NSString *)color)
RCT_EXTERN_METHOD(setSoundSelectedImage:(NSString *)color)
RCT_EXTERN_METHOD(setCloseReaderImage:(NSString *)color)
RCT_EXTERN_METHOD(setRefreshImage:(NSString *)color)
RCT_EXTERN_METHOD(setRefreshGoodsImage:(NSString *)color)
RCT_EXTERN_METHOD(setGoodsCloseImage:(NSString *)color)



RCT_EXTERN_METHOD(setLogging:(BOOL *)value)
RCT_EXTERN_METHOD(useDeviceID:(BOOL *)value)

@end