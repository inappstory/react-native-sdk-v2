import { create } from 'zustand';

export interface StoreState {
  events: Array<any>;
  feeds: Array<any>;
  update: number;
  clearUpdate: () => void;
  addEvent: (event: any) => void;
  clearFeed: (feed: string) => void;
  addToFeed: (feed: string, events: Array<any>) => void;
  setFavorite: (storyID: string, isFavorite: boolean) => void;
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
      const newState = state;
      const feedIndex = newState.feeds.indexOf(`${feed}`);
      const feedName = `feeds_${feed}` as const;
      if (feedIndex !== -1) {
        newState.feeds.splice(feedIndex, 1);
        delete newState[feedName];
      }
      newState.update = newState.update + 1;
      return newState;
    }, true),
  addToFeed: (feed, events) =>
    set((state) => {
      const newState = { ...state };
      if (state.feeds.indexOf(feed) == -1) {
        newState.feeds.push(feed);
      }
      const feedName = `feeds_${feed}` as const;
      const feedArr = newState[feedName] ?? (newState[feedName] = []);
      events.map((event) => {
        const idx = feedArr.findIndex((f) => f.storyID == event.storyID);
        if (idx === -1) {
          feedArr.push(event);
        }
      });
      newState.update = newState.update + 1;
      return newState;
    }, true),
  setFavorite: (storyID, isFavorite) =>
    set((state) => {
      state.feeds.map((feedName) => {
        var [feed, type] = feedName.split('_');
        if (type == 'favorites') {
          const idx =
            state[`feeds_${feedName}`]?.findIndex(
              (f) => f.storyID == storyID
            ) ?? -1;
          if (idx !== -1 && !isFavorite) {
            state[`feeds_${feed}_favorites`]?.splice(idx, 1);
          }
          if (idx === -1 && isFavorite) {
            const storyFromList = state[`feeds_${feed}_feed`]?.find(
              (f) => f.storyID == storyID
            );
            if (storyFromList) {
              state.feeds_default_favorites.unshift(storyFromList);
            } else {
              console.error('failed to find story');
            }
          }
        }
      });
      state.update = state.update + 1;
      return { ...state };
    }, true),
  replaceInFeed: (feed, event) =>
    set((state) => {
      const newState = { ...state };
      const feedName = `feeds_${feed}` as const;
      const feedArr = newState[feedName] ?? (newState[feedName] = []);
      const eventIdx = feedArr.findIndex((os) => os.storyID == event.storyID);
      if (eventIdx === -1) {
        feedArr.push(event);
      } else {
        feedArr[eventIdx] = event;
        newState.update = newState.update + 1;
      }
      return newState;
    }, true),
}));
