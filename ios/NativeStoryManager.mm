#import "NativeStoryManager.h"
#if __has_include("react_native_sdk-Swift.h")
#import "react_native_sdk-Swift.h"
#else
#import <react_native_sdk/react_native_sdk-Swift.h>
#endif

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
                 cacheSize:(NSString *_Nullable)cacheSize
                 anonymous:(BOOL)anonymous
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] initWith:apiKey
                                     userID:userId
                                 userIdSign:userIdSign
                                    sandbox:sandbox
                                  sendStats:sendStatistics
                                  cacheSize:cacheSize
                                  anonymous:anonymous
                                    resolve:resolve
                                   rejecter:reject];
}

RCT_EXPORT_METHOD(setOptions:(nonnull NSDictionary *)options) {
  [[NativeStoryManagerImpl shared] setOptions:options];
}

RCT_EXPORT_METHOD(showStoryOnce:(nonnull NSString *)storyID
                    operationId:(nonnull NSString *)operationId
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] showStoryOnce:storyID
                                     operationId:operationId
                                         resolve:resolve
                                        rejecter:reject];
}

RCT_EXPORT_METHOD(setTags:(nonnull NSArray *)tags) {
  [[NativeStoryManagerImpl shared] setTags:tags];
}

RCT_EXPORT_METHOD(addTags:(nonnull NSArray *)tags) {
  [[NativeStoryManagerImpl shared] addTags:tags];
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
  [[NativeStoryManagerImpl shared] selectStoryCellWith:storyID
                                              uniqueId:uniqueId];
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

RCT_EXPORT_METHOD(setVisibleWith:(nonnull NSArray *)storyIDs
                        uniqueId:(nonnull NSString *)uniqueId) {
  [[NativeStoryManagerImpl shared] setVisibleWith:storyIDs uniqueId:uniqueId];
}

RCT_EXPORT_METHOD(setImagesPlaceholders:(nonnull NSDictionary *)placeholders) {
  [[NativeStoryManagerImpl shared] setImagesPlaceholders:placeholders];
}

RCT_EXPORT_METHOD(showSingle:(nonnull NSString *)storyID
                 operationId:(nonnull NSString *)operationId
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] showSingle:storyID
                                  operationId:operationId
                                      resolve:resolve
                                     rejecter:reject];
}

RCT_EXPORT_METHOD(showGame:(nonnull NSString *)gameID
                   resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] showGame:gameID
                                    resolve:resolve
                                   rejecter:reject];
}

RCT_EXPORT_METHOD(showOnboardings:(nonnull NSString *)feed
                            limit:(double)limit
                             tags:(nullable NSArray *)tags
                      operationId:(nonnull NSString *)operationId
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] showOnboardings:feed
                                             limit:(NSInteger)limit
                                              tags:tags
                                       operationId:operationId
                                           resolve:resolve
                                          rejecter:reject];
}

RCT_EXPORT_METHOD(showIAMById:(nonnull NSString *)iamID
                onlyPreloaded:(BOOL)onlyPreloaded
                  operationId:(nonnull NSString *)operationId
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] showIAMById:iamID
                                 onlyPreloaded:onlyPreloaded
                                   operationId:operationId
                                       resolve:resolve
                                      rejecter:reject];
}

RCT_EXPORT_METHOD(showIAMByEvent:(nonnull NSString *)event
                   onlyPreloaded:(BOOL)onlyPreloaded
                     operationId:(nonnull NSString *)operationId
                         resolve:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] showIAMByEvent:event
                                    onlyPreloaded:onlyPreloaded
                                      operationId:operationId
                                          resolve:resolve
                                         rejecter:reject];
}

RCT_EXPORT_METHOD(preloadIAM:(NSArray *_Nullable)ids
                        tags:(NSArray *_Nullable)tags
                     resolve:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] preloadIAM:ids
                                         tags:tags
                                      resolve:resolve
                                     rejecter:reject];
}

RCT_EXPORT_METHOD(cancelOperation:(nonnull NSString *)operationId) {
  [[NativeStoryManagerImpl shared] cancelOperation:operationId];
}

RCT_EXPORT_METHOD(clearCache) {
  [[NativeStoryManagerImpl shared] clearCache];
}

RCT_EXPORT_METHOD(preloadGames) {
  [[NativeStoryManagerImpl shared] preloadGames];
}

RCT_EXPORT_METHOD(removeFromFavorite:(nonnull NSString *)storyID) {
  [[NativeStoryManagerImpl shared] removeFromFavorite:storyID];
}

RCT_EXPORT_METHOD(removeAllFavorites) {
  [[NativeStoryManagerImpl shared] removeAllFavorites];
}

RCT_EXPORT_METHOD(favoritesCount:(RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject) {
  [[NativeStoryManagerImpl shared] favoritesCount:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(logout) {
  [[NativeStoryManagerImpl shared] logout];
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