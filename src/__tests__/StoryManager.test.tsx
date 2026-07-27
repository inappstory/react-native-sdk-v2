/// <reference types="jest" />
import { Linking } from 'react-native';
import { StoryManager, CTASource } from '../StoryManager';
import NativeStoryManager from '../NativeStoryManager';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeIamEvents from '../specs/NativeIamEvents';

jest.mock('../NativeStoryManager', () => ({
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
    removeFromFavorite: jest.fn(),
    removeAllFavorites: jest.fn(),
    favoritesCount: jest.fn().mockResolvedValue(2),
    logout: jest.fn(),
  },
}));

jest.mock('../NativeAppearanceManager', () => ({
  __esModule: true,
  default: {
    setHasLike: jest.fn(),
    setHasFavorites: jest.fn(),
    setHasShare: jest.fn(),
  },
}));

// Event modules: setup* + one jest.fn per event (new-arch EventEmitter style —
// subscribeNativeEvent calls module[event](handler) directly).
jest.mock('../specs/NativeFeedEvents', () => ({
  __esModule: true,
  default: {
    setupFeedEvents: jest.fn(),
    storyReaderWillShow: jest.fn(() => ({ remove: jest.fn() })),
    storyReaderDidClose: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../specs/NativeStoriesEvents', () => ({
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

jest.mock('../specs/NativeBannerEvents', () => ({
  __esModule: true,
  default: {
    setupBannerEvents: jest.fn(),
    bannerWidgetEvent: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../specs/NativeGoodsEvents', () => ({
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

jest.mock('../specs/NativeSystemEvents', () => ({
  __esModule: true,
  default: {
    setupSystemEvents: jest.fn(),
    sessionFailure: jest.fn(() => ({ remove: jest.fn() })),
    storyFailure: jest.fn(() => ({ remove: jest.fn() })),
    currentStoryFailure: jest.fn(() => ({ remove: jest.fn() })),
    networkFailure: jest.fn(() => ({ remove: jest.fn() })),
    requestFailure: jest.fn(() => ({ remove: jest.fn() })),
    customShare: jest.fn(() => ({ remove: jest.fn() })),
    handleCTA: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../specs/NativeGameEvents', () => ({
  __esModule: true,
  default: {
    setupGameEvents: jest.fn(),
    startGame: jest.fn(() => ({ remove: jest.fn() })),
    closeGame: jest.fn(() => ({ remove: jest.fn() })),
    eventGame: jest.fn(() => ({ remove: jest.fn() })),
    gameFailure: jest.fn(() => ({ remove: jest.fn() })),
    gameReaderWillShow: jest.fn(() => ({ remove: jest.fn() })),
    gameReaderDidClose: jest.fn(() => ({ remove: jest.fn() })),
    gameComplete: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('../specs/NativeIamEvents', () => ({
  __esModule: true,
  default: {
    setupIamEvents: jest.fn(),
    showInAppMessage: jest.fn(() => ({ remove: jest.fn() })),
    closeInAppMessage: jest.fn(() => ({ remove: jest.fn() })),
    inAppMessageWidgetEvent: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const native = NativeStoryManager as jest.Mocked<typeof NativeStoryManager>;
const flush = () =>
  new Promise<void>((resolve) => setImmediate(() => resolve()));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('StoryManager.create', () => {
  it('initializes native SDK with config values', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 42,
      userIdSign: 'sig',
      sendStatistics: false,
    });
    expect(native.initWith).toHaveBeenCalledWith(
      'key',
      '42',
      'sig',
      false,
      false,
      null,
      false
    );
  });

  it('passes cacheSize and anonymous to native init', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 'u',
      cacheSize: 'large',
      anonymous: true,
    });
    expect(native.initWith).toHaveBeenCalledWith(
      'key',
      'u',
      null,
      false,
      true,
      'large',
      true
    );
  });

  it('applies tags, placeholders, lang and appVersion from config', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 'u',
      tags: ['a', 'b'],
      placeholders: { name: 'Alex' },
      lang: 'ru-RU',
      appVersion: { version: '1.2.3', build: 45 },
    });
    expect(native.setTags).toHaveBeenCalledWith(['a', 'b']);
    expect(native.setPlaceholders).toHaveBeenCalledWith({ name: 'Alex' });
    expect(native.setLang).toHaveBeenCalledWith('ru-RU');
    expect(native.setAppVersion).toHaveBeenCalledWith('1.2.3', 45);
  });

  it('does not push absent config values but always applies sound', async () => {
    await StoryManager.create({ apiKey: 'key', userId: 'u' });
    expect(native.setTags).not.toHaveBeenCalled();
    expect(native.setPlaceholders).not.toHaveBeenCalled();
    expect(native.setLang).not.toHaveBeenCalled();
    expect(native.setAppVersion).not.toHaveBeenCalled();
    expect(native.changeSound).toHaveBeenCalledWith(true);
  });

  it('maps defaultMuted to changeSound(false)', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 'u',
      defaultMuted: true,
    });
    expect(native.changeSound).toHaveBeenCalledWith(false);
  });

  it('sets up all native event modules', async () => {
    await StoryManager.create({ apiKey: 'key', userId: 'u' });
    expect(NativeFeedEvents.setupFeedEvents).toHaveBeenCalled();
    expect(NativeStoriesEvents.setupStoriesEvents).toHaveBeenCalled();
    expect(NativeBannerEvents.setupBannerEvents).toHaveBeenCalled();
    expect(NativeGoodsEvents.setupGoodsEvents).toHaveBeenCalled();
    expect(NativeSystemEvents.setupSystemEvents).toHaveBeenCalled();
    expect(NativeGameEvents.setupGameEvents).toHaveBeenCalled();
    expect(NativeIamEvents.setupIamEvents).toHaveBeenCalled();
  });
});

describe('cancelable operations', () => {
  it('showStory resolves loaded=true and passes stringified id', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await expect(manager.showStory(7)).resolves.toEqual({ loaded: true });
    expect(native.showSingle).toHaveBeenCalledWith('7', expect.any(String));
  });

  it('showStory aborts pending open via cancelOperation', async () => {
    native.showSingle.mockReturnValueOnce(new Promise(() => {}));
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const controller = new AbortController();
    const promise = manager.showStory(1, controller.signal);
    controller.abort();
    await expect(promise).rejects.toEqual({ loaded: false });
    const operationId = native.showSingle.mock.calls[0]![1];
    expect(native.cancelOperation).toHaveBeenCalledWith(operationId);
  });

  it('rejects immediately when signal is already aborted', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const controller = new AbortController();
    controller.abort();
    await expect(
      manager.showIAMById('5', false, controller.signal)
    ).rejects.toBe(false);
    expect(native.showIAMById).not.toHaveBeenCalled();
  });

  it('showStoryOnce resolves native result and stringifies id', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await expect(manager.showStoryOnce(9)).resolves.toBe(true);
    expect(native.showStoryOnce).toHaveBeenCalledWith('9', expect.any(String));
  });

  it('showOnboardings uses native defaults and supports overrides', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await manager.showOnboardings();
    expect(native.showOnboardings).toHaveBeenCalledWith(
      'onboarding',
      1000,
      null,
      expect.any(String)
    );
    await manager.showOnboardings('welcome', 3, ['vip']);
    expect(native.showOnboardings).toHaveBeenCalledWith(
      'welcome',
      3,
      ['vip'],
      expect.any(String)
    );
  });
});

describe('runtime setters', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it.each([
    ['setLang', ['ru-RU']],
    ['changeSound', [false]],
    ['setAppVersion', ['2.0', 10]],
    ['removeAllFavorites', []],
    ['logout', []],
    ['clearCache', []],
  ] as const)('%s calls through to native', (method, args) => {
    (manager as any)[method](...args);
    expect((native as any)[method]).toHaveBeenCalledWith(...args);
  });

  it('setOptions passes the options map to native', () => {
    manager.setOptions({ pos: '1' });
    expect(native.setOptions).toHaveBeenCalledWith({ pos: '1' });
  });

  it('addTags calls native and merges local tags without duplicates', async () => {
    const m = await StoryManager.create({
      apiKey: 'k',
      userId: 'u',
      tags: ['a'],
    });
    m.addTags(['a', 'b']);
    expect(native.addTags).toHaveBeenCalledWith(['a', 'b']);
    expect(m.tags).toEqual(['a', 'b']);
  });

  it('removeFromFavorite stringifies numeric ids', () => {
    manager.removeFromFavorite(15);
    expect(native.removeFromFavorite).toHaveBeenCalledWith('15');
  });

  it('favoritesCount resolves native value', async () => {
    await expect(manager.favoritesCount()).resolves.toBe(2);
  });
});

