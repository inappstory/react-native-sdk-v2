import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupFeedEvents(): void;

  // Favorites changes reach JS through onStoryListUpdate with list="favorites",
  // so there is no separate favourites event here.
  readonly storyReaderWillShow: CodegenTypes.EventEmitter<EventDTO>;
  readonly storyReaderDidClose: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeFeedEvents');
