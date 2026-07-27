#import "NativeIamEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeIamEvents
RCT_EXPORT_MODULE()

- (void)notify:(NSDictionary *)data {
  NSString *name = data[@"withName"];
#ifdef RCT_NEW_ARCH_ENABLED
  if ([name isEqualToString:@"showInAppMessage"]) {
    [self emitShowInAppMessage:data];
  } else if ([name isEqualToString:@"closeInAppMessage"]) {
    [self emitCloseInAppMessage:data];
  } else if ([name isEqualToString:@"inAppMessageWidgetEvent"]) {
    [self emitInAppMessageWidgetEvent:data];
  }
#else
  [self sendEventWithName:name body:data];
#endif
}

RCT_EXPORT_METHOD(setupIamEvents) {
  [[NativeIamEventsImpl shared] setupIamEventsWithEmit:^(NSDictionary *data) {
    [self notify:data];
  }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeIamEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"showInAppMessage", @"closeInAppMessage", @"inAppMessageWidgetEvent"
  ];
}
#endif

@end
