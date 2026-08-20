/// <reference types="jest" />
// Shared native-module mocks and helpers for the StoryManager suites.
// jest.mock is hoisted within this module and registers when the module is
// imported, so every StoryManager.*.test.ts gets the same fake bridge by
// importing this file before it touches StoryManager.
import NativeStoryManager from '../../specs/NativeStoryManager';

// A native event mock that behaves like the real bridge: handlers stay
// registered until their subscription is removed, so a test can emit one event
// and see how many live listeners actually got it.
const mockRegistry: Record<string, Array<(e: any) => void>> = {};
const mockEvent = (moduleName: string, event: string) =>
  jest.fn((handler: (e: any) => void) => {
    const key = `${moduleName}.${event}`;
    (mockRegistry[key] ??= []).push(handler);
    return {
      remove: jest.fn(() => {
        mockRegistry[key] = mockRegistry[key]!.filter((h) => h !== handler);
      }),
    };
  });

/** Fire a native event at every listener still subscribed to it. */
export const emitNative = (moduleName: string, event: string, body: any) => {
  const handlers = mockRegistry[`${moduleName}.${event}`] ?? [];
  [...handlers].forEach((handler) => handler({ body }));
};

/** How many live listeners a native event currently has. */
export const listenerCount = (moduleName: string, event: string) =>
  (mockRegistry[`${moduleName}.${event}`] ?? []).length;

jest.mock('../../specs/NativeStoryManager', () => ({
  __esModule: true,
  default: {
    initWith: jest.fn().mockResolvedValue(undefined),
    setUserID: jest.fn(),
    setTags: jest.fn(),
    addTags: jest.fn(),
    removeTags: jest.fn(),
    setPlaceholders: jest.fn(),
    setImagesPlaceholders: jest.fn(),
    setLang: jest.fn(),
    changeSound: jest.fn(),
    setAppVersion: jest.fn(),
    createSubscriberList: jest.fn(),
    getStories: jest.fn(),
    getFavoriteStories: jest.fn(),
    onFavoriteCell: jest.fn(),
    setVisibleWith: jest.fn(),
    selectStoryCellWith: jest.fn(),
    selectFavoriteStoryCellWith: jest.fn(),
    preloadBannerPlace: jest.fn().mockResolvedValue(true),
    setOptions: jest.fn(),
    showSingle: jest.fn().mockResolvedValue(true),
    showStoryOnce: jest.fn().mockResolvedValue(true),
    showOnboardings: jest.fn().mockResolvedValue(true),
    showGame: jest.fn().mockResolvedValue(true),
    showIAMById: jest.fn().mockResolvedValue(true),
    showIAMByEvent: jest.fn().mockResolvedValue(true),
    preloadIAM: jest.fn().mockResolvedValue(true),
    cancelOperation: jest.fn(),
    clearCache: jest.fn(),
    preloadGames: jest.fn(),
    removeFromFavorite: jest.fn(),
    removeAllFavorites: jest.fn(),
    favoritesCount: jest.fn().mockResolvedValue(2),
    logout: jest.fn(),
  },
}));

jest.mock('../../specs/NativeAppearanceManager', () => ({
  __esModule: true,
  default: {
    setHasLike: jest.fn(),
    setHasFavorites: jest.fn(),
    setHasShare: jest.fn(),
  },
}));

// Event modules: setup* + one jest.fn per event (new-arch EventEmitter style —
// subscribeNativeEvent calls module[event](handler) directly).
jest.mock('../../specs/NativeFeedEvents', () => ({
  __esModule: true,
  default: {
    setupFeedEvents: jest.fn(),
    storyReaderWillShow: mockEvent('NativeFeedEvents', 'storyReaderWillShow'),
    storyReaderDidClose: mockEvent('NativeFeedEvents', 'storyReaderDidClose'),
  },
}));

