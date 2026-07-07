import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupFeedEvents(): void;

  readonly favoritesUpdate: CodegenTypes.EventEmitter<EventDTO>;
  readonly favoriteCellDidSelect: CodegenTypes.EventEmitter<EventDTO>;
  readonly editorCellDidSelect: CodegenTypes.EventEmitter<EventDTO>;
  readonly storyReaderWillShow: CodegenTypes.EventEmitter<EventDTO>;
  readonly storyReaderDidClose: CodegenTypes.EventEmitter<EventDTO>;
  readonly storiesDidUpdated: CodegenTypes.EventEmitter<EventDTO>;
  readonly scrollUpdate: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFeedEvents');
