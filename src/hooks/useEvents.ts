import * as React from 'react';

import { useFeedStore } from './useStore';
import NativeStoryManager, {
  type StoryDTO,
  type StoryListDTO,
} from '../NativeStoryManager';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import { subscribeNativeEvent } from '../helpers/subscribeNativeEvent';

let subscribed = false;

/**
 * Subscribes the feed store to native list events. Runs once per app: the
 * native modules are singletons and the store is global, so the subscription
 * must not be tied to the lifetime of any single StoriesList — unsubscribing
 * on unmount used to leave the remaining lists without updates.
 */
const subscribeFeedStore = () => {
  if (subscribed) return;
  subscribed = true;

  const { addEvent, addToFeed, replaceInFeed, clearFeed } =
    useFeedStore.getState();

  subscribeNativeEvent<StoryListDTO>(
    NativeStoryManager,
    'NativeStoryManager',
    'onStoryListUpdate',
    (data: StoryListDTO) => {
      const feedName = data.feed + '_' + data.list;
      clearFeed(feedName);
      addToFeed(feedName, data.stories);

      addEvent({ event: 'storyListUpdate', data, time: +Date.now() });
    }
  );

  subscribeNativeEvent<StoryDTO>(
    NativeStoryManager,
    'NativeStoryManager',
    'onStoryUpdate',
    (data: StoryDTO) => {
      replaceInFeed(data.feed + '_' + data.list, data);
      addEvent({ event: 'storyUpdate', data, time: +Date.now() });
    }
  );

  subscribeNativeEvent(
    NativeFeedEvents,
    'NativeFeedEvents',
    'storyReaderWillShow',
    (event) => {
      addEvent({
        event: 'storyReaderWillShow',
        data: event,
        time: +Date.now(),
      });
    }
  );
};

export const useEvents = () => {
  React.useEffect(subscribeFeedStore, []);
};
