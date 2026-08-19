import { subscribeNativeEvent } from '../utils/subscribeNativeEvent';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';
import NativeIamEvents from '../specs/NativeIamEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';
import type { LogEntry } from '../types/StoryManager';

type Listener = (event: any) => void;

const on =
  (module: any, moduleName: string) =>
  (event: string, listener: Listener): void => {
    subscribeNativeEvent(module, moduleName, event, listener);
  };

const onBanner = on(NativeBannerEvents, 'NativeBannerEvents');
const onFeed = on(NativeFeedEvents, 'NativeFeedEvents');
const onGame = on(NativeGameEvents, 'NativeGameEvents');
const onGoods = on(NativeGoodsEvents, 'NativeGoodsEvents');
const onIam = on(NativeIamEvents, 'NativeIamEvents');
const onStories = on(NativeStoriesEvents, 'NativeStoriesEvents');
const onSystem = on(NativeSystemEvents, 'NativeSystemEvents');

/**
 * The listener half of the manager: every `on*` method is a thin subscription
 * to one native event stream. Kept apart from the imperative API so
 * `StoryManager` stays about state and native calls.
 */
export abstract class StoryEvents {
  setLoggingEnabled(enabled: boolean) {
    NativeSystemEvents.setLoggingEnabled(enabled);
  }

  onLog(listener: (entry: LogEntry) => void) {
    onSystem('onLog', (event) => listener(event.body));
  }

  onProductCartClicked(listener: any) {
    onGoods('productCartClicked', listener);
  }

  onGoodItemSelected(listener: any) {
    onGoods('goodItemSelected', listener);
  }

  onStoryReaderWillShow(listener: any) {
    onFeed('storyReaderWillShow', listener);
  }

  onStoryReaderDidClose(listener: any) {
    onFeed('storyReaderDidClose', listener);
  }

  onStoryWidgetEvent(listener: any) {
    onStories('storyWidgetEvent', listener);
  }

  onBannerWidgetEvent(listener: any) {
    onBanner('bannerWidgetEvent', listener);
  }

  onShowStory(listener: any) {
    onStories('showStory', listener);
  }

  onCloseStory(listener: any) {
    onStories('closeStory', listener);
  }

  onShowSlide(listener: any) {
    onStories('showSlide', listener);
  }

  onClickOnButton(listener: any) {
    onStories('clickOnButton', listener);
  }

  onLikeStory(listener: any) {
    onStories('likeStory', listener);
  }

  onDislikeStory(listener: any) {
    onStories('dislikeStory', listener);
  }

  onFavoriteStory(listener: any) {
    onStories('favoriteStory', listener);
  }

  onShareStory(listener: any) {
    onStories('clickOnShareStory', listener);
  }

  onGameEvent(listener: any) {
    for (const name of ['startGame', 'closeGame', 'eventGame', 'gameFailure']) {
      onGame(name, listener);
    }
  }

  onIamEvent(listener: any) {
    for (const name of [
      'showInAppMessage',
      'closeInAppMessage',
      'inAppMessageWidgetEvent',
    ]) {
      onIam(name, listener);
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
      onSystem(name, listener);
    }
  }
}
