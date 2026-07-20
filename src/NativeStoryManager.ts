import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type StoryDTO = {
  storyID: number;
  storyData: string;
  title: string;
  coverImagePath: string;
  coverVideoPath: string;
  backgroundColor: string;
  titleColor: string;
  opened: string;
  hasAudio: boolean;
  list: string;
  feed: string;
  aspectRatio: number;
  slidesCount: number;
  statTitle: string;
};

export type StoryListDTO = {
  stories: StoryDTO[];
  feed: string;
  list: string;
};

export interface Spec extends TurboModule {
  initWith(
    apiKey: string,
    userId: string,
    userIdSign: string | null,
    sandbox: boolean,
    sendStatistics: boolean
  ): Promise<void>;

  setUserID(userId: string, userIdSign: string | null): void;

  setTags(tags: Array<string>): void;

  removeTags(tags: Array<string>): void;

  setPlaceholders(placeholders: Object): void;

  setImagesPlaceholders(placeholders: Object): void;

  setLang(lang: string): void;

  changeSound(value: boolean): void;

  setAppVersion(version: string, build: number): void;

  createSubscriberList(feed: string, uniqueId: string): void;

  getStories(feed: string, uniqueId: string): void;

  getFavoriteStories(feed: string): void;

  onFavoriteCell(): void;

  setVisibleWith(storyIDs: Array<string>): void;

  selectStoryCellWith(storyID: string, feed: string, uniqueId: string): void;

  selectFavoriteStoryCellWith(storyID: string): void;

  preloadBannerPlace(
    placeId: string,
    tags: Array<string> | null
  ): Promise<boolean>;

  showSingle(storyID: string, operationId: string): Promise<boolean>;

  showGame(gameID: string): Promise<boolean>;

  showIAMById(
    iamID: string,
    onlyPreloaded: boolean,
    operationId: string
  ): Promise<boolean>;

  preloadIAM(
    ids: Array<string> | null,
    tags: Array<string> | null
  ): Promise<boolean>;

  cancelOperation(operationId: string): void;

  clearCache(): void;

  readonly onStoryListUpdate: CodegenTypes.EventEmitter<StoryListDTO>;
  readonly onStoryUpdate: CodegenTypes.EventEmitter<StoryDTO>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeStoryManager');
