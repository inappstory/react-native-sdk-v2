/// <reference types="jest" />
import { NativeEventEmitter, NativeModules } from 'react-native';
import { generateId } from '../helpers/idGenerator';
import { isFunction } from '../helpers/isFunction';
import { subscribeNativeEvent } from '../helpers/subscribeNativeEvent';

describe('generateId', () => {
  it('returns a non-empty base36 string', () => {
    expect(generateId()).toMatch(/^[0-9a-z]+$/);
  });

  it('does not collide across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, generateId));
    expect(ids.size).toBe(1000);
  });
});

describe('isFunction', () => {
  it.each([
    [() => {}, true],
    [function named() {}, true],
    [class C {}, true],
    [null, false],
    [undefined, false],
    [{}, false],
    ['fn', false],
    [0, false],
  ])('%p -> %p', (value, expected) => {
    expect(isFunction(value)).toBe(expected);
  });
});

describe('subscribeNativeEvent', () => {
  // Records which emitter instance served each subscription, so the module
  // level emitter cache can be asserted.
  const addListener = jest.fn(function (this: any, event: string) {
    return { remove: jest.fn(), event, emitter: this };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // NativeEventEmitter refuses a null native module on iOS.
    for (const name of ['LegacyMod', 'LegacyMod2', 'CachedMod', 'OtherMod']) {
      (NativeModules as any)[name] = {
        addListener: jest.fn(),
        removeListeners: jest.fn(),
      };
    }
    jest
      .spyOn(NativeEventEmitter.prototype, 'addListener')
      .mockImplementation(addListener as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls the module method directly when the new arch exposes one', () => {
    const subscription = { remove: jest.fn() };
    const module = { onThing: jest.fn(() => subscription) };
    const handler = jest.fn();

    expect(subscribeNativeEvent(module, 'Mod', 'onThing', handler)).toBe(
      subscription
    );
    expect(module.onThing).toHaveBeenCalledWith(handler);
    expect(addListener).not.toHaveBeenCalled();
  });

  it('falls back to NativeEventEmitter when the module has no such method', () => {
    const handler = jest.fn();
    subscribeNativeEvent({}, 'LegacyMod', 'onThing', handler);
    expect(addListener).toHaveBeenCalledWith('onThing', handler);
  });

  it('falls back when the property exists but is not callable', () => {
    subscribeNativeEvent(
      { onThing: 'not a function' },
      'LegacyMod2',
      'onThing',
      jest.fn()
    );
    expect(addListener).toHaveBeenCalled();
  });

  it('reuses one emitter per module name and one per module', () => {
    const a: any = subscribeNativeEvent({}, 'CachedMod', 'a', jest.fn());
    const b: any = subscribeNativeEvent({}, 'CachedMod', 'b', jest.fn());
    const other: any = subscribeNativeEvent({}, 'OtherMod', 'a', jest.fn());
    expect(a.emitter).toBe(b.emitter);
    expect(other.emitter).not.toBe(a.emitter);
  });
});
