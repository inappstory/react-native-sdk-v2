/// <reference types="jest" />
import { flush } from './helpers/storyManagerMocks';
import { StoryManager } from '../core/StoryManager';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';

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

  it('resolves null without reaching a handler when none are set', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await StoryManager.create({ apiKey: 'k', userId: 'u' });
    fireCartEvent('productCartGetState', { requestId: 'cart_3' });
    await flush();
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_3',
      null
    );
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('resolves null and logs when a handler throws', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.setProductCartHandlers({
      onUpdate: () => {
        throw new Error('boom');
      },
      getState: () => null,
    });
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    fireCartEvent('productCartUpdate', {
      requestId: 'cart_4',
      offer: { offerId: 'o1' },
    });
    await flush();
    expect(NativeGoodsEvents.resolveProductCart).toHaveBeenCalledWith(
      'cart_4',
      null
    );
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('onProductCartClicked subscribes', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const listener = jest.fn();
    manager.onProductCartClicked(listener);
    expect(NativeGoodsEvents.productCartClicked).toHaveBeenCalledWith(listener);
  });

  it('onGoodItemSelected subscribes', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const listener = jest.fn();
    manager.onGoodItemSelected(listener);
    expect(NativeGoodsEvents.goodItemSelected).toHaveBeenCalledWith(listener);
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

  it('commits an empty list when the app never registered a goods callback', async () => {
    await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const nativeHandler = (NativeGoodsEvents.getGoodsObject as jest.Mock).mock
      .calls[0]![0];
    expect(() => nativeHandler({ body: { skus: ['sku1'] } })).not.toThrow();
    await flush();
    expect(NativeGoodsEvents.addProductToCache).not.toHaveBeenCalled();
    expect(NativeGoodsEvents.commitGoods).toHaveBeenCalled();
  });

  it('commits an empty list when the callback returns nothing', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.getGoods(() => undefined as any);
    const nativeHandler = (NativeGoodsEvents.getGoodsObject as jest.Mock).mock
      .calls[0]![0];
    nativeHandler({ body: { skus: ['sku1'] } });
    await flush();
    expect(NativeGoodsEvents.commitGoods).toHaveBeenCalled();
  });
});
