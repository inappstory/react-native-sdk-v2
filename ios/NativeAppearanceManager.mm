#import "NativeAppearanceManager.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeAppearanceManager
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(setCloseButtonPosition:(nonnull NSString *)value) {
  [[NativeAppearanceManagerImpl shared] setCloseButtonPosition:value];
}

RCT_EXPORT_METHOD(setHasFavorites:(BOOL)value) {
  [[NativeAppearanceManagerImpl shared] setHasFavorites:value];
}

RCT_EXPORT_METHOD(setHasLike:(BOOL)value) {
  [[NativeAppearanceManagerImpl shared] setHasLike:value];
}

RCT_EXPORT_METHOD(setHasShare:(BOOL)value) {
  [[NativeAppearanceManagerImpl shared] setHasShare:value];
}

RCT_EXPORT_METHOD(setReaderCornerRadius:(double)value) {
  [[NativeAppearanceManagerImpl shared] setReaderCornerRadius:value];
}

RCT_EXPORT_METHOD(setScrollStyle:(nonnull NSString *)value) {
  [[NativeAppearanceManagerImpl shared] setScrollStyle:value];
}

RCT_EXPORT_METHOD(setCoverQuality:(nonnull NSString *)value) {
  [[NativeAppearanceManagerImpl shared] setCoverQuality:value];
}

RCT_EXPORT_METHOD(setReaderBackgroundColor:(nonnull NSString *)value) {
  [[NativeAppearanceManagerImpl shared] setReaderBackgroundColor:value];
}

RCT_EXPORT_METHOD(setOverScrollToClose:(BOOL)value) {
  [[NativeAppearanceManagerImpl shared] setOverScrollToClose:value];
}

RCT_EXPORT_METHOD(setSwipeToClose:(BOOL)value) {
  [[NativeAppearanceManagerImpl shared] setSwipeToClose:value];
}

RCT_EXPORT_METHOD(setTimerGradientEnable:(BOOL)value) {
  [[NativeAppearanceManagerImpl shared] setTimerGradientEnable:value];
}

RCT_EXPORT_METHOD(setPresentationStyle:(nonnull NSString *)value) {
  [[NativeAppearanceManagerImpl shared] setPresentationStyle:value];
}

RCT_EXPORT_METHOD(setLikeImage:(NSString *)image selected:(NSString *)selectedImage) {
  [[NativeAppearanceManagerImpl shared] setLikeImage:image
                                            selected:selectedImage];
}

RCT_EXPORT_METHOD(setDislikeImage:(NSString *)image selected:(NSString *)selectedImage) {
  [[NativeAppearanceManagerImpl shared] setDislikeImage:image
                                               selected:selectedImage];
}

RCT_EXPORT_METHOD(setFavoriteImage:(NSString *)image selected:(NSString *)selectedImage) {
  [[NativeAppearanceManagerImpl shared] setFavoriteImage:image
                                                selected:selectedImage];
}

RCT_EXPORT_METHOD(setShareImage:(NSString *)image selected:(NSString *)selectedImage) {
  [[NativeAppearanceManagerImpl shared] setShareImage:image
                                             selected:selectedImage];
}

RCT_EXPORT_METHOD(setSoundImage:(NSString *)image selected:(NSString *)selectedImage) {
  [[NativeAppearanceManagerImpl shared] setSoundImage:image
                                             selected:selectedImage];
}

RCT_EXPORT_METHOD(setCloseReaderImage:(NSString *)image) {
  [[NativeAppearanceManagerImpl shared] setCloseReaderImage:image];
}

RCT_EXPORT_METHOD(setRefreshImage:(NSString *)image) {
  [[NativeAppearanceManagerImpl shared] setRefreshImage:image];
}

RCT_EXPORT_METHOD(setRefreshGoodsImage:(NSString *)image) {
  [[NativeAppearanceManagerImpl shared] setRefreshGoodsImage:image];
}

