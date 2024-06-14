import React from 'react';
import { View } from 'react-native';

import { StoriesCarousel } from './StoriesCarousel';
//import { StoriesWidget } from '../StoriesWidget';
import InAppStorySDK from 'react-native-inappstory-sdk';
import { useInAppStory } from '../context/InAppStoryContext';
import { useStore } from '../hooks/useStore';
/*const createClick = (viewId, storyIndex) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.InappstorySdkView.Commands.click.toString(),
    [viewId, storyIndex]
  );
*/
export const StoriesList = ({
  storyManager,
  appearanceManager,
  feed,
  onLoadStart,
  onLoadEnd,
  viewModelExporter,
  favoritesOnly,
  renderCell,
}) => {
  const { customStoryView, showFavorites, onFavoriteCell } = useInAppStory();
  //const feeds = getFeeds();
  //const _events = useStore((state) => state.events);
  const updateVersion = useStore((state) => state.update);
  const feedEvents = useStore((state) => state.feeds_default_feed);
  const feedFavoriteEvents = useStore((state) => state.feeds_default_favorites);

  const userID = storyManager.userId;
  //const ref = useRef(null);
  React.useEffect(() => {
    console.log('v', updateVersion);
  }, [updateVersion]);
  const fetchFeed = React.useCallback(async () => {
    storyManager.fetchFeed(feed);
  }, [feed, storyManager]);
  React.useEffect(() => {
    if (!favoritesOnly) {
      onLoadStart();
      if (!feedEvents) return;
      onLoadEnd({
        defaultListLength: feedEvents.length || 0,
        feed,
        list: 'feed',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedEvents]);
  React.useEffect(() => {
    viewModelExporter({
      reload: () => {
        fetchFeed();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    setTimeout(() => {
      if (!favoritesOnly) {
        fetchFeed();
      }
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onPress = React.useCallback((story) => {
    InAppStorySDK.selectStoryCellWith(String(story.storyID));
  }, []);
  const onFavoritePress = React.useCallback(
    (story) => {
      if (typeof story == 'string') {
        onFavoriteCell(feed);
        storyManager.fetchFavorites(feed);
      } else {
        InAppStorySDK.selectFavoriteStoryCellWith(String(story.storyID));
      }
    },
    [onFavoriteCell, feed, storyManager]
  );

  const customFeed = false;
  return (
    <View userID={userID}>
      {!customFeed && customStoryView && (
        <>
          <StoriesCarousel
            feed={feed}
            stories={feedEvents}
            showFavorites={showFavorites}
            favoriteStories={feedFavoriteEvents}
            storyManager={storyManager}
            appearanceManager={appearanceManager}
            onPress={onPress}
            onFavoritePress={onFavoritePress}
            favoritesOnly={favoritesOnly}
            renderCell={renderCell}
          />
        </>
      )}
    </View>
  );
};
