import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type EventDTO = {
  withName: string;
  body: { k: string; v: string };
};

export interface Spec extends TurboModule {
  setupStoriesEvents(): void;

  readonly storiesLoaded: CodegenTypes.EventEmitter<EventDTO>;
  readonly ugcStoriesLoaded: CodegenTypes.EventEmitter<EventDTO>;
  readonly showStory: CodegenTypes.EventEmitter<EventDTO>;
  readonly closeStory: CodegenTypes.EventEmitter<EventDTO>;
  readonly showSlide: CodegenTypes.EventEmitter<EventDTO>;
  readonly likeStory: CodegenTypes.EventEmitter<EventDTO>;
  readonly dislikeStory: CodegenTypes.EventEmitter<EventDTO>;
  readonly favoriteStory: CodegenTypes.EventEmitter<EventDTO>;
  readonly clickOnShareStory: CodegenTypes.EventEmitter<EventDTO>;
  readonly clickOnButton: CodegenTypes.EventEmitter<EventDTO>;
  readonly storyWidgetEvent: CodegenTypes.EventEmitter<EventDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeStoriesEvents');
