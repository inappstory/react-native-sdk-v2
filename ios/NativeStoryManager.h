#ifdef RCT_NEW_ARCH_ENABLED
#import <IASReactNativeSdkSpec/IASReactNativeSdkSpec.h>

@interface NativeStoryManager : NativeStoryManagerSpecBase <NativeStoryManagerSpec>
#else
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface NativeStoryManager : RCTEventEmitter <RCTBridgeModule>
#endif

@end
