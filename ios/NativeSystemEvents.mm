#import "NativeSystemEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeSystemEvents
RCT_EXPORT_MODULE()

- (void)notifyHandleCTA:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitHandleCTA:data];
#else
  [self sendEventWithName:@"handleCTA" body:data];
#endif
}

RCT_EXPORT_METHOD(setupSystemEvents) {
  [[NativeSystemEventsImpl shared]
      setupSystemEventsWithHandleCTA:^(NSDictionary *data) {
        [self notifyHandleCTA:data];
      }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeSystemEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[ @"handleCTA" ];
}
#endif

@end
