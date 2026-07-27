#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeGameEvents : NativeGameEventsSpecBase <NativeGameEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeGameEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
