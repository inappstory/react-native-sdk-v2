import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupGoodsEvents(): void;

  readonly getGoodsObject: CodegenTypes.EventEmitter<EventDTO>;
  readonly goodItemSelected: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeGoodsEvents');
