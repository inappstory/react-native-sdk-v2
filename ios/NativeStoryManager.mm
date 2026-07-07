#import "NativeStoryManager.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeStoryManager
RCT_EXPORT_MODULE()

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

- (void)initWith:(nonnull NSString *)apiKey
          userId:(nonnull NSString *)userId
      userIdSign:(NSString *_Nullable)userIdSign
         sandbox:(BOOL)sandbox
  sendStatistics:(BOOL)sendStatistics
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject {
  [[NativeStoryManagerImpl shared] initWith:apiKey
                                     userID:userId
                                 userIdSign:userIdSign
                                    sandbox:sandbox
                                  sendStats:sendStatistics
                                    resolve:resolve
                                   rejecter:reject];
}

- (void)setTags:(nonnull NSArray *)tags {
  [[NativeStoryManagerImpl shared] setTags:tags];
}

- (void)changeSound:(BOOL)value {
  [[NativeStoryManagerImpl shared] changeSound:value];
}

- (void)getFavoriteStories:(nonnull NSString *)feed {
  [[NativeStoryManagerImpl shared] getFavoriteStories:feed
      callback:^(NSDictionary *data) {
        [self emitOnStoryListUpdate:data];
      }
      storyCallback:^(NSDictionary *storyData) {
        [self emitOnStoryUpdate:storyData];
      }];
}

- (void)createSubscriberList:(nonnull NSString *)feed
                    uniqueId:(nonnull NSString *)uniqueId {
  [[NativeStoryManagerImpl shared] createSubscriberList:feed
      uniqueId:uniqueId
      callback:^(NSDictionary *data) {
        [self emitOnStoryListUpdate:data];
      }
      storyCallback:^(NSDictionary *storyData) {
        [self emitOnStoryUpdate:storyData];
      }];
}

- (void)getStories:(nonnull NSString *)feed uniqueId:(nonnull NSString *)uniqueId {
  [[NativeStoryManagerImpl shared] getStories:feed
      uniqueId:uniqueId
      callback:^(NSDictionary *data) {
        [self emitOnStoryListUpdate:data];
      }
      storyCallback:^(NSDictionary *storyData) {
        [self emitOnStoryUpdate:storyData];
      }];
}

- (void)onFavoriteCell {
  [[NativeStoryManagerImpl shared] onFavoriteCell];
}

- (void)removeTags:(nonnull NSArray *)tags {
  [[NativeStoryManagerImpl shared] removeTags:tags];
}

- (void)selectFavoriteStoryCellWith:(nonnull NSString *)storyID {
  [[NativeStoryManagerImpl shared] selectFavoriteStoryCellWith:storyID];
}

- (void)selectStoryCellWith:(nonnull NSString *)storyID feed:(nonnull NSString *)feed uniqueId:(nonnull NSString *)uniqueId {
  [[NativeStoryManagerImpl shared] selectStoryCellWith:storyID];
}

- (void)setAppVersion:(nonnull NSString *)version build:(double)build {
  [[NativeStoryManagerImpl shared] setAppVersion:version appBuild:(int)build];
}

- (void)setLang:(nonnull NSString *)lang {
  [[NativeStoryManagerImpl shared] setLang:lang];
}

- (void)setPlaceholders:(nonnull NSDictionary *)placeholders {
  [[NativeStoryManagerImpl shared] setPlaceholders:placeholders];
}

- (void)setUserID:(nonnull NSString *)userId
       userIdSign:(NSString *_Nullable)userIdSign {
  [[NativeStoryManagerImpl shared] setUserID:userId userIdSign:userIdSign];
}

- (void)setVisibleWith:(nonnull NSArray *)storyIDs {
  [[NativeStoryManagerImpl shared] setVisibleWith:storyIDs];
}

- (void)setImagesPlaceholders:(nonnull NSDictionary *)placeholders {
  [[NativeStoryManagerImpl shared] setImagesPlaceholders:placeholders];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeStoryManagerSpecJSI>(params);
}

@end