RCT_EXPORT_METHOD(setCloseGoodsImage:(NSString *)image) {
  [[NativeAppearanceManagerImpl shared] setRefreshGoodsImage:image];
}




// RCT_EXTERN_METHOD(getCellRatio:(RCTPromiseResolveBlock)resolve
// rejecter:(RCTPromiseRejectBlock)reject)
//  RCT_EXTERN_METHOD(setHasLike:(BOOL *)value)
//  RCT_EXTERN_METHOD(setHasFavorites:(BOOL *)value)
//  RCT_EXTERN_METHOD(setHasShare:(BOOL *)value)

// RCT_EXTERN_METHOD(setTimerGradientEnable:(NSString *)value)
// RCT_EXTERN_METHOD(setSwipeToClose:(NSString *)value)
// RCT_EXTERN_METHOD(setOverScrollToClose:(BOOL *)value)
// RCT_EXTERN_METHOD(setTimerGradient:(NSString *)value)
// RCT_EXTERN_METHOD(setReaderBackgroundColor:(NSString *)value)
// RCT_EXTERN_METHOD(setReaderCornerRadius:(double *)radius)

// RCT_EXTERN_METHOD(setPlaceholderElementColor:(NSString *)value)
// RCT_EXTERN_METHOD(setPlaceholderBackgroundColor:(NSString *)value)

// RCT_EXTERN_METHOD(setPresentationStyle:(NSString *)presentationStyle)
// RCT_EXTERN_METHOD(setScrollStyle:(NSString *)scrollStyle)
// RCT_EXTERN_METHOD(setCloseButtonPosition:(NSString *)position)

// RCT_EXTERN_METHOD(setShowCellTitle:(BOOL *)value)
// RCT_EXTERN_METHOD(setCellGradientEnabled:(BOOL *)value)
// RCT_EXTERN_METHOD(setCellGradientRadius:(double *)radius)
// RCT_EXTERN_METHOD(setCellBorderColor:(NSString *)color)

// RCT_EXTERN_METHOD(setGoodsCellImageBackgroundColor:(NSString *)color)
// RCT_EXTERN_METHOD(setGoodsCellImageCornerRadius:(double *)color)
// RCT_EXTERN_METHOD(setGoodsCellMainTextColor:(NSString *)color)
// RCT_EXTERN_METHOD(setGoodsCellOldPriceTextColor:(NSString *)color)

// RCT_EXTERN_METHOD(setLikeImage:(NSString *)image selected:(NSString
// *)selectedImage) RCT_EXTERN_METHOD(setDislikeImage:(NSString *)image
// selected:(NSString *)selectedImage)
// RCT_EXTERN_METHOD(setFavoriteImage:(NSString *)image
// selected:(NSString*)selectedImage) RCT_EXTERN_METHOD(setShareImage:(NSString
// *)image selected:(NSString *)selectedImage)
// RCT_EXTERN_METHOD(setSoundImage:(NSString
// *)image selected:(NSString *)selectedImage)
// RCT_EXTERN_METHOD(setCloseReaderImage:(NSString *)image)
// RCT_EXTERN_METHOD(setRefreshImage:(NSString *)image)
// RCT_EXTERN_METHOD(setRefreshGoodsImage:(NSString *)image)
// RCT_EXTERN_METHOD(setGoodsCloseImage:(NSString *)image)

// RCT_EXTERN_METHOD(addProductToCache:(NSString *)sku title:(NSString *)title
// subtitle:(NSString *)subtitle imageURL:(NSString *)imageURL price:(NSString
// *)price oldPrice:(NSString *)oldPrice)

// RCT_EXTERN_METHOD(setLogging:(BOOL *)value)
// RCT_EXTERN_METHOD(useDeviceID:(BOOL *)value)

// RCT_EXTERN_METHOD(setAppVersion:(NSString *)appVersion appBuild:(NSInteger
// *)appBuild)

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeAppearanceManagerSpecJSI>(
      params);
}
#endif

@end