/// <reference types="jest" />
import {
  emitNative,
  flush,
  listenerCount,
  native,
} from './helpers/storyManagerMocks';
import { StoryManager } from '../core/StoryManager';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';

const config = { apiKey: 'k', userId: 'u' };

describe('subscriptions on a plain `new StoryManager()`', () => {
  it('routes a native CTA to storyLinkClickHandler', () => {
    const manager = new StoryManager(config);
    const handler = jest.fn();
    manager.storyLinkClickHandler = handler;
    emitNative('NativeSystemEvents', 'handleCTA', {
      url: 'https://x',
      action: 'button',
    });
    expect(handler).toHaveBeenCalled();
  });

  it('routes a native goods request to the getGoods callback', async () => {
    const manager = new StoryManager(config);
    const goods = jest.fn(() => []);
    manager.getGoods(goods);
    emitNative('NativeGoodsEvents', 'getGoodsObject', { skus: ['sku1'] });
    await flush();
    expect(goods).toHaveBeenCalledWith(['sku1']);
  });

  it('routes a native product-cart request to the cart handlers', async () => {
    const manager = new StoryManager(config);
    const getState = jest.fn(() => null);
    manager.setProductCartHandlers({ onUpdate: () => null, getState });
    emitNative('NativeGoodsEvents', 'productCartGetState', {
      requestId: 'cart_1',
    });
    await flush();
    expect(getState).toHaveBeenCalled();
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_1',
      null
    );
  });
});

describe('native init', () => {
  it('initialises the native SDK from the constructor alone', async () => {
    const manager = new StoryManager(config);
    await flush();
    expect(manager).toBeInstanceOf(StoryManager);
    expect(native.initWith).toHaveBeenCalledTimes(1);
  });

  it('create() initialises exactly once', async () => {
    await StoryManager.create(config);
    expect(native.initWith).toHaveBeenCalledTimes(1);
  });

  it('create() rejects when the native init fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    native.initWith.mockRejectedValueOnce(new Error('boom'));
    await expect(StoryManager.create(config)).rejects.toThrow('boom');
    error.mockRestore();
  });
});

describe('destroy()', () => {
  it('handles a single CTA once after the previous manager is destroyed', async () => {
    const first = await StoryManager.create(config);
    const firstHandler = jest.fn();
    first.storyLinkClickHandler = firstHandler;
    first.destroy();

    const second = await StoryManager.create(config);
    const secondHandler = jest.fn();
    second.storyLinkClickHandler = secondHandler;

    emitNative('NativeSystemEvents', 'handleCTA', {
      url: 'https://x',
      action: 'button',
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it('drops the `on*` listeners the app registered too', () => {
    const manager = new StoryManager(config);
    const listener = jest.fn();
    manager.onShowStory(listener);
    manager.destroy();
    emitNative('NativeStoriesEvents', 'showStory', { id: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('is idempotent', () => {
    const manager = new StoryManager(config);
    manager.destroy();
    expect(() => manager.destroy()).not.toThrow();
    expect(listenerCount('NativeSystemEvents', 'handleCTA')).toBe(0);
  });

  it('leaves a live manager untouched', () => {
    const kept = new StoryManager(config);
    const doomed = new StoryManager(config);
    const handler = jest.fn();
    kept.storyLinkClickHandler = handler;
    doomed.destroy();
    emitNative('NativeSystemEvents', 'handleCTA', {
      url: 'https://x',
      action: 'button',
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
