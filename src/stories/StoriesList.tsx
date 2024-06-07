import React, { useRef } from 'react';
import { View } from 'react-native';

import { StoriesCarousel } from './StoriesCarousel';
import { StoriesWidget } from '../StoriesWidget';
import InAppStorySDK from 'react-native-inappstory-sdk';
import { useInAppStory } from '../context/InAppStoryContext';
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
  const { customStoryView, showFavorites, feeds, onFavoriteCell } =
    useInAppStory();
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
    if (feeds[feed + '_feed']?.length) {
      onLoadEnd({
        defaultListLength: feeds[feed + '_feed'].length || 0,
        feed,
        list: 'feed',
      });
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds]);
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
      fetchFeed();
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);
  const onViewLoaded = (refId) => {
    ref.current = refId;
  };
  const onPress = React.useCallback((story) => {
    InAppStorySDK.selectStoryCellWith(String(story.storyID));
  }, []);
  const onFavoritePress = React.useCallback(
    (story) => {
      if (typeof story == 'string') {
        onFavoriteCell();
      } else {
        InAppStorySDK.selectFavoriteStoryCellWith(String(story.storyID));
      }
    },
    [onFavoriteCell]
  );

  const customFeed = false;
  return (
    <View userID={userID}>
      {!customFeed && customStoryView && (
        <>
          <StoriesCarousel
            feed={feed}
            stories={feeds[feed + '_feed']}
            showFavorites={showFavorites}
            favoriteStories={feeds['default_favorites']}
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
