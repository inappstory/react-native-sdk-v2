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
}: {
  storyManager?: any;
  appearanceManager?: any;
  feed?: any;
  onLoadStart?: any;
  onLoadEnd?: any;
  viewModelExporter?: any;
  favoritesOnly?: any;
  renderCell?: any;
}) => {
  const { customStoryView, showFavorites, onFavoriteCell } = useInAppStory();
  const updateVersion = useStore((state) => state.update);
  const _feedEvents = useStore((state) => state[`feeds_${feed}_feed`]);
  const feedEvents = _feedEvents || [];
  const feedFavoriteEvents = useStore((state) => state.feeds_default_favorites);

  //const userID = storyManager.userId;
  //const ref = useRef(null);
  React.useEffect(() => {
    updateVersion;
  }, [updateVersion]);
  const fetchFeed = React.useCallback(async () => {
    storyManager.fetchFeed(feed);
  }, [feed, storyManager]);
  React.useEffect(() => {
    if (!favoritesOnly) {
      if (updateVersion < 1) {
        onLoadStart();
      }
      if (!feedEvents || !feedEvents.length) return;
      onLoadEnd({
        defaultListLength: feedEvents.length || 0,
        feed,
        list: 'feed',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedEvents.length, updateVersion]);
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
    InAppStorySDK.getStories(story.feed);
    setTimeout(() => {
      InAppStorySDK.selectStoryCellWith(String(story.storyID));
    }, 100);
  }, []);
  const onFavoritePress = React.useCallback(
    (story) => {
      if (typeof story == 'string') {
        onFavoriteCell();
        storyManager.fetchFavorites(feed);
      } else {
        InAppStorySDK.selectFavoriteStoryCellWith(String(story.storyID));
      }
    },
    [onFavoriteCell, feed, storyManager]
  );

  const customFeed = false;
  return (
    <View>
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