describe('event subscriptions fan-out', () => {
  let manager: StoryManager;
  const listener = jest.fn();
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it('onFailure subscribes to all failure events', () => {
    manager.onFailure(listener);
    for (const name of [
      'sessionFailure',
      'storyFailure',
      'currentStoryFailure',
      'networkFailure',
      'requestFailure',
    ] as const) {
      expect((NativeSystemEvents as any)[name]).toHaveBeenCalledWith(listener);
    }
  });

  it('onGameEvent subscribes to all game events', () => {
    manager.onGameEvent(listener);
    for (const name of [
      'startGame',
      'closeGame',
      'eventGame',
      'gameFailure',
      'gameReaderWillShow',
      'gameReaderDidClose',
      'gameComplete',
    ] as const) {
      expect((NativeGameEvents as any)[name]).toHaveBeenCalledWith(listener);
    }
  });

  it('onIamEvent subscribes to all IAM events', () => {
    manager.onIamEvent(listener);
    for (const name of [
      'showInAppMessage',
      'closeInAppMessage',
      'inAppMessageWidgetEvent',
    ] as const) {
      expect((NativeIamEvents as any)[name]).toHaveBeenCalledWith(listener);
    }
  });

  it('onStoryReaderDidClose and onStoryWidgetEvent subscribe', () => {
    manager.onStoryReaderDidClose(listener);
    manager.onStoryWidgetEvent(listener);
    expect(NativeFeedEvents.storyReaderDidClose).toHaveBeenCalledWith(listener);
    expect(NativeStoriesEvents.storyWidgetEvent).toHaveBeenCalledWith(listener);
  });
});

