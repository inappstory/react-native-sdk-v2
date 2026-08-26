import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupBannerEvents(): void;

  readonly bannerWidgetEvent: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeBannerEvents');
