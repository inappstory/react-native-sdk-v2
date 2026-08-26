import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupGameEvents(): void;

  readonly startGame: CodegenTypes.EventEmitter<EventDTO>;
  readonly closeGame: CodegenTypes.EventEmitter<EventDTO>;
  readonly eventGame: CodegenTypes.EventEmitter<EventDTO>;
  readonly gameFailure: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeGameEvents');
