import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';

import { StoriesCarousel } from './StoriesCarousel';
import { useFeedStore, type StoreState } from '../hooks/useStore';
import { useEvents } from '../hooks/useEvents';
import type { RenderCell, RenderFavoriteCell } from '../data/RenderCell';
import NativeStoryManager from '../NativeStoryManager';
import type { Option, StoryManager } from '../StoryManager';
import type { AppearanceManager } from '../AppearanceManager';

export type StoryCellData = {
  storyID: number;
  slidesCount: number;
  statTitle: string;
};

export type ListLoadStatus = {
  feed: string | number;
  defaultListLength: number;
  favoriteListLength: number;
  success: boolean;
  list: string;
  error: Option<{
    name: string;
    networkStatus: number;
    networkMessage: string;
  }>;
};

export interface StoriesListRef {
  reload: () => void;
}

interface StoriesListProps {
  storyManager: StoryManager;
  appearanceManager: AppearanceManager;
  feed: string;
  showFavorites?: boolean;
  favoritesOnly?: boolean;
  renderCell?: RenderCell;
  renderFavoriteCell?: RenderFavoriteCell;
  vertical?: boolean;
  onLoadStart: () => void;
  onLoadEnd: (listLoadStatus: ListLoadStatus) => void;
}

export const StoriesList = forwardRef<StoriesListRef, StoriesListProps>(
  (props, ref) => {
    const updateVersion = useFeedStore((state) => state.update);
    const feedFavoriteEvents = useFeedStore(
      (state) => state.feeds_default_favorites
    );
    const clearUpdate = useFeedStore((state) => state.clearUpdate);
    const addEvent = useFeedStore((state) => state.addEvent);

    useEvents();

    useImperativeHandle(ref, () => ({
      reload: () => {
        clearUpdate();
        fetchFeed();
      },
    }));

    const selectFeedEvents = React.useCallback(
      (state: StoreState) => {
        return state[`feeds_${props.feed}_feed`];
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const _feedEvents = useFeedStore(selectFeedEvents);
    const feedEvents = _feedEvents || [];

    const feed = props.feed;
    const uniqueId = React.useRef(Math.random().toString(36).slice(2)).current;
    const storyManager = props.storyManager;
    const appearanceManager = props.appearanceManager;
    const showFavorites = props.showFavorites;
    const favoritesOnly = props.favoritesOnly;
    const renderCell = props.renderCell;
    const renderFavoriteCell = props.renderFavoriteCell;
    const vertical = props.vertical;

    const onLoadStart = props.onLoadStart || (() => {});
    const onLoadEnd = props.onLoadEnd;

    //const userID = storyManager.userId;

    React.useEffect(() => {
      updateVersion;
    }, [updateVersion]);
    const createSubscriberList = React.useCallback(async () => {
      storyManager.createSubscriberList(feed, uniqueId);
    }, [feed, storyManager, uniqueId]);
    const fetchFeed = React.useCallback(async () => {
      storyManager.fetchFeed(feed, uniqueId);
    }, [feed, storyManager, uniqueId]);
    const fetchFavoriteFeed = React.useCallback(async () => {
      storyManager.fetchFavorites(feed);
    }, [feed, storyManager]);
    React.useEffect(() => {
      // if (!favoritesOnly) {
      if (updateVersion < 1) {
        onLoadStart();
      }
      if (!feedEvents) return;
      onLoadEnd({
        defaultListLength: feedEvents.length || 0,
        favoriteListLength: feedFavoriteEvents.length || 0,
        feed,
        list: 'feed',
        success: true,
        error: null,
      });
      // }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feedEvents.length, feedFavoriteEvents.length, updateVersion]);

    // React.useEffect(() => {
    // viewModelExporter({
    //     reload: () => {
    //       clearUpdate();
    //       fetchFeed();
    //     }
    //     // get storiesListDimensions(): StoriesListDimensions {
    //     //   return {
    //     //     totalHeight: appearanceManager.storiesListOptions.layout.height,
    //     //   }
    //     // }
    //   });
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);
    React.useEffect(() => {
      setTimeout(() => {
        createSubscriberList();
        if (favoritesOnly) {
          fetchFavoriteFeed();
        } else {
          fetchFeed();
        }
      }, 10);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
      // Carousel with a favorites cell: favorites are a separate native list
      // and must be loaded explicitly, otherwise the cell never shows. Keyed on
      // showFavorites rather than mount — apps flip the flag asynchronously
      // (remote config, feature flag), and then the mount-time load is missed.
      if (!showFavorites || favoritesOnly) return;
      const timer = setTimeout(fetchFavoriteFeed, 10);
      return () => clearTimeout(timer);
    }, [showFavorites, favoritesOnly, fetchFavoriteFeed]);
    const onPress = React.useCallback(
      (story: StoryCellData, index: number) => {
        addEvent({
          event: 'clickOnStory',
          data: {
            id: story.storyID,
            feed,
            index,
            slidesCount: story.slidesCount,
            title: story.statTitle,
          },
          time: +Date.now(),
        });

        NativeStoryManager.selectStoryCellWith(
          String(story.storyID),
          feed,
          uniqueId
        );
      },
      [addEvent, feed, uniqueId]
    );
    const onFavoritePress = React.useCallback(
      (story: string | StoryCellData, index: number) => {
        if (typeof story === 'string') {
          storyManager.onFavoriteCell(feed);
        } else {
          addEvent({
            event: 'clickOnStory',
            data: {
              id: story.storyID,
              feed,
              index,
              slidesCount: story.slidesCount,
              title: story.statTitle,
            },
            time: +Date.now(),
          });

          NativeStoryManager.selectFavoriteStoryCellWith(String(story.storyID));
        }
      },
      [feed, storyManager, addEvent]
    );

    const styles = StyleSheet.create({
      storyList: {
        paddingTop: appearanceManager?.storiesListOptions.topPadding || 16,
        paddingBottom:
          appearanceManager?.storiesListOptions.bottomPadding || 16,
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
          renderFavoriteCell={renderFavoriteCell}
          horizontal={!vertical}
        />
      </View>
    );
  }
);