describe('CTA handling', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it.each([
    ['button', CTASource.STORY_READER],
    ['swipe', CTASource.STORY_READER],
    ['deeplink', CTASource.STORY_LIST],
    ['game', CTASource.GAME_READER],
  ] as const)('routes %s action to handler with src=%s', (action, src) => {
    const handler = jest.fn();
    manager.storyLinkClickHandler = handler;
    manager.handleCTA({ url: 'https://x', action });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        src,
        data: expect.objectContaining({ url: 'https://x' }),
      })
    );
  });

  it('ignores unknown actions', () => {
    const handler = jest.fn();
    manager.storyLinkClickHandler = handler;
    manager.handleCTA({ url: 'https://x', action: 'nope' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('falls back to Linking when no handler is set', async () => {
    const canOpen = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    manager.handleCTA({ url: 'https://x', action: 'deeplink' });
    await flush();
    expect(canOpen).toHaveBeenCalledWith('https://x');
    expect(open).toHaveBeenCalledWith('https://x');
  });

  it('native handleCTA event reaches the registered handler', () => {
    const handler = jest.fn();
    manager.storyLinkClickHandler = handler;
    // create() subscribed to handleCTA; grab that native handler and fire it.
    const nativeHandler = (NativeSystemEvents.handleCTA as jest.Mock).mock
      .calls[0]![0];
    nativeHandler({ body: { url: 'https://x', action: 'button' } });
    expect(handler).toHaveBeenCalled();
  });
});

describe('product cart (checkout)', () => {
  const cart = { offers: [{ offerId: 'o1', quantity: 2 }], price: '10' };

  const fireCartEvent = (eventName: string, body: any) => {
    const handler = ((NativeGoodsEvents as any)[eventName] as jest.Mock).mock
      .calls[0]![0];
    handler({ body });
  };

  it('answers productCartUpdate via handlers.onUpdate', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const onUpdate = jest.fn().mockResolvedValue(cart);
    manager.setProductCartHandlers({ onUpdate, getState: () => null });
    fireCartEvent('productCartUpdate', {
      requestId: 'cart_1',
      offer: { offerId: 'o1' },
    });
    await flush();
    expect(onUpdate).toHaveBeenCalledWith({ offerId: 'o1' });
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_1',
      cart
    );
  });

  it('answers productCartGetState via handlers.getState', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.setProductCartHandlers({
      onUpdate: () => null,
      getState: () => cart,
    });
    fireCartEvent('productCartGetState', { requestId: 'cart_2' });
    await flush();
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_2',
      cart
    );
  });

  it('resolves null when no handlers are set (native gets an error)', async () => {
    await StoryManager.create({ apiKey: 'k', userId: 'u' });
    fireCartEvent('productCartGetState', { requestId: 'cart_3' });
    await flush();
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_3',
      null
    );
  });

  it('resolves null when a handler throws', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.setProductCartHandlers({
      onUpdate: () => {
        throw new Error('boom');
      },
      getState: () => null,
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fireCartEvent('productCartUpdate', {
      requestId: 'cart_4',
      offer: { offerId: 'o1' },
    });
    await flush();
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_4',
      null
    );
  });

  it('onProductCartClicked subscribes', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const listener = jest.fn();
    manager.onProductCartClicked(listener);
    expect(NativeGoodsEvents.productCartClicked).toHaveBeenCalledWith(listener);
  });
});

describe('goods flow', () => {
  it('fetches goods via callback and commits them to native cache', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.getGoods((skus) =>
      skus.map((sku) => ({
        sku,
        title: 't',
        subtitle: 's',
        imageURL: 'i',
        price: '1',
        oldPrice: '2',
      }))
    );
    // create() subscribed to getGoodsObject; fire it like native would.
    const nativeHandler = (NativeGoodsEvents.getGoodsObject as jest.Mock).mock
      .calls[0]![0];
    nativeHandler({ body: { skus: ['sku1', 'sku2'] } });
    await flush();
    expect(NativeGoodsEvents.addProductToCache).toHaveBeenCalledTimes(2);
    expect(NativeGoodsEvents.addProductToCache).toHaveBeenCalledWith(
      'sku1',
      't',
      's',
      'i',
      '1',
      '2'
    );
    expect(NativeGoodsEvents.commitGoods).toHaveBeenCalled();
  });
});