jest.mock('../../specs/NativeStoriesEvents', () => ({
  __esModule: true,
  default: {
    setupStoriesEvents: jest.fn(),
    showStory: mockEvent('NativeStoriesEvents', 'showStory'),
    closeStory: mockEvent('NativeStoriesEvents', 'closeStory'),
    showSlide: mockEvent('NativeStoriesEvents', 'showSlide'),
    likeStory: mockEvent('NativeStoriesEvents', 'likeStory'),
    dislikeStory: mockEvent('NativeStoriesEvents', 'dislikeStory'),
    favoriteStory: mockEvent('NativeStoriesEvents', 'favoriteStory'),
    clickOnShareStory: mockEvent('NativeStoriesEvents', 'clickOnShareStory'),
    clickOnButton: mockEvent('NativeStoriesEvents', 'clickOnButton'),
    storyWidgetEvent: mockEvent('NativeStoriesEvents', 'storyWidgetEvent'),
  },
}));

jest.mock('../../specs/NativeBannerEvents', () => ({
  __esModule: true,
  default: {
    setupBannerEvents: jest.fn(),
    bannerWidgetEvent: mockEvent('NativeBannerEvents', 'bannerWidgetEvent'),
  },
}));

jest.mock('../../specs/NativeGoodsEvents', () => ({
  __esModule: true,
  default: {
    setupGoodsEvents: jest.fn(),
    getGoodsObject: mockEvent('NativeGoodsEvents', 'getGoodsObject'),
    goodItemSelected: mockEvent('NativeGoodsEvents', 'goodItemSelected'),
    productCartUpdate: mockEvent('NativeGoodsEvents', 'productCartUpdate'),
    productCartClicked: mockEvent('NativeGoodsEvents', 'productCartClicked'),
    productCartGetState: mockEvent('NativeGoodsEvents', 'productCartGetState'),
    addProductToCache: jest.fn(),
    commitGoods: jest.fn(),
    resolveProductCart: jest.fn(),
  },
}));

jest.mock('../../specs/NativeSystemEvents', () => ({
  __esModule: true,
  default: {
    setupSystemEvents: jest.fn(),
    setLoggingEnabled: jest.fn(),
    onLog: mockEvent('NativeSystemEvents', 'onLog'),
    sessionFailure: mockEvent('NativeSystemEvents', 'sessionFailure'),
    storyFailure: mockEvent('NativeSystemEvents', 'storyFailure'),
    currentStoryFailure: mockEvent('NativeSystemEvents', 'currentStoryFailure'),
    networkFailure: mockEvent('NativeSystemEvents', 'networkFailure'),
    requestFailure: mockEvent('NativeSystemEvents', 'requestFailure'),
    handleCTA: mockEvent('NativeSystemEvents', 'handleCTA'),
  },
}));

jest.mock('../../specs/NativeGameEvents', () => ({
  __esModule: true,
  default: {
    setupGameEvents: jest.fn(),
    startGame: mockEvent('NativeGameEvents', 'startGame'),
    closeGame: mockEvent('NativeGameEvents', 'closeGame'),
    eventGame: mockEvent('NativeGameEvents', 'eventGame'),
    gameFailure: mockEvent('NativeGameEvents', 'gameFailure'),
  },
}));

jest.mock('../../specs/NativeIamEvents', () => ({
  __esModule: true,
  default: {
    setupIamEvents: jest.fn(),
    showInAppMessage: mockEvent('NativeIamEvents', 'showInAppMessage'),
    closeInAppMessage: mockEvent('NativeIamEvents', 'closeInAppMessage'),
    inAppMessageWidgetEvent: mockEvent(
      'NativeIamEvents',
      'inAppMessageWidgetEvent'
    ),
  },
}));

export const native = NativeStoryManager as jest.Mocked<
  typeof NativeStoryManager
>;

export const flush = () =>
  new Promise<void>((resolve) => setImmediate(() => resolve()));

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(mockRegistry).forEach((key) => delete mockRegistry[key]);
});
