/// <reference types="jest" />
import './helpers/storyManagerMocks';
import { StoryManager } from '../core/StoryManager';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeIamEvents from '../specs/NativeIamEvents';

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

  it('forwards each listener on the same event to native', () => {
    const l1 = jest.fn();
    const l2 = jest.fn();
    manager.onStoryReaderWillShow(l1);
    manager.onStoryReaderWillShow(l2);
    expect(NativeFeedEvents.storyReaderWillShow).toHaveBeenCalledTimes(2);
    expect(NativeFeedEvents.storyReaderWillShow).toHaveBeenNthCalledWith(1, l1);
    expect(NativeFeedEvents.storyReaderWillShow).toHaveBeenNthCalledWith(2, l2);
  });
});

describe('logger', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it('setLoggingEnabled passes the flag straight to native', () => {
    manager.setLoggingEnabled(true);
    expect(NativeSystemEvents.setLoggingEnabled).toHaveBeenCalledWith(true);
    manager.setLoggingEnabled(false);
    expect(NativeSystemEvents.setLoggingEnabled).toHaveBeenLastCalledWith(
      false
    );
  });

  it('onLog subscribes and hands the listener the unwrapped body', () => {
    const listener = jest.fn();
    manager.onLog(listener);
    expect(NativeSystemEvents.onLog).toHaveBeenCalled();
    const nativeHandler = (NativeSystemEvents.onLog as jest.Mock).mock
      .calls[0]![0];
    const entry = { level: 'error', message: 'boom' };
    nativeHandler({ body: entry });
    expect(listener).toHaveBeenCalledWith(entry);
  });
});

describe('remaining event subscriptions', () => {
  it.each([
    ['onShowStory', 'showStory'],
    ['onCloseStory', 'closeStory'],
    ['onShowSlide', 'showSlide'],
    ['onClickOnButton', 'clickOnButton'],
    ['onLikeStory', 'likeStory'],
    ['onDislikeStory', 'dislikeStory'],
    ['onFavoriteStory', 'favoriteStory'],
    ['onShareStory', 'clickOnShareStory'],
  ] as const)('%s subscribes to %s', async (method, event) => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const listener = jest.fn();
    (manager as any)[method](listener);
    expect((NativeStoriesEvents as any)[event]).toHaveBeenCalledWith(listener);
  });

  it('onStoryReaderWillShow and onBannerWidgetEvent subscribe', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const listener = jest.fn();
    manager.onStoryReaderWillShow(listener);
    manager.onBannerWidgetEvent(listener);
    expect(NativeFeedEvents.storyReaderWillShow).toHaveBeenCalledWith(listener);
    expect(NativeBannerEvents.bannerWidgetEvent).toHaveBeenCalledWith(listener);
  });
});
