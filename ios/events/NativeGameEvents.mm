#import "NativeGameEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeGameEvents
RCT_EXPORT_MODULE()

- (void)notify:(NSDictionary *)data {
  NSString *name = data[@"withName"];
#ifdef RCT_NEW_ARCH_ENABLED
  if ([name isEqualToString:@"startGame"]) {
    [self emitStartGame:data];
  } else if ([name isEqualToString:@"closeGame"]) {
    [self emitCloseGame:data];
  } else if ([name isEqualToString:@"eventGame"]) {
    [self emitEventGame:data];
  } else if ([name isEqualToString:@"gameFailure"]) {
    [self emitGameFailure:data];
  } else if ([name isEqualToString:@"gameReaderWillShow"]) {
    [self emitGameReaderWillShow:data];
  } else if ([name isEqualToString:@"gameReaderDidClose"]) {
    [self emitGameReaderDidClose:data];
  } else if ([name isEqualToString:@"gameComplete"]) {
    [self emitGameComplete:data];
  }
#else
  [self sendEventWithName:name body:data];
#endif
}

RCT_EXPORT_METHOD(setupGameEvents) {
  [[NativeGameEventsImpl shared] setupGameEventsWithEmit:^(NSDictionary *data) {
    [self notify:data];
  }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeGameEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"startGame", @"closeGame", @"eventGame", @"gameFailure",
    @"gameReaderWillShow", @"gameReaderDidClose", @"gameComplete"
  ];
}
#endif

@end
