import * as React from 'react';

import { NativeEventEmitter, NativeModules } from 'react-native';

export const useEvents = () => {
  const [events, setEvents] = React.useState<any>([]);
  React.useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.RNInAppStorySDKModule
    );
    let eventListeners = [];
    const storiesEvents = [
      'storiesLoaded',
      'ugcStoriesLoaded',
      'clickOnStory',
      'showStory',
      'closeStory',
      'clickOnButton',
      'showSlide',
      'likeStory',
      'dislikeStory',
      'favoriteStory',
      'clickOnShareStory',
      'storyWidgetEvent',
    ];
    const gameEvents = [
      'startGame',
      'finishGame',
      'closeGame',
      'eventGame',
      'gameFailure',
      'gameReaderWillShow',
      'gameReaderDidClose',
      'gameComplete',
    ];
    const storyListEvents = [
      'storyListUpdate',
      'storyUpdate',
      'favoritesUpdate',
    ];
    const goodsEvents = ['getGoodsObject'];
    const systemEvents = [
      'storyReaderWillShow',
      'storyReaderDidClose',
      'sessionFailure',
      'storyFailure',
      'currentStoryFailure',
      'networkFailure',
      'requestFailure',
      'favoriteCellDidSelect',
      'editorCellDidSelect',
    ];
    [
      ...storiesEvents,
      ...gameEvents,
      ...storyListEvents,
      ...goodsEvents,
      ...systemEvents,
    ].forEach((eventName) => {
      eventListeners.push(
        eventEmitter.addListener(eventName, (event) => {
          if (eventName == 'getGoodsObject') {
            //FIXME: storyManager.fetchGoods(event);
          }
          setEvents((_events) => {
            _events.push({
              event: eventName,
              data: event,
            });
            return _events;
          });
        })
      );
    });
    // Removes the listener once unmounted
    return () => {
      eventListeners.forEach((eventListener) => {
        eventListener.remove();
      });
    };
  }, []);
  return events;
};
