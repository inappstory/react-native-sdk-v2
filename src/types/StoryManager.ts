import type { Dict, Option } from './common';

export type LogEntry = {
  level: 'debug' | 'error';
  message?: string;
};

export type StoryManagerConfig = {
  apiKey: string;
  userId?: Option<string | number>;
  userIdSign?: Option<string>;
  tags?: Option<Array<string>>;
  placeholders?: Option<Dict<string>>;
  lang?: string;
  defaultMuted?: boolean;
  appVersion?: {
    version: string;
    build: number;
  };
  sendStatistics?: boolean;
  /** Native story cache size. Android-only (iOS SDK manages its cache itself). */
  cacheSize?: 'small' | 'medium' | 'large';
  /** Anonymous mode: no userId is sent to the backend. */
  anonymous?: boolean;
};
