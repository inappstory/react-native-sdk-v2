#import "NativeStoryManager.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeStoryManager
RCT_EXPORT_MODULE()

- (void)notifyStoryListUpdate:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitOnStoryListUpdate:data];
#else
  [self sendEventWithName:@"onStoryListUpdate" body:data];
#endif
}

- (void)notifyStoryUpdate:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitOnStoryUpdate:data];
#else
  [self sendEventWithName:@"onStoryUpdate" body:data];
#endif
}

RCT_EXPORT_METHOD(initWith:(nonnull NSString *)apiKey
                    userId:(nonnull NSString *)userId
                userIdSign:(NSString *_Nullable)userIdSign
                   sandbox:(BOOL)sandbox
            sendStatistics:(BOOL)sendStatistics
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] initWith:apiKey
                                     userID:userId
                                 userIdSign:userIdSign
                                    sandbox:sandbox
                                  sendStats:sendStatistics
                                    resolve:resolve
                                   rejecter:reject];
}

RCT_EXPORT_METHOD(setTags:(nonnull NSArray *)tags) {
  [[NativeStoryManagerImpl shared] setTags:tags];
}

RCT_EXPORT_METHOD(changeSound:(BOOL)value) {
  [[NativeStoryManagerImpl shared] changeSound:value];
}

RCT_EXPORT_METHOD(getFavoriteStories:(nonnull NSString *)feed) {
  [[NativeStoryManagerImpl shared] getFavoriteStories:feed
      callback:^(NSDictionary *data) {
        [self notifyStoryListUpdate:data];
      }
      storyCallback:^(NSDictionary *storyData) {
        [self notifyStoryUpdate:storyData];
      }];
}

RCT_EXPORT_METHOD(createSubscriberList:(nonnull NSString *)feed
                              uniqueId:(nonnull NSString *)uniqueId) {
  [[NativeStoryManagerImpl shared] createSubscriberList:feed
      uniqueId:uniqueId
      callback:^(NSDictionary *data) {
        [self notifyStoryListUpdate:data];
      }
      storyCallback:^(NSDictionary *storyData) {
        [self notifyStoryUpdate:storyData];
      }];
}

RCT_EXPORT_METHOD(getStories:(nonnull NSString *)feed
                    uniqueId:(nonnull NSString *)uniqueId) {
  [[NativeStoryManagerImpl shared] getStories:feed
      uniqueId:uniqueId
      callback:^(NSDictionary *data) {
        [self notifyStoryListUpdate:data];
      }
      storyCallback:^(NSDictionary *storyData) {
        [self notifyStoryUpdate:storyData];
      }];
}

RCT_EXPORT_METHOD(preloadBannerPlace:(nonnull NSString *)placeId
                                tags:(NSArray *_Nullable)tags
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] preloadBannerPlace:placeId
                                                 tags:tags
                                             resolver:resolve
                                             rejecter:reject];
}

RCT_EXPORT_METHOD(onFavoriteCell) {
  [[NativeStoryManagerImpl shared] onFavoriteCell];
}

RCT_EXPORT_METHOD(removeTags:(nonnull NSArray *)tags) {
  [[NativeStoryManagerImpl shared] removeTags:tags];
}

RCT_EXPORT_METHOD(selectFavoriteStoryCellWith:(nonnull NSString *)storyID) {
  [[NativeStoryManagerImpl shared] selectFavoriteStoryCellWith:storyID];
}

RCT_EXPORT_METHOD(selectStoryCellWith:(nonnull NSString *)storyID
                                 feed:(nonnull NSString *)feed
                             uniqueId:(nonnull NSString *)uniqueId) {
  [[NativeStoryManagerImpl shared] selectStoryCellWith:storyID];
}

RCT_EXPORT_METHOD(setAppVersion:(nonnull NSString *)version build:(double)build) {
  [[NativeStoryManagerImpl shared] setAppVersion:version appBuild:(int)build];
}

RCT_EXPORT_METHOD(setLang:(nonnull NSString *)lang) {
  [[NativeStoryManagerImpl shared] setLang:lang];
}

RCT_EXPORT_METHOD(setPlaceholders:(nonnull NSDictionary *)placeholders) {
  [[NativeStoryManagerImpl shared] setPlaceholders:placeholders];
}

RCT_EXPORT_METHOD(setUserID:(nonnull NSString *)userId
                 userIdSign:(NSString *_Nullable)userIdSign) {
  [[NativeStoryManagerImpl shared] setUserID:userId userIdSign:userIdSign];
}

RCT_EXPORT_METHOD(setVisibleWith:(nonnull NSArray *)storyIDs) {
  [[NativeStoryManagerImpl shared] setVisibleWith:storyIDs];
}

RCT_EXPORT_METHOD(setImagesPlaceholders:(nonnull NSDictionary *)placeholders) {
  [[NativeStoryManagerImpl shared] setImagesPlaceholders:placeholders];
}




// RCT_EXTERN_METHOD(getCellRatio:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)

// RCT_EXTERN_METHOD(sliderEvent : (RCTPromiseResolveBlock)
//                       resolve rejecter : (RCTPromiseRejectBlock)reject)

// RCT_EXTERN_METHOD(showGame:(NSString *)gameID
// resolver:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)
// RCT_EXTERN_METHOD(showOnboardings:(NSString *)feed limit:(NSInteger)limit
// tags:(nullable NSArray<NSString *> *)tags
// resolver:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)
// RCT_EXTERN_METHOD(showSingle:(NSString *)storyID
// resolver:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)
// RCT_EXTERN_METHOD(showEditor:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)

// RCT_EXTERN_METHOD(removeFromFavorite:(NSString *)storyID)
// RCT_EXTERN_METHOD(removeAllFavorites)

// RCT_EXTERN_METHOD(setTags : (NSArray<NSString *> *)tags)
// RCT_EXTERN_METHOD(addTags:(NSArray<NSString *> *)tags)

// RCT_EXTERN_METHOD(getSound:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)

// RCT_EXTERN_METHOD(setHasLike:(BOOL *)value)
// RCT_EXTERN_METHOD(setHasFavorites:(BOOL *)value)
// RCT_EXTERN_METHOD(setHasShare:(BOOL *)value)

// RCT_EXTERN_METHOD(getFavoritesCount:(NSString *)userID
// resolver:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)

// RCT_EXTERN_METHOD(getFrameworkInfo:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)
// RCT_EXTERN_METHOD(getBuildNumber:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)
// RCT_EXTERN_METHOD(getVersion:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)

// RCT_EXTERN_METHOD(closeReader)
// RCT_EXTERN_METHOD(clearCache)

// RCT_EXTERN_METHOD(setCoverQuality:(NSString *)value)

// RCT_EXTERN_METHOD(addProductToCache:(NSString *)sku title:(NSString *)title
// subtitle:(NSString *)subtitle imageURL:(NSString *)imageURL price:(NSString
// *)price oldPrice:(NSString *)oldPrice)

// RCT_EXTERN_METHOD(setLogging:(BOOL *)value)
// RCT_EXTERN_METHOD(useDeviceID:(BOOL *)value)


#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeStoryManagerSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[ @"onStoryListUpdate", @"onStoryUpdate" ];
}
#endif

@end