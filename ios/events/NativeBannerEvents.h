#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeBannerEvents : NativeBannerEventsSpecBase <NativeBannerEventsSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeBannerEvents : RCTEventEmitter <RCTBridgeModule>
#endif

@end
