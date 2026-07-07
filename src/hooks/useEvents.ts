/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';

import { type EventSubscription } from 'react-native';
import { useFeedStore } from './useStore';
import NativeStoryManager, {
  type StoryDTO,
  type StoryListDTO,
} from '../NativeStoryManager';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import { subscribeNativeEvent } from '../helpers/subscribeNativeEvent';

let init = false;

export const useEvents = () => {
  const storyListUpdateSubscription = React.useRef<null | EventSubscription>(
    null
  );
  const storyUpdateSubscription = React.useRef<null | EventSubscription>(null);
  const storyReaderWillShowSubscription =
    React.useRef<null | EventSubscription>(null);
  const showStorySubscription = React.useRef<null | EventSubscription>(null);

  const addEvent = useFeedStore((state) => state.addEvent);
  const addToFeed = useFeedStore((state) => state.addToFeed);
  const replaceInFeed = useFeedStore((state) => state.replaceInFeed);
  const clearFeed = useFeedStore((state) => state.clearFeed);

  const [readerOpen, setReaderOpen] = React.useState<any>(false);
  const imageCoverCache = React.useRef<any>({});
  const videoCoverCache = React.useRef<any>({});

  React.useEffect(() => {
    if (init) return;
    init = true;

    storyListUpdateSubscription.current = subscribeNativeEvent<StoryListDTO>(
      NativeStoryManager,
      'NativeStoryManager',
      'onStoryListUpdate',
      (data: StoryListDTO) => {
        const feedName = data.feed + '_' + data.list;
        clearFeed(feedName);
        addToFeed(feedName, data.stories);

        addEvent({
          event: 'storyListUpdate',
          data: data,
          time: +Date.now(),
        });
      }
    );

    storyUpdateSubscription.current = subscribeNativeEvent<StoryDTO>(
      NativeStoryManager,
      'NativeStoryManager',
      'onStoryUpdate',
      (data: StoryDTO) => {
        const feedName = data.feed + '_' + data.list;
        if (data.coverImagePath) {
          imageCoverCache.current[data.storyID] = data.coverImagePath;
        }
        if (data.coverVideoPath) {
          videoCoverCache.current[data.storyID] = data.coverVideoPath;
        }
        replaceInFeed(feedName, data);
        addEvent({
          event: 'storyUpdate',
          data: data,
          time: +Date.now(),
        });
      }
    );

    storyReaderWillShowSubscription.current = subscribeNativeEvent(
      NativeFeedEvents,
      'NativeFeedEvents',
      'storyReaderWillShow',
      (event) => {
        console.log('storyReaderWillShow');
        setReaderOpen(true);
        addEvent({
          event: 'storyReaderWillShow',
          data: event,
          time: +Date.now(),
        });
      }
    );

    // ponytail: bulk event-name listener wiring was parked here (commented
    // forEach over storiesEvents/gameEvents/etc). Removed as dead; restore
    // from git history when implementing the unified event subscription.

    // Removes the listener once unmounted
    return () => {
      storyListUpdateSubscription.current?.remove();
      storyListUpdateSubscription.current = null;
      storyUpdateSubscription.current?.remove();
      storyUpdateSubscription.current = null;

      storyReaderWillShowSubscription.current?.remove();
      storyReaderWillShowSubscription.current = null;

      showStorySubscription.current?.remove();
      showStorySubscription.current = null;

      // eventListeners.forEach((eventListener) => {
      //   eventListener.remove();
      // });
      init = false;
    };
  }, []);
  return { readerOpen };
};
