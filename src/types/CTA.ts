export enum CTASource {
  UNKNOWN = 'unknown',
  STORY_LIST = 'storyList',
  STORY_READER = 'storyReader',
  GAME_READER = 'gameReader',
}

export type CTAGameReaderPayload = { url: string; gameInstanceId: string };

export type CTAStoryReaderPayload = {
  id: number;
  index: number;
  url: string;
  elementId: string;
};

export type CTAStoryListPayload = {
  id: number;
  index: number;
  isDeeplink: boolean;
  url: string | undefined;
};

export type CTAPayload =
  CTAStoryListPayload | CTAStoryReaderPayload | CTAGameReaderPayload;
