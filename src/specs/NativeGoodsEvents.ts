import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupGoodsEvents(): void;

  addProductToCache(
    sku: string,
    title: string,
    subtitle: string,
    imageURL: string,
    price: string,
    oldPrice: string
  ): void;

  commitGoods(): void;

  /**
   * Answer a pending productCartUpdate/productCartGetState request.
   * cart=null reports an error to the native SDK.
   */
  resolveProductCart(requestId: string, cart: Object | null): void;

  readonly getGoodsObject: CodegenTypes.EventEmitter<EventDTO>;
  readonly goodItemSelected: CodegenTypes.EventEmitter<EventDTO>;
  readonly productCartUpdate: CodegenTypes.EventEmitter<EventDTO>;
  readonly productCartClicked: CodegenTypes.EventEmitter<EventDTO>;
  readonly productCartGetState: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeGoodsEvents');
