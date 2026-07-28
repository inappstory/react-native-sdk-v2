/// <reference types="jest" />
// The hook only wraps subscribeFeedStore in a useEffect; running the effect
// eagerly keeps this a unit test with no renderer involved.
jest.mock('react', () => ({ useEffect: (effect: () => void) => effect() }));

jest.mock('../specs/NativeStoryManager', () => ({
  __esModule: true,
  default: {
    onStoryListUpdate: jest.fn(() => ({ remove: jest.fn() })),
    onStoryUpdate: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../specs/NativeFeedEvents', () => ({
  __esModule: true,
  default: { storyReaderWillShow: jest.fn(() => ({ remove: jest.fn() })) },
}));

// `subscribeFeedStore` is guarded by a module-level flag, so every test needs a
// fresh module registry to exercise the first-subscription path.
const load = () => {
  let api!: {
    useNativeFeedEvents: () => void;
    store: typeof import('../hooks/useFeedStore').useFeedStore;
    native: any;
    feedEvents: any;
  };
  jest.isolateModules(() => {
    api = {
      useNativeFeedEvents: require('../hooks/useNativeFeedEvents')
        .useNativeFeedEvents,
      store: require('../hooks/useFeedStore').useFeedStore,
      native: require('../specs/NativeStoryManager').default,
      feedEvents: require('../specs/NativeFeedEvents').default,
    };
  });
  return api;
};

const runEffect = (api: { useNativeFeedEvents: () => void }) =>
  api.useNativeFeedEvents();

const handlerOf = (mock: jest.Mock) => mock.mock.calls[0]![0];

beforeEach(() => jest.clearAllMocks());

describe('useNativeFeedEvents', () => {
  it('subscribes to the three native feed events', () => {
    const api = load();
    const { native, feedEvents } = api;
    runEffect(api);
    expect(native.onStoryListUpdate).toHaveBeenCalledTimes(1);
    expect(native.onStoryUpdate).toHaveBeenCalledTimes(1);
    expect(feedEvents.storyReaderWillShow).toHaveBeenCalledTimes(1);
  });

  it('subscribes only once even across several consumers', () => {
    const api = load();
    const { native } = api;
    runEffect(api);
    runEffect(api);
    runEffect(api);
    expect(native.onStoryListUpdate).toHaveBeenCalledTimes(1);
  });

  it('replaces the feed content on a list update', () => {
    const api = load();
    const { store, native } = api;
    runEffect(api);
    const onListUpdate = handlerOf(native.onStoryListUpdate);

    onListUpdate({
      feed: 'main',
      list: 'l1',
      stories: [{ storyID: 1 }, { storyID: 2 }],
    });
    onListUpdate({ feed: 'main', list: 'l1', stories: [{ storyID: 3 }] });

    // The feed key joins feed and list: two lists of one feed stay separate.
    const feed = (store.getState() as any).feeds_main_l1;
    expect(feed.map((s: any) => s.storyID)).toEqual([3]);
  });

  it('keeps lists of the same feed apart', () => {
    const api = load();
    const { store, native } = api;
    runEffect(api);
    const onListUpdate = handlerOf(native.onStoryListUpdate);
    onListUpdate({ feed: 'main', list: 'a', stories: [{ storyID: 1 }] });
    onListUpdate({ feed: 'main', list: 'b', stories: [{ storyID: 2 }] });
    expect((store.getState() as any).feeds_main_a).toHaveLength(1);
    expect((store.getState() as any).feeds_main_b).toHaveLength(1);
  });

  it('applies a single story update in place', () => {
    const api = load();
    const { store, native } = api;
    runEffect(api);
    handlerOf(native.onStoryListUpdate)({
      feed: 'main',
      list: 'l1',
      stories: [{ storyID: 1, opened: false }],
    });
    handlerOf(native.onStoryUpdate)({
      feed: 'main',
      list: 'l1',
      storyID: 1,
      opened: true,
    });
    const feed = (store.getState() as any).feeds_main_l1;
    expect(feed).toHaveLength(1);
    expect(feed[0].opened).toBe(true);
  });

  it('logs every native event into the store', () => {
    const api = load();
    const { store, native, feedEvents } = api;
    runEffect(api);
    handlerOf(native.onStoryListUpdate)({
      feed: 'f',
      list: 'l',
      stories: [],
    });
    handlerOf(native.onStoryUpdate)({ feed: 'f', list: 'l', storyID: 1 });
    handlerOf(feedEvents.storyReaderWillShow)({ body: {} });
    expect(store.getState().events.map((e) => e.event)).toEqual([
      'storyListUpdate',
      'storyUpdate',
      'storyReaderWillShow',
    ]);
    // Wall-clock timestamps, not negated or zeroed ones.
    for (const event of store.getState().events) {
      expect(event.time).toBeGreaterThan(1e12);
      expect(event.time).toBeLessThanOrEqual(Date.now());
    }
  });
});
