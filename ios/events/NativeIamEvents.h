#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeIamEvents : NativeIamEventsSpecBase <NativeIamEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeIamEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
