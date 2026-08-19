/// <reference types="jest" />
// Shared native-module mocks and helpers for the StoryManager suites.
// jest.mock is hoisted within this module and registers when the module is
// imported, so every StoryManager.*.test.ts gets the same fake bridge by
// importing this file before it touches StoryManager.
import NativeStoryManager from '../../specs/NativeStoryManager';

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
    storyReaderWillShow: jest.fn(() => ({ remove: jest.fn() })),
    storyReaderDidClose: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../../specs/NativeStoriesEvents', () => ({
  __esModule: true,
  default: {
    setupStoriesEvents: jest.fn(),
    showStory: jest.fn(() => ({ remove: jest.fn() })),
    closeStory: jest.fn(() => ({ remove: jest.fn() })),
    showSlide: jest.fn(() => ({ remove: jest.fn() })),
    likeStory: jest.fn(() => ({ remove: jest.fn() })),
    dislikeStory: jest.fn(() => ({ remove: jest.fn() })),
    favoriteStory: jest.fn(() => ({ remove: jest.fn() })),
    clickOnShareStory: jest.fn(() => ({ remove: jest.fn() })),
    clickOnButton: jest.fn(() => ({ remove: jest.fn() })),
    storyWidgetEvent: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../../specs/NativeBannerEvents', () => ({
  __esModule: true,
  default: {
    setupBannerEvents: jest.fn(),
    bannerWidgetEvent: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../../specs/NativeGoodsEvents', () => ({
  __esModule: true,
  default: {
    setupGoodsEvents: jest.fn(),
    getGoodsObject: jest.fn(() => ({ remove: jest.fn() })),
    goodItemSelected: jest.fn(() => ({ remove: jest.fn() })),
    productCartUpdate: jest.fn(() => ({ remove: jest.fn() })),
    productCartClicked: jest.fn(() => ({ remove: jest.fn() })),
    productCartGetState: jest.fn(() => ({ remove: jest.fn() })),
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
    onLog: jest.fn(() => ({ remove: jest.fn() })),
    sessionFailure: jest.fn(() => ({ remove: jest.fn() })),
    storyFailure: jest.fn(() => ({ remove: jest.fn() })),
    currentStoryFailure: jest.fn(() => ({ remove: jest.fn() })),
    networkFailure: jest.fn(() => ({ remove: jest.fn() })),
    requestFailure: jest.fn(() => ({ remove: jest.fn() })),
    handleCTA: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../../specs/NativeGameEvents', () => ({
  __esModule: true,
  default: {
    setupGameEvents: jest.fn(),
    startGame: jest.fn(() => ({ remove: jest.fn() })),
    closeGame: jest.fn(() => ({ remove: jest.fn() })),
    eventGame: jest.fn(() => ({ remove: jest.fn() })),
    gameFailure: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../../specs/NativeIamEvents', () => ({
  __esModule: true,
  default: {
    setupIamEvents: jest.fn(),
    showInAppMessage: jest.fn(() => ({ remove: jest.fn() })),
    closeInAppMessage: jest.fn(() => ({ remove: jest.fn() })),
    inAppMessageWidgetEvent: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

export const native = NativeStoryManager as jest.Mocked<
  typeof NativeStoryManager
>;

export const flush = () =>
  new Promise<void>((resolve) => setImmediate(() => resolve()));

beforeEach(() => {
  jest.clearAllMocks();
});
