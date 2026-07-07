#import "NativeFeedEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeFeedEvents
RCT_EXPORT_MODULE()

- (void)notifyStoryReaderWillShow:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitStoryReaderWillShow:data];
#else
  [self sendEventWithName:@"storyReaderWillShow" body:data];
#endif
}

RCT_EXPORT_METHOD(setupFeedEvents) {
  [[NativeFeedEventsImpl shared]
      setupFeedEventsWithStoryReaderWillShow:^(NSDictionary *data) {
        [self notifyStoryReaderWillShow:data];
      }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeFeedEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"favoritesUpdate", @"favoriteCellDidSelect", @"editorCellDidSelect",
    @"storyReaderWillShow", @"storyReaderDidClose", @"storiesDidUpdated",
    @"scrollUpdate"
  ];
}
#endif

@end
