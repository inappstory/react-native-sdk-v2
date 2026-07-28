import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { View } from 'react-native';

import type { AppearanceManager } from '../../core/AppearanceManager';
import type { Option, StoryManager } from '../../core/StoryManager';
import { useEventCallback } from '../../hooks/useEventCallback';
import { useFeedLoader } from '../../hooks/useFeedLoader';
import { useFeedStore } from '../../hooks/useFeedStore';
import { useNativeFeedEvents } from '../../hooks/useNativeFeedEvents';
import NativeStoryManager from '../../specs/NativeStoryManager';
import type { RenderCell, RenderFavoriteCell } from '../../types/RenderCell';
import type { Story } from '../../types/Story';
import { getListAppearance } from './appearance';
import { StoriesCarousel } from './StoriesCarousel';

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

/** Stable identity, so an unloaded feed does not retrigger store subscribers. */
const EMPTY_STORIES: Story[] = [];

const DEFAULT_VERTICAL_PADDING = 16;

export const StoriesList = forwardRef<StoriesListRef, StoriesListProps>(
  (
    {
      storyManager,
      appearanceManager,
      feed,
      showFavorites = false,
      favoritesOnly = false,
      renderCell,
      renderFavoriteCell,
      vertical = false,
      onLoadStart,
      onLoadEnd,
    },
    ref
  ) => {
    useNativeFeedEvents();

    const stories = useFeedStore(
      (state) =>
        (state[`feeds_${feed}_feed`] as Story[] | undefined) ?? EMPTY_STORIES
    );
    const favoriteStories = useFeedStore(
      (state) => state.feeds_default_favorites as Story[]
    );
    const updateVersion = useFeedStore((state) => state.update);
    const addEvent = useFeedStore((state) => state.addEvent);

    const { uniqueId, reload } = useFeedLoader({
      storyManager,
      feed,
      favoritesOnly,
      showFavorites,
    });

    useImperativeHandle(ref, () => ({ reload }), [reload]);
    const notifyLoadStart = useEventCallback(() => onLoadStart?.());
    const notifyLoadEnd = useEventCallback((status: ListLoadStatus) =>
      onLoadEnd(status)
    );

    useEffect(() => {
      if (updateVersion < 1) {
        notifyLoadStart();
      }
      notifyLoadEnd({
        feed,
        list: 'feed',
        defaultListLength: stories.length,
        favoriteListLength: favoriteStories.length,
        success: true,
        error: null,
      });
    }, [
      stories.length,
      favoriteStories.length,
      updateVersion,
      feed,
      notifyLoadStart,
      notifyLoadEnd,
    ]);

    const trackClick = useCallback(
      (story: Story, index?: number) => {
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
      },
      [addEvent, feed]
    );

    const onPress = useCallback(
      (story: Story, index?: number) => {
        trackClick(story, index);
        NativeStoryManager.selectStoryCellWith(
          String(story.storyID),
          feed,
          uniqueId
        );
      },
      [trackClick, feed, uniqueId]
    );

    const onFavoritePress = useCallback(
      (story: Story | string, index?: number) => {
        if (typeof story === 'string') {
          storyManager.favoriteCellPressed(feed);
          return;
        }
        trackClick(story, index);
        NativeStoryManager.selectFavoriteStoryCellWith(String(story.storyID));
      },
      [trackClick, storyManager, feed]
    );

    const listOptions = getListAppearance(appearanceManager);

    const containerStyle = useMemo(
      () => ({
        paddingTop: listOptions.topPadding || DEFAULT_VERTICAL_PADDING,
        paddingBottom: listOptions.bottomPadding || DEFAULT_VERTICAL_PADDING,
      }),
      [listOptions.topPadding, listOptions.bottomPadding]
    );

    return (
      <View style={containerStyle}>
        <StoriesCarousel
          feed={feed}
          uniqueId={uniqueId}
          stories={stories}
          favoriteStories={favoriteStories}
          listOptions={listOptions}
          placeholders={storyManager.placeholders}
          showFavorites={showFavorites}
          favoritesOnly={favoritesOnly}
          onPress={onPress}
          onFavoritePress={onFavoritePress}
          renderCell={renderCell}
          renderFavoriteCell={renderFavoriteCell}
          horizontal={!vertical}
        />
      </View>
    );
  }
);

StoriesList.displayName = 'StoriesList';
