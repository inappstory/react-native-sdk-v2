#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeFeedEvents : NativeFeedEventsSpecBase <NativeFeedEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeFeedEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
