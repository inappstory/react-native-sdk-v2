import * as React from 'react';

import { useFeedStore } from './useFeedStore';
import NativeStoryManager, {
  type StoryDTO,
  type StoryListDTO,
} from '../specs/NativeStoryManager';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import { subscribeNativeEvent } from '../utils/subscribeNativeEvent';

let subscribed = false;

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

export const useNativeFeedEvents = () => {
  React.useEffect(subscribeFeedStore, []);
};
