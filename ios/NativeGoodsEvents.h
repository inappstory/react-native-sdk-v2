#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeGoodsEvents : NativeGoodsEventsSpecBase <NativeGoodsEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeGoodsEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
