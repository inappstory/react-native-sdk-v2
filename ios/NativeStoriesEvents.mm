#import "NativeStoriesEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeStoriesEvents
RCT_EXPORT_MODULE()

- (void)setupStoriesEvents {
  [[NativeStoriesEventsImpl shared]
      setupStoryEventsOnShowStory:^(NSDictionary *data) {
        [self emitShowStory:data];
      }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeStoriesEventsSpecJSI>(params);
}

@end
