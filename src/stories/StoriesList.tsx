import React, { useRef } from 'react';
import { View } from 'react-native';

import { StoriesCarousel } from './StoriesCarousel';
import { StoriesWidget } from '../StoriesWidget';
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
}) => {
  const { customStoryView, showFavorites, onFavoriteCell } = useInAppStory();
  //const feeds = getFeeds();
  //const _events = useStore((state) => state.events);
  const feedEvents = useStore((state) => state['feeds_default_feed']);
  const feedFavoriteEvents = useStore(
    (state) => state['feeds_default_favorites']
  );

  const tags = storyManager.tags;
  const placeholders = storyManager.placeholders;
  const imagePlaceholders = storyManager.imagePlaceholders;
  const userID = storyManager.userId;
  const ref = useRef(null);
  //const [loading, setLoading] = React.useState(false);
  const fetchFeed = React.useCallback(async () => {
    console.log('fetch feed', feed);
    storyManager.fetchFeed(feed);
  }, [feed, storyManager]);
  React.useEffect(() => {
    onLoadStart();
    if (!feedEvents) return;
    onLoadEnd({
      defaultListLength: feedEvents.length || 0,
      feed,
      list: 'feed',
    });
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
      console.error('timeout ', feed);
      fetchFeed();
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onViewLoaded = (refId) => {
    ref.current = refId;
  };
  const onPress = React.useCallback((story) => {
    InAppStorySDK.selectStoryCellWith(String(story.storyID));
  }, []);
  const onFavoritePress = React.useCallback(
    (story) => {
      if (typeof story == 'string') {
        onFavoriteCell(feed);
      } else {
        console.error('clicking on favorites', story.storyID);
        InAppStorySDK.selectFavoriteStoryCellWith(String(story.storyID));
      }
    },
    [onFavoriteCell, feed]
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
          />
        </>
      )}
      {!customFeed && !customStoryView && (
        <StoriesWidget
          feed={feed}
          onViewLoaded={onViewLoaded}
          tags={tags}
          placeholders={placeholders}
          imagePlaceholders={imagePlaceholders}
          userID={userID}
          favoritesOnly={favoritesOnly}
        />
      )}
    </View>
  );
};
