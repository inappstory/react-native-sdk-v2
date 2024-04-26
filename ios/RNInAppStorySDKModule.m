//
//  RNInAppStorySDKModule.m
//  RNInAppStorySDKModule
//
//  Copyright © 2024 Michail Strokin. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNInAppStorySDKModule, NSObject)
RCT_EXTERN_METHOD(initWith:(NSString *)apiKey)
RCT_EXTERN_METHOD(showGame:(NSString *)gameID)
RCT_EXTERN_METHOD(changeSound:(BOOL *)gameID)
RCT_EXTERN_METHOD(showOnboardings:(NSString *)gameID limit:(NSInteger)limit tags:(nullable NSArray<NSString *> *)tags)
@end
