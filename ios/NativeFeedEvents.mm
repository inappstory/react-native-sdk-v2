#import "NativeFeedEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeFeedEvents
RCT_EXPORT_MODULE()

- (void)setupFeedEvents {
  [[NativeFeedEventsImpl shared]
      setupFeedEventsWithStoryReaderWillShow:^(NSDictionary *data) {
        [self emitStoryReaderWillShow:data];
  }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeFeedEventsSpecJSI>(params);
}
@end
