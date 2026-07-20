#import "NativeStoriesEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeStoriesEvents
RCT_EXPORT_MODULE()

- (void)notify:(NSDictionary *)data {
  NSString *name = data[@"withName"];
#ifdef RCT_NEW_ARCH_ENABLED
  if ([name isEqualToString:@"showStory"]) {
    [self emitShowStory:data];
  } else if ([name isEqualToString:@"closeStory"]) {
    [self emitCloseStory:data];
  } else if ([name isEqualToString:@"showSlide"]) {
    [self emitShowSlide:data];
  } else if ([name isEqualToString:@"likeStory"]) {
    [self emitLikeStory:data];
  } else if ([name isEqualToString:@"dislikeStory"]) {
    [self emitDislikeStory:data];
  } else if ([name isEqualToString:@"favoriteStory"]) {
    [self emitFavoriteStory:data];
  } else if ([name isEqualToString:@"clickOnShareStory"]) {
    [self emitClickOnShareStory:data];
  } else if ([name isEqualToString:@"clickOnButton"]) {
    [self emitClickOnButton:data];
  } else if ([name isEqualToString:@"storyWidgetEvent"]) {
    [self emitStoryWidgetEvent:data];
  }
#else
  [self sendEventWithName:name body:data];
#endif
}

RCT_EXPORT_METHOD(setupStoriesEvents) {
  [[NativeStoriesEventsImpl shared]
      setupStoryEventsWithEmit:^(NSDictionary *data) {
        [self notify:data];
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
            @"clickOnShareStory", @"clickOnButton", @"storyWidgetEvent" ];
}
#endif
@end
