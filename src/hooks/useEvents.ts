/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';

import { BackHandler, NativeEventEmitter, NativeModules } from 'react-native';
import { useStore } from './useStore';
import InAppStorySDK from '@inappstory/react-native-sdk';
import { nativeEventList } from '../nativeEventList';
let init = false;
export const useEvents = () => {
  const addEvent = useStore((state) => state.addEvent);
  const addToFeed = useStore((state) => state.addToFeed);
  const replaceInFeed = useStore((state) => state.replaceInFeed);
  const setFavorite = useStore((state) => state.setFavorite);
  const clearFeed = useStore((state) => state.clearFeed);

  const [readerOpen, setReaderOpen] = React.useState<any>(false);
  const imageCoverCache = React.useRef<any>({});
  const videoCoverCache = React.useRef<any>({});

  React.useEffect(() => {
    console.log('useEvents init: ', init);
    if (init) return;
    init = true;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        (async () => {
          const handled: boolean = await InAppStorySDK.handleHardwareBackPress();
          console.log('hardwareBackPress handled:', handled);
        })();
        return true;
      }
    );

    const eventEmitter = new NativeEventEmitter(
      NativeModules.RNInAppStorySDKModule
    );
    let eventListeners: Array<any> = [];

    nativeEventList.forEach((eventName) => {
      eventListeners.push(
        eventEmitter.addListener(eventName, async (event) => {
          if (eventName == 'storyReaderWillShow') {
            setReaderOpen(true);
          }
          if (eventName == 'storyReaderDidClose' || eventName == 'closeStory') {
            setReaderOpen(false);
          }
          if (eventName == 'favoriteCellDidSelect') {
            //onFavoriteCell();
          }
          if (eventName == 'favoriteStory') {
            setFavorite(event.storyID, event.favorite);
            if (!event.favorite) {
              InAppStorySDK.getFavoriteStories('default');
            }
          }
          if (eventName == 'storyListUpdate') {
            const feedName = event.feed + '_' + event.list;
            clearFeed(feedName);
            addToFeed(feedName, event.stories);
          }
          if (eventName == 'storyUpdate') {
            const feedName = event.feed + '_' + event.list;
            if (event.coverImagePath) {
              imageCoverCache.current[event.storyID] = event.coverImagePath;
            }
            if (event.coverVideoPath) {
              videoCoverCache.current[event.storyID] = event.coverVideoPath;
            }
            replaceInFeed(feedName, event);
          }
          addEvent({
            event: eventName,
            data: event,
            time: +Date.now(),
          });
        })
      );
    });
    // Removes the listener once unmounted
    return () => {
      eventListeners.forEach((eventListener) => {
        eventListener.remove();
      });
      subscription.remove();
      init = false;
    };
  }, []);
  return { readerOpen };
};
