#import "NativeStoriesEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeStoriesEvents
RCT_EXPORT_MODULE()

- (void)notifyShowStory:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitShowStory:data];
#else
  [self sendEventWithName:@"showStory" body:data];
#endif
}

RCT_EXPORT_METHOD(setupStoriesEvents) {
  [[NativeStoriesEventsImpl shared]
      setupStoryEventsOnShowStory:^(NSDictionary *data) {
        [self notifyShowStory:data];
      }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeStoriesEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[ @"storiesLoaded", @"ugcStoriesLoaded", @"showStory", @"closeStory",
            @"showSlide", @"likeStory", @"dislikeStory", @"favoriteStory",
            @"clickOnShareStory", @"storyWidgetEvent" ];
}
#endif
@end
