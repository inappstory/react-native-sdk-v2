#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeSystemEvents : NativeSystemEventsSpecBase <NativeSystemEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeSystemEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
