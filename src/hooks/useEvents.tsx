/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';

import { NativeEventEmitter, NativeModules } from 'react-native';

export const useEvents = ({ onFavoriteCell }) => {
  const [events, setEvents] = React.useState<any>([]);
  //const [loading, setLoading] = React.useState(false);
  const [_feeds, setFeeds] = React.useState<any>({});
  const [readerOpen, setReaderOpen] = React.useState<any>(false);
  const imageCoverCache = React.useRef<any>({});
  const videoCoverCache = React.useRef<any>({});

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
      'favoritesUpdate',
      'scrollUpdate',
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
          //if (!event.length) return;
          if (eventName == 'storyReaderWillShow') {
            setReaderOpen(true);
          }
          if (eventName == 'storyReaderDidClose' || eventName == 'closeStory') {
            setReaderOpen(false);
          }
          if (eventName == 'getGoodsObject') {
            //setLoading(true)
            //FIXME: storyManager.fetchGoods(event);
          }
          if (eventName == 'favoriteCellDidSelect') {
            onFavoriteCell();
          }
          if (eventName == 'favoriteStory') {
            setFeeds((feeds) => {
              Object.keys(feeds).map((feedName) => {
                var [feed, type] = feedName.split('_');
                if (type == 'favorites') {
                  const idx = feeds[feedName].findIndex(
                    (f) => f.storyID == event.storyID
                  );
                  if (idx !== -1 && !event.favorite) {
                    feeds[feedName].splice(idx, 1);
                  }
                  if (idx === -1 && event.favorite) {
                    const storyFromList = feeds[`${feed}_feed`]?.find(
                      (f) => f.storyID == event.storyID
                    );
                    if (storyFromList) {
                      feeds[feedName].unshift(storyFromList);
                    } else {
                      console.error('failed to find story');
                    }
                  }
                }
              });
              return { ...feeds };
            });
          }
          if (eventName == 'storyListUpdate') {
            console.error('SLU', event);
            const feedName = event.feed + '_' + event.list;
            setFeeds((feeds) => {
              feeds[feedName] = [];
              event.stories.map((story) => {
                if (
                  feeds[feedName].findIndex(
                    (s) => s.storyID == story.storyID
                  ) === -1
                ) {
                  feeds[feedName].push({
                    ...story,
                    coverImagePath:
                      imageCoverCache.current[story.storyID] ||
                      story.coverImagePath,
                    coverVideoPath:
                      videoCoverCache.current[story.storyID] ||
                      story.coverVideoPath,
                  });
                }
              });
              return { ...feeds };
            });
          }
          if (eventName == 'storyUpdate') {
            console.error('storyUpdate', event);
            const feedName = event.feed + '_' + event.list;
            setFeeds((feeds) => {
              const eventIdx = feeds[feedName].findIndex(
                (s) => s.storyID == event.storyID
              );
              if (event.coverImagePath) {
                imageCoverCache.current[event.storyID] = event.coverImagePath;
              }
              if (event.coverVideoPath) {
                videoCoverCache.current[event.storyID] = event.coverVideoPath;
              }
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
              time: +Date.now(),
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
  return { events, feeds: _feeds, readerOpen, onFavoriteCell };
};
