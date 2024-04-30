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

RCT_EXTERN_METHOD(changeSound:(BOOL *)gameID)

RCT_EXTERN_METHOD(closeReader)
RCT_EXTERN_METHOD(clearCache)

//FIXME: RCT_EXTERN_METHOD(showOnboardings:(NSString *)gameID limit:(NSInteger)limit tags:(nullable NSArray<NSString *> *)tags)
@end
