import type { NativeEvent } from './common';

export type StoryData = {
  id?: number;
  feed?: string;
  slidesCount?: number;
  extraFields?: Record<string, string> | null;
};

export type StoryEvent<N extends string, B = {}> = NativeEvent<
  N,
  StoryData & B
>;
