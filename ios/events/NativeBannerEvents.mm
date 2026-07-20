#import "NativeBannerEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeBannerEvents
RCT_EXPORT_MODULE()

- (void)notifyBannerWidgetEvent:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitBannerWidgetEvent:data];
#else
  [self sendEventWithName:@"bannerWidgetEvent" body:data];
#endif
}

RCT_EXPORT_METHOD(setupBannerEvents) {
  [[NativeBannerEventsImpl shared]
      setupBannerEventsWithBannerWidgetEvent:^(NSDictionary *data) {
        [self notifyBannerWidgetEvent:data];
      }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeBannerEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[ @"bannerWidgetEvent" ];
}
#endif

@end
