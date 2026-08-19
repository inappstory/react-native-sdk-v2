#import "NativeSystemEvents.h"
#if __has_include("react_native_sdk-Swift.h")
#import "react_native_sdk-Swift.h"
#else
#import <react_native_sdk/react_native_sdk-Swift.h>
#endif

@implementation NativeSystemEvents
RCT_EXPORT_MODULE()

- (void)notifyOnLog:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitOnLog:data];
#else
  [self sendEventWithName:@"onLog" body:data];
#endif
}

- (void)notifyHandleCTA:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitHandleCTA:data];
#else
  [self sendEventWithName:@"handleCTA" body:data];
#endif
}

- (void)notifyFailure:(NSDictionary *)data {
  NSString *name = data[@"withName"];
#ifdef RCT_NEW_ARCH_ENABLED
  if ([name isEqualToString:@"sessionFailure"]) {
    [self emitSessionFailure:data];
  } else if ([name isEqualToString:@"storyFailure"]) {
    [self emitStoryFailure:data];
  } else if ([name isEqualToString:@"currentStoryFailure"]) {
    [self emitCurrentStoryFailure:data];
  } else if ([name isEqualToString:@"networkFailure"]) {
    [self emitNetworkFailure:data];
  } else if ([name isEqualToString:@"requestFailure"]) {
    [self emitRequestFailure:data];
  }
#else
  [self sendEventWithName:name body:data];
#endif
}

RCT_EXPORT_METHOD(setLoggingEnabled:(BOOL)enabled) {
  [[NativeSystemEventsImpl shared] setLoggingEnabled:enabled
                                               onLog:^(NSDictionary *data) {
                                                 [self notifyOnLog:data];
                                               }];
}

RCT_EXPORT_METHOD(setupSystemEvents) {
  [[NativeSystemEventsImpl shared]
      setupSystemEventsWithHandleCTA:^(NSDictionary *data) {
        [self notifyHandleCTA:data];
      }
      failure:^(NSDictionary *data) {
        [self notifyFailure:data];
      }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeSystemEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"onLog", @"handleCTA", @"sessionFailure", @"storyFailure",
    @"currentStoryFailure", @"networkFailure", @"requestFailure"
  ];
}
#endif

@end
