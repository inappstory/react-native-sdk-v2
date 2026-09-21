import type { EventSubscription } from 'react-native';
import { subscribeNativeEvent } from '../utils/subscribeNativeEvent';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';
import NativeIamEvents from '../specs/NativeIamEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';
import type { LogEntry } from '../types/StoryManager';
import type { StoryEvent } from '../types/StoryData';
import type { InAppMessageEvent } from '../types/InAppMessageData';
import type { BannerWidgetEvent } from '../types/BannerData';

type Listener = (event: any) => void;
type StoryValueEvent<N extends string> = StoryEvent<
  N,
  { index: number; value: boolean }
>;

/**
 * The listener half of the manager: every `on*` method is a thin subscription
 * to one native event stream. Kept apart from the imperative API so
 * `StoryManager` stays about state and native calls.
 *
 * Every subscription made here is kept on the instance so `destroy()` can drop
 * them: a manager recreated on login/logout must not leave the old one's
 * listeners firing.
 */
export abstract class StoryEvents {
  private subscriptions: EventSubscription[] = [];

  /** Subscribe to one native event and keep the handle for `destroy()`. */
  protected subscribe(
    module: any,
    moduleName: string,
    event: string,
    listener: Listener
  ): void {
    this.subscriptions.push(
      subscribeNativeEvent(module, moduleName, event, listener)
    );
  }

  /**
   * Drop every native subscription this instance made. Call it before
   * replacing a manager (new apiKey/userId/tags), otherwise each new instance
   * adds another listener and one CTA click is handled N times.
   */
  destroy(): void {
    this.subscriptions.forEach((subscription) => subscription.remove());
    this.subscriptions = [];
  }

  private onBanner(event: string, listener: Listener) {
    this.subscribe(NativeBannerEvents, 'NativeBannerEvents', event, listener);
  }

  private onFeed(event: string, listener: Listener) {
    this.subscribe(NativeFeedEvents, 'NativeFeedEvents', event, listener);
  }

  private onGame(event: string, listener: Listener) {
    this.subscribe(NativeGameEvents, 'NativeGameEvents', event, listener);
  }

  private onGoods(event: string, listener: Listener) {
    this.subscribe(NativeGoodsEvents, 'NativeGoodsEvents', event, listener);
  }

  private onIam(event: string, listener: Listener) {
    this.subscribe(NativeIamEvents, 'NativeIamEvents', event, listener);
  }

  private onStories(event: string, listener: Listener) {
    this.subscribe(NativeStoriesEvents, 'NativeStoriesEvents', event, listener);
  }

  private onSystem(event: string, listener: Listener) {
    this.subscribe(NativeSystemEvents, 'NativeSystemEvents', event, listener);
  }
  setLoggingEnabled(enabled: boolean) {
    NativeSystemEvents.setLoggingEnabled(enabled);
  }

  onLog(listener: (entry: LogEntry) => void) {
    this.onSystem('onLog', (event) => listener(event.body));
  }

  onProductCartClicked(listener: any) {
    this.onGoods('productCartClicked', listener);
  }

  onGoodItemSelected(listener: any) {
    this.onGoods('goodItemSelected', listener);
  }

  onStoryReaderWillShow(listener: any) {
    this.onFeed('storyReaderWillShow', listener);
  }

  onStoryReaderDidClose(listener: any) {
    this.onFeed('storyReaderDidClose', listener);
  }

  onStoryWidgetEvent(
    listener: (
      event: StoryEvent<
        'storyWidgetEvent',
        { name: string; data: Record<string, string> }
      >
    ) => void
  ) {
    this.onStories('storyWidgetEvent', listener);
  }

  onBannerWidgetEvent(listener: (event: BannerWidgetEvent) => void) {
    this.onBanner('bannerWidgetEvent', listener);
  }

  onShowStory(
    listener: (event: StoryEvent<'showStory', { action: string }>) => void
  ) {
    this.onStories('showStory', listener);
  }

  onCloseStory(
    listener: (
      event: StoryEvent<'closeStory', { index: number; action: string }>
    ) => void
  ) {
    this.onStories('closeStory', listener);
  }

  onShowSlide(
    listener: (event: StoryEvent<'showSlide', { index: number }>) => void
  ) {
    this.onStories('showSlide', listener);
  }

  onClickOnButton(
    listener: (
      event: StoryEvent<'clickOnButton', { index: number; url: string }>
    ) => void
  ) {
    this.onStories('clickOnButton', listener);
  }

  onLikeStory(listener: (event: StoryValueEvent<'likeStory'>) => void) {
    this.onStories('likeStory', listener);
  }

  onDislikeStory(listener: (event: StoryValueEvent<'dislikeStory'>) => void) {
    this.onStories('dislikeStory', listener);
  }

  onFavoriteStory(listener: (event: StoryValueEvent<'favoriteStory'>) => void) {
    this.onStories('favoriteStory', listener);
  }

  onShareStory(
    listener: (
      event: StoryEvent<'clickOnShareStory', { index: number; payload: string }>
    ) => void
  ) {
    this.onStories('clickOnShareStory', listener);
  }

  onGameEvent(listener: any) {
    for (const name of ['startGame', 'closeGame', 'eventGame', 'gameFailure']) {
      this.onGame(name, listener);
    }
  }

  onIamEvent(listener: (event: InAppMessageEvent) => void) {
    for (const name of [
      'showInAppMessage',
      'closeInAppMessage',
      'inAppMessageWidgetEvent',
    ]) {
      this.onIam(name, listener);
    }
  }

  onFailure(listener: any) {
    for (const name of [
      'sessionFailure',
      'storyFailure',
      'currentStoryFailure',
      'networkFailure',
      'requestFailure',
    ]) {
      this.onSystem(name, listener);
    }
  }
}
