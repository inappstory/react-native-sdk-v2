#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeAppearanceManager : NativeAppearanceManagerSpecBase <NativeAppearanceManagerSpec>
#else
#import <React/RCTBridgeModule.h>

@interface NativeAppearanceManager : NSObject <RCTBridgeModule>
#endif

@end
