/// <reference types="jest" />
import { useFeedStore } from '../hooks/useFeedStore';

const story = (storyID: number, extra: object = {}) => ({
  storyID,
  opened: false,
  ...extra,
});

const state = () => useFeedStore.getState();
const feed = (name: string) => (state() as any)[`feeds_${name}`];

// Keep only the actions: the store mutates its own arrays and never drops
// `feeds_*` keys on its own, so each test starts from a fresh replaced state.
const { clearUpdate, addEvent, clearFeed, addToFeed, replaceInFeed } = state();

beforeEach(() => {
  useFeedStore.setState(
    {
      clearUpdate,
      addEvent,
      clearFeed,
      addToFeed,
      replaceInFeed,
      events: [],
      feeds: [],
      update: 0,
      feeds_default_feed: [],
      feeds_default_favorites: [],
    },
    true
  );
});

describe('initial state', () => {
  it('starts with empty feeds', () => {
    jest.isolateModules(() => {
      const store = require('../hooks/useFeedStore').useFeedStore;
      expect(store.getState().feeds).toEqual([]);
      expect(store.getState().events).toEqual([]);
      expect(store.getState().feeds_default_feed).toEqual([]);
      expect(store.getState().feeds_default_favorites).toEqual([]);
      expect(store.getState().update).toBe(0);
    });
  });
});

describe('addToFeed', () => {
  it('registers the feed name once and stores its stories', () => {
    state().addToFeed('main', [story(1), story(2)]);
    state().addToFeed('main', [story(3)]);
    expect(state().feeds).toEqual(['main']);
    expect(feed('main').map((s: any) => s.storyID)).toEqual([1, 2, 3]);
  });

  it('ignores stories whose storyID is already in the feed', () => {
    state().addToFeed('main', [story(1)]);
    state().addToFeed('main', [story(1, { opened: true })]);
    expect(feed('main')).toHaveLength(1);
    // dedup wins over the newer payload — replaceInFeed is the update path.
    expect(feed('main')[0].opened).toBe(false);
  });

  it('keeps feeds independent', () => {
    state().addToFeed('a', [story(1)]);
    state().addToFeed('b', [story(1)]);
    expect(feed('a')).toHaveLength(1);
    expect(feed('b')).toHaveLength(1);
    expect(state().feeds).toEqual(['a', 'b']);
  });

  it('bumps the update counter so subscribers re-render', () => {
    state().addToFeed('main', [story(1)]);
    expect(state().update).toBe(1);
    state().addToFeed('main', [story(2)]);
    expect(state().update).toBe(2);
  });
});

describe('replaceInFeed', () => {
  it('replaces the story with the matching storyID and leaves the rest', () => {
    state().addToFeed('main', [story(1), story(2), story(3)]);
    state().replaceInFeed('main', story(2, { opened: true }));
    expect(feed('main')).toEqual([
      { storyID: 1, opened: false },
      { storyID: 2, opened: true },
      { storyID: 3, opened: false },
    ]);
  });

  it('appends when the story is not in the feed yet', () => {
    state().addToFeed('main', [story(1)]);
    state().replaceInFeed('main', story(9));
    expect(feed('main').map((s: any) => s.storyID)).toEqual([1, 9]);
  });

  it('creates the feed array for an unknown feed', () => {
    state().replaceInFeed('ghost', story(1));
    expect(feed('ghost')).toHaveLength(1);
  });

  it('bumps update on replace', () => {
    state().addToFeed('main', [story(1)]);
    const before = state().update;
    state().replaceInFeed('main', story(1, { opened: true }));
    expect(state().update).toBe(before + 1);
  });

  it('bumps update on append too', () => {
    state().addToFeed('main', [story(1)]);
    const before = state().update;
    state().replaceInFeed('main', story(2));
    expect(state().update).toBe(before + 1);
  });
});

describe('clearFeed', () => {
  it('drops the feed name and its stories', () => {
    state().addToFeed('main', [story(1)]);
    state().clearFeed('main');
    expect(state().feeds).toEqual([]);
    expect(feed('main')).toBeUndefined();
  });

  it('leaves other feeds untouched', () => {
    state().addToFeed('a', [story(1)]);
    state().addToFeed('b', [story(2)]);
    state().clearFeed('a');
    expect(state().feeds).toEqual(['b']);
    expect(feed('b')).toHaveLength(1);
  });

  it('bumps update even for an unknown feed', () => {
    const before = state().update;
    state().clearFeed('nope');
    expect(state().update).toBe(before + 1);
  });

  it('does not drop a registered feed when clearing an unknown one', () => {
    state().addToFeed('a', [story(1)]);
    state().addToFeed('b', [story(2)]);
    state().clearFeed('unknown');
    expect(state().feeds).toEqual(['a', 'b']);
    expect(feed('b')).toHaveLength(1);
  });

  it('clear + refill replaces the whole feed content', () => {
    state().addToFeed('main', [story(1), story(2)]);
    state().clearFeed('main');
    state().addToFeed('main', [story(3)]);
    expect(feed('main').map((s: any) => s.storyID)).toEqual([3]);
  });
});

describe('immutability', () => {
  // Components select feeds by key; a mutated array keeps its identity and the
  // selector would miss the change.
  it('gives the feed a new array on every write', () => {
    state().addToFeed('main', [story(1)]);
    const first = feed('main');
    state().addToFeed('main', [story(2)]);
    expect(feed('main')).not.toBe(first);
    state().replaceInFeed('main', story(1, { opened: true }));
    expect(feed('main')).not.toBe(first);
  });

  it('does not touch the previous array contents', () => {
    state().addToFeed('main', [story(1)]);
    const snapshot = feed('main');
    state().addToFeed('main', [story(2)]);
    state().replaceInFeed('main', story(1, { opened: true }));
    expect(snapshot).toEqual([{ storyID: 1, opened: false }]);
  });

  it('keeps the feeds list stable when nothing is registered', () => {
    state().addToFeed('main', [story(1)]);
    const feeds = state().feeds;
    state().addToFeed('main', [story(2)]);
    expect(state().feeds).toBe(feeds);
  });

  it('creates a new array reference even when adding an empty story list', () => {
    state().addToFeed('main', [story(1)]);
    const first = feed('main');
    state().addToFeed('main', []);
    expect(feed('main')).not.toBe(first);
    expect(feed('main')).toEqual([{ storyID: 1, opened: false }]);
  });

  it('replaces state entirely so deleted keys do not persist after clearFeed', () => {
    state().addToFeed('temp', [story(1)]);
    expect((state() as any).feeds_temp).toBeDefined();
    state().clearFeed('temp');
    expect((state() as any).feeds_temp).toBeUndefined();
  });
});

describe('events log', () => {
  it('appends events in order', () => {
    state().addEvent({ event: 'a' });
    state().addEvent({ event: 'b' });
    expect(state().events.map((e) => e.event)).toEqual(['a', 'b']);
  });

  it('clearUpdate resets the counter without dropping the feeds', () => {
    state().addToFeed('main', [story(1)]);
    state().addEvent({ event: 'a' });
    state().clearUpdate();
    expect(state().update).toBe(0);
    expect(state().feeds).toEqual(['main']);
    expect(feed('main')).toHaveLength(1);
    expect(state().events).toHaveLength(1);
    expect(typeof state().addToFeed).toBe('function');
  });
});
