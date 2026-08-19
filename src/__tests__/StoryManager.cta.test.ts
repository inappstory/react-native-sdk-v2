/// <reference types="jest" />
import { flush } from './helpers/storyManagerMocks';
import { Linking } from 'react-native';
import { StoryManager } from '../core/StoryManager';
import { CTASource } from '../types/CTA';
import NativeSystemEvents from '../specs/NativeSystemEvents';

describe('CTA handling', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it.each([
    [
      'button',
      CTASource.STORY_READER,
      { id: 0, url: 'https://x', index: 0, elementId: '' },
    ],
    [
      'swipe',
      CTASource.STORY_READER,
      { id: 0, url: 'https://x', index: 0, elementId: '' },
    ],
    [
      'deeplink',
      CTASource.STORY_LIST,
      { id: 0, index: 0, isDeeplink: true, url: 'https://x' },
    ],
    ['game', CTASource.GAME_READER, { url: 'https://x', gameInstanceId: '0' }],
  ] as const)(
    'routes %s action to handler with src=%s',
    (action, src, data) => {
      const handler = jest.fn();
      manager.storyLinkClickHandler = handler;
      manager.handleCTA({ url: 'https://x', action });
      expect(handler).toHaveBeenCalledWith({ src, srcRef: 'default', data });
    }
  );

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

describe('storyLinkClickHandler', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it('keeps the previous handler when a non-function is assigned', () => {
    const handler = jest.fn();
    manager.storyLinkClickHandler = handler;
    manager.storyLinkClickHandler = null as any;
    manager.handleCTA({ url: 'https://x', action: 'button' });
    expect(handler).toHaveBeenCalled();
  });

  it('ignores a non-function handler and keeps the Linking fallback', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    manager.storyLinkClickHandler = 'not a function' as any;
    manager.handleCTA({ url: 'https://x', action: 'button' });
    await flush();
    expect(open).toHaveBeenCalledWith('https://x');
  });

  it('does not open an unsupported url', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    manager.handleCTA({ url: 'https://x', action: 'button' });
    await flush();
    expect(open).not.toHaveBeenCalled();
  });

  it('swallows a failing Linking check', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Linking, 'canOpenURL').mockRejectedValue(new Error('no'));
    manager.handleCTA({ url: 'https://x', action: 'button' });
    await flush();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('does nothing when the CTA carries no url', async () => {
    const canOpen = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    manager.handleCTA({ action: 'deeplink' });
    await flush();
    expect(canOpen).not.toHaveBeenCalled();
  });

  it('swallows a throwing handler', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.storyLinkClickHandler = () => {
      throw new Error('boom');
    };
    expect(() =>
      manager.handleCTA({ url: 'https://x', action: 'button' })
    ).not.toThrow();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('passes url and srcRef in the callback payload', () => {
    const handler = jest.fn();
    manager.storyLinkClickHandler = handler;
    manager.handleCTA({ url: 'https://x', action: 'game' });
    expect(handler).toHaveBeenCalledWith({
      src: CTASource.GAME_READER,
      srcRef: 'default',
      data: { url: 'https://x', gameInstanceId: '0' },
    });
  });
});
