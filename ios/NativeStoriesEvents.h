#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeStoriesEvents : NativeStoriesEventsSpecBase <NativeStoriesEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeStoriesEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
