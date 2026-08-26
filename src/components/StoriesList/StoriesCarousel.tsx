import { useCallback, useMemo, useRef } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { useEventCallback } from '../../hooks/useEventCallback';
import NativeStoryManager from '../../specs/NativeStoryManager';
import type { RenderCell, RenderFavoriteCell } from '../../types/RenderCell';
import type { Story } from '../../types/Story';
import type { StoriesListAppearance } from './appearance';
import { StoryCell } from './StoryCell';

type FavoritesCell = { favorites: Story[] };
type CarouselItem = Story | FavoritesCell;

const isFavoritesCell = (item: CarouselItem): item is FavoritesCell =>
  'favorites' in item;

const FAVORITES_CELL_KEY = 'favorites_cell';

const FAVORITES_PREVIEW_COUNT = 4;

const LIST_VERTICAL_SLACK = 7;

type ViewToken = { key: string; isViewable: boolean };

const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 0 };

const keyExtractor = (item: CarouselItem) =>
  isFavoritesCell(item) ? FAVORITES_CELL_KEY : String(item.storyID);

type StoriesCarouselProps = {
  feed: string;
  uniqueId: string;
  stories: Story[];
  favoriteStories: Story[];
  listOptions: StoriesListAppearance;
  placeholders?: Record<string, string> | null;
  onPress: (story: Story, index?: number) => void;
  onFavoritePress: (story: Story | string, index?: number) => void;
  showFavorites?: boolean;
  favoritesOnly?: boolean;
  renderCell?: RenderCell;
  renderFavoriteCell?: RenderFavoriteCell;
  horizontal: boolean;
};

export const StoriesCarousel = ({
  feed,
  uniqueId,
  stories,
  favoriteStories,
  listOptions,
  placeholders,
  onPress,
  onFavoritePress,
  showFavorites,
  favoritesOnly,
  renderCell,
  renderFavoriteCell,
  horizontal,
}: StoriesCarouselProps) => {
  const reportedIds = useRef(new Set<string>());
  const flatListRef = useRef<FlatList<CarouselItem>>(null);

  const handleViewableItemsChanged = useEventCallback(
    ({ changed }: { changed: ViewToken[] }) => {
      const newIds = changed
        .filter((token) => token.isViewable)
        .map((token) => String(token.key))
        .filter(
          (id) =>
            id !== 'undefined' &&
            id !== FAVORITES_CELL_KEY &&
            !reportedIds.current.has(id)
        );

      if (newIds.length === 0) return;
      newIds.forEach((id) => reportedIds.current.add(id));
      NativeStoryManager.setVisibleWith(newIds, uniqueId);
    }
  );

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: VIEWABILITY_CONFIG,
      onViewableItemsChanged: handleViewableItemsChanged,
    },
  ]);

  const data = useMemo<CarouselItem[]>(() => {
    if (favoritesOnly) return favoriteStories;
    if (!showFavorites || !favoriteStories.length) return stories;
    return [
      ...stories,
      { favorites: favoriteStories.slice(0, FAVORITES_PREVIEW_COUNT) },
    ];
  }, [favoritesOnly, showFavorites, stories, favoriteStories]);

  const favoritesCellStyle = useMemo(
    () =>
      listOptions.favoriteCard?.customStyles || [
        styles.favoritesCluster,
        {
          width: listOptions.card.height + 30,
          height: listOptions.card.height,
          paddingTop: listOptions.topPadding,
          paddingRight: listOptions.sidePadding,
        },
      ],
    [listOptions]
  );

  const openFavorites = useCallback(
    () => onFavoritePress(feed),
    [onFavoritePress, feed]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<CarouselItem>) => {
      if (!isFavoritesCell(item)) {
        return (
          <StoryCell
            story={item}
            listOptions={listOptions}
            placeholders={placeholders}
            onPress={favoritesOnly ? onFavoritePress : onPress}
            renderCell={renderCell}
            cardIndex={index}
            isFirstItem={index === 0}
            isLastItem={index === data.length - 1}
          />
        );
      }

      if (renderFavoriteCell) {
        return (
          <Pressable onPress={openFavorites}>
            {renderFavoriteCell(item.favorites)}
          </Pressable>
        );
      }

      return (
        <Pressable style={favoritesCellStyle} onPress={openFavorites}>
          {item.favorites.map((story) => (
            <StoryCell
              key={story.storyID}
              story={story}
              listOptions={listOptions}
              placeholders={placeholders}
              onPress={openFavorites}
              cellSize={listOptions.card.height / 2}
              hideTitle={true}
              hideBorder={true}
              renderCell={renderCell}
            />
          ))}
        </Pressable>
      );
    },
    [
      listOptions,
      placeholders,
      favoritesOnly,
      onFavoritePress,
      onPress,
      renderCell,
      renderFavoriteCell,
      favoritesCellStyle,
      openFavorites,
      data.length,
    ]
  );

  const onEndReached = useCallback(() => {
    if (Platform.OS === 'android') flatListRef.current?.scrollToEnd();
  }, []);

  const listStyle = useMemo(
    () => ({ height: listOptions.card.height + LIST_VERTICAL_SLACK }),
    [listOptions.card.height]
  );

  const contentContainerStyle = useMemo(
    () => ({ gap: listOptions.card.gap }),
    [listOptions.card.gap]
  );

  if (data.length === 0) return <View style={listStyle} />;

  return (
    <FlatList
      ref={flatListRef}
      horizontal={horizontal}
      removeClippedSubviews={false}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      showsHorizontalScrollIndicator={false}
      onEndReached={onEndReached}
      style={listStyle}
    />
  );
};

const styles = StyleSheet.create({
  favoritesCluster: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'baseline',
  },
});
