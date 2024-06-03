#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(InappstorySdkViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(color, NSString)
RCT_EXPORT_VIEW_PROPERTY(userID, NSString)
RCT_EXPORT_VIEW_PROPERTY(tags, NSArray<NSString *> *)
RCT_EXPORT_VIEW_PROPERTY(placeholders, NSDictionary *)
RCT_EXPORT_VIEW_PROPERTY(imagePlaceholders, NSDictionary *)

@end
