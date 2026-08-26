import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupIamEvents(): void;

  readonly showInAppMessage: CodegenTypes.EventEmitter<EventDTO>;
  readonly closeInAppMessage: CodegenTypes.EventEmitter<EventDTO>;
  readonly inAppMessageWidgetEvent: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeIamEvents');
