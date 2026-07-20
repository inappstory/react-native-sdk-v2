#import "NativeGoodsEvents.h"
#import "react_native_sdk/react_native_sdk-Swift.h"

@implementation NativeGoodsEvents
RCT_EXPORT_MODULE()

- (void)notifyGetGoodsObject:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitGetGoodsObject:data];
#else
  [self sendEventWithName:@"getGoodsObject" body:data];
#endif
}

- (void)notifyGoodItemSelected:(NSDictionary *)data {
#ifdef RCT_NEW_ARCH_ENABLED
  [self emitGoodItemSelected:data];
#else
  [self sendEventWithName:@"goodItemSelected" body:data];
#endif
}

RCT_EXPORT_METHOD(setupGoodsEvents) {
  [[NativeGoodsEventsImpl shared]
      setupGoodsEventsWithGetGoodsObject:^(NSDictionary *data) {
        [self notifyGetGoodsObject:data];
      }
      goodItemSelected:^(NSDictionary *data) {
        [self notifyGoodItemSelected:data];
      }];
}

RCT_EXPORT_METHOD(addProductToCache:(nonnull NSString *)sku
                              title:(nonnull NSString *)title
                           subtitle:(nonnull NSString *)subtitle
                           imageURL:(nonnull NSString *)imageURL
                              price:(nonnull NSString *)price
                           oldPrice:(nonnull NSString *)oldPrice) {
  [[NativeGoodsEventsImpl shared] addProductToCache:sku
                                              title:title
                                           subtitle:subtitle
                                           imageURL:imageURL
                                              price:price
                                           oldPrice:oldPrice];
}

RCT_EXPORT_METHOD(commitGoods) {
  [[NativeGoodsEventsImpl shared] commitGoods];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeGoodsEventsSpecJSI>(params);
}
#else
- (NSArray<NSString *> *)supportedEvents {
  return @[ @"getGoodsObject", @"goodItemSelected" ];
}
#endif

@end
