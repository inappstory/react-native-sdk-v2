import React from 'react';
import { StyleSheet, View } from 'react-native';
import InAppStorySDK, { type Story } from '@inappstory/react-native-sdk';
import { StoriesCarousel } from './StoriesCarousel';
import { useStore } from '../hooks/useStore';
import { useEvents } from '../hooks/useEvents';
import { AppearanceManager, StoryManager } from '../index';

export const StoriesList = ({
  storyManager,
  appearanceManager,
  feed = 'default',
  onLoadStart,
  onLoadEnd,
  viewModelExporter,
  showFavorites,
  favoritesOnly,
  renderCell,
  vertical,
}: {
  storyManager: StoryManager;
  appearanceManager: AppearanceManager;
  feed?: any;
  onLoadStart?: any;
  onLoadEnd?: any;
  viewModelExporter?: any;
  showFavorites?: any;
  favoritesOnly?: any;
  renderCell?: (
    story: Story,
    options: { isFirstItem: boolean; isLastItem: boolean }
  ) => React.JSX.Element;
  vertical?: any;
}) => {
  const updateVersion = useStore((state) => state.update);
  const _feedEvents = useStore((state) => state[`feeds_${feed}_feed`]);
  const feedEvents = _feedEvents || [];
  const feedFavoriteEvents = useStore((state) => state.feeds_default_favorites);
  const clearUpdate = useStore((state) => state.clearUpdate);

  const {} = useEvents();
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
        clearUpdate();
        fetchFeed();
      },
      // get storiesListDimensions(): StoriesListDimensions {
      //   return {
      //     totalHeight: appearanceManager.storiesListOptions.layout.height,
      //   }
      // }
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
      if (typeof story === 'string') {
        storyManager.onFavoriteCell(feed);
      } else {
        InAppStorySDK.selectFavoriteStoryCellWith(String(story.storyID));
      }
    },
    [feed, storyManager]
  );

  const styles = StyleSheet.create({
    storyList: {
      paddingTop: appearanceManager?.storiesListOptions.topPadding,
      paddingBottom: appearanceManager?.storiesListOptions.bottomPadding,
    },
  });

  return (
    <View style={styles.storyList}>
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
        horizontal={!vertical}
      />
    </View>
  );
};
