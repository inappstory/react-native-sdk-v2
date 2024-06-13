import { create } from 'zustand';

export const useStore = create((set) => ({
  events: [],
  feeds: [],
  update: 0,
  addEvent: (newEvent) =>
    set((state) => {
      return { events: state.events.concat([newEvent]) };
    }),
  addToFeed: (feed, event) =>
    set((state) => {
      const newState = { ...state };
      if (state.feeds.indexOf(feed) == -1) {
        newState.feeds.push(feed);
      }
      const feedName = `feeds_${feed}`;
      if (typeof newState[feedName] === 'undefined') {
        newState[feedName] = [];
      }
      const idx = newState[`${feedName}`].findIndex(
        (f) => f.storyID == event.storyID
      );
      if (idx === -1) {
        newState[feedName].push(event);
      }
      return newState;
    }, true),
  setFavorite: (storyID, isFavorite) =>
    set((state) => {
      state.feeds.map((feedName) => {
        var [feed, type] = feedName.split('_');
        if (type == 'favorites') {
          const idx = state[`feeds_${feedName}`].findIndex(
            (f) => f.storyID == storyID
          );
          if (idx !== -1 && !isFavorite) {
            state[`feeds_${feed}_favorites`]?.splice(idx, 1);
          }
          if (idx === -1 && isFavorite) {
            const storyFromList = state[`feeds_${feed}_feed`]?.find(
              (f) => f.storyID == storyID
            );
            if (storyFromList) {
              state[`feeds_default_favorites`].unshift(storyFromList);
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
