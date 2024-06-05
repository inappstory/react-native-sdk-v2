import * as React from 'react';

import { NativeEventEmitter, NativeModules } from 'react-native';

export const useEvents = () => {
  const [events, setEvents] = React.useState<any>([]);
  //const [loading, setLoading] = React.useState(false);
  const [_feeds, setFeeds] = React.useState<any>({});
  React.useEffect(() => {
    console.log('set Listeners');
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
      'customShare',
      'onActionWith',
      'storiesDidUpdated',
      'goodItemSelected',
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
          console.log('event:', eventName);
          //setLoading(true)
          if (eventName == 'getGoodsObject') {
            //FIXME: storyManager.fetchGoods(event);
          }
          if (eventName == 'storyListUpdate') {
            setFeeds((feeds) => {
              const feedName = event[0].feed + '_' + event[0].list;
              console.log('feedName', feedName);
              feeds[feedName] = [];
              event.map((story) => {
                if (
                  feeds[feedName].findIndex(
                    (s) => s.storyID == story.storyID
                  ) === -1
                ) {
                  feeds[feedName].push(story);
                }
              });
              return { ...feeds };
            });
          }
          if (eventName == 'storyUpdate') {
            const feedName = event.feed + '_' + event.list;
            setFeeds((feeds) => {
              if (feeds[feedName]) console.log('A?', feedName);
              const eventIdx = feeds[feedName].findIndex(
                (s) => s.storyID == event.storyID
              );
              if (eventIdx === -1) {
                feeds[feedName].push(event);
              } else {
                feeds[feedName][eventIdx] = event;
              }
              //console.error('event index = ', eventIdx, event);
              return { ...feeds };
            });
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
  return { events, feeds: _feeds };
};
