import { create } from 'zustand';
type StoreState = {
  events: Array<any>;
  feeds: Array<any>;
  update: number;
  clearUpdate: () => void;
  addEvent: (event: any) => void;
  clearFeed: (feed: String) => void;
  clearAllFeeds: () => void;
  addToFeed: (feed: String, events: Array<any>) => void;
  replaceInFeed: (feed: String, event: any) => void;
  feeds_default_feed: Array<any>;
  feeds_default_favorites: Array<any>;
};
export const useStore = create<StoreState>((set) => ({
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
    set((state) => {
      return { events: state.events.concat([newEvent]) };
    }),

  clearAllFeeds: () =>
    set((state) => {
      const newState: any = { ...state };
      state.feeds.forEach((feed) => {
        delete newState[`feeds_${feed}`];
      });
      newState.feeds = [];
      newState.feeds_default_feed = [];
      newState.feeds_default_favorites = [];
      newState.update = newState.update + 1;
      return newState;
    }, true),
  clearFeed: (feed) =>
    set((state) => {
      const newState = state;
      const feedIndex = newState.feeds.indexOf(`${feed}`);
      const feedName = `feeds_${feed}`;
      if (feedIndex !== -1) {
        newState.feeds.splice(feedIndex, 1);
        delete newState[`${feedName}`];
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
      const feedName = `feeds_${feed}`;
      if (typeof newState[feedName] === 'undefined') {
        newState[feedName] = [];
      }
      events.map((event) => {
        const idx = newState[`${feedName}`].findIndex(
          (f) => f.storyID == event.storyID
        );
        if (idx === -1) {
          newState[feedName].push(event);
        }
      });
      newState.update = newState.update + 1;
      return newState;
    }, true),
  replaceInFeed: (feed, event) =>
    set((state) => {
      const newState = { ...state };
      const feedName = `feeds_${feed}`;
      if (typeof newState[feedName] === 'undefined') {
        newState[feedName] = [];
      }
      const eventIdx = newState[feedName].findIndex(
        (os) => os.storyID == event.storyID
      );
      if (eventIdx === -1) {
        newState[feedName].push(event);
      } else {
        newState[feedName][eventIdx] = event;
        newState.update = newState.update + 1;
      }
      return newState;
    }, true),
}));
