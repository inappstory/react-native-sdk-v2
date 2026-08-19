import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupSystemEvents(): void;

  setLoggingEnabled(enabled: boolean): void;

  readonly onLog: CodegenTypes.EventEmitter<EventDTO>;
  readonly sessionFailure: CodegenTypes.EventEmitter<EventDTO>;
  readonly storyFailure: CodegenTypes.EventEmitter<EventDTO>;
  readonly currentStoryFailure: CodegenTypes.EventEmitter<EventDTO>;
  readonly networkFailure: CodegenTypes.EventEmitter<EventDTO>;
  readonly requestFailure: CodegenTypes.EventEmitter<EventDTO>;
  readonly handleCTA: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeSystemEvents');
