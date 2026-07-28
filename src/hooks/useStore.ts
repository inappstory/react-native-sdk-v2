import { create } from 'zustand';

export interface StoreState {
  events: Array<any>;
  feeds: Array<any>;
  update: number;
  clearUpdate: () => void;
  addEvent: (event: any) => void;
  clearFeed: (feed: string) => void;
  addToFeed: (feed: string, events: Array<any>) => void;
  replaceInFeed: (feed: string, event: any) => void;
  feeds_default_feed: Array<any>;
  feeds_default_favorites: Array<any>;
  [feedKey: `feeds_${string}`]: Array<any>;
}

export const useFeedStore = create<StoreState>()((set) => ({
  events: [],
  feeds: [],
  feeds_default_feed: [],
  feeds_default_favorites: [],
  update: 0,
  clearUpdate: () =>
    set((state) => {
      const newState = { ...state };
      newState.update = 0;
      return newState;
    }, true),
  addEvent: (newEvent) =>
    set((state) => ({ events: state.events.concat([newEvent]) })),
  clearFeed: (feed) =>
    set((state) => {
      const newState = {
        ...state,
        feeds: state.feeds.filter((f) => f !== `${feed}`),
        update: state.update + 1,
      };
      delete (newState as Record<string, unknown>)[`feeds_${feed}`];
      return newState;
    }, true),
  addToFeed: (feed, events) =>
    set((state) => {
      const feedName = `feeds_${feed}` as const;
      const feedArr = state[feedName] ?? [];
      const added = events.filter(
        (event) => !feedArr.some((f) => f.storyID == event.storyID)
      );
      return {
        ...state,
        feeds: state.feeds.includes(feed)
          ? state.feeds
          : [...state.feeds, feed],
        [feedName]: [...feedArr, ...added],
        update: state.update + 1,
      };
    }, true),
  replaceInFeed: (feed, event) =>
    set((state) => {
      const feedName = `feeds_${feed}` as const;
      const feedArr = state[feedName] ?? [];
      const eventIdx = feedArr.findIndex((os) => os.storyID == event.storyID);
      return {
        ...state,
        [feedName]:
          eventIdx === -1
            ? [...feedArr, event]
            : feedArr.map((story, i) => (i === eventIdx ? event : story)),
        update: state.update + 1,
      };
    }, true),
}));
