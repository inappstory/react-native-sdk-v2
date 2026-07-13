import * as React from 'react';
import { View, Platform } from 'react-native';
import { StoryComponent } from './StoryComponent';
import { Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import type { StoryManager } from '../StoryManager';
import type { AppearanceManager } from '../AppearanceManager';
import type { RenderCell, RenderFavoriteCell } from '../data/RenderCell';
import NativeStoryManager from '../NativeStoryManager';
import type { Story } from '../data/Story';

export const StoriesCarousel = ({
  feed,
  stories,
  storyManager,
  appearanceManager,
  onPress,
  showFavorites,
  favoriteStories,
  onFavoritePress,
  favoritesOnly,
  renderCell,
  renderFavoriteCell,
  horizontal,
}: {
  feed: any;
  stories: any;
  storyManager: StoryManager;
  appearanceManager: AppearanceManager;
  onPress: any;
  showFavorites: any;
  favoriteStories: any;
  onFavoritePress: any;
  favoritesOnly: any;
  renderCell: RenderCell | undefined;
  renderFavoriteCell: RenderFavoriteCell | undefined;
  horizontal: any;
}) => {
  const visibleIds = React.useRef<any>([]);
  const flatListRef = React.useRef<any>(null);

  const onViewableItemsChanged = (info: {
    changed: Array<{ isViewable: boolean; key: string }>;
  }) => {
    const newIDs = info.changed
      .filter((i) => i.isViewable)
      .map((i) => String(i.key))
      .filter((id) => !visibleIds.current.includes(id))
      .filter((f) => f !== 'undefined')
      // The favorites cell is not a story — never report it as a visible
      // preview (native setVisibleWith does parseInt on the ids).
      .filter((f) => f !== 'favorites_cell');
    newIDs.map((id) => {
      visibleIds.current.push(id);
    });
    if (newIDs.length > 0) {
      NativeStoryManager.setVisibleWith(newIDs);
    }
  };

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 0,
  };
  const viewabilityConfigCallbackPairs = React.useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const story = item;
    if (!story.favorites) {
      return (
        <StoryComponent
          key={story.storyID}
          story={story}
          storyManager={storyManager}
          appearanceManager={appearanceManager}
          onPress={!favoritesOnly ? onPress : onFavoritePress}
          renderCell={renderCell}
          cardIndex={index}
          isFirstItem={index === 0}
          isLastItem={index === datasource.length - 1}
        />
      );
    } else {
      if (renderFavoriteCell) {
        return (
          <Pressable
            onPress={() => onFavoritePress(feed)}
            key="favoriteCellPressable"
          >
            {renderFavoriteCell(story.favorites)}
          </Pressable>
        );
      }
      return (
        <Pressable
          style={
            appearanceManager?.storiesListOptions.favoriteCard
              ?.customStyles || {
              width: appearanceManager?.storiesListOptions.card.height + 30,
              height: appearanceManager?.storiesListOptions.card.height,
              paddingTop: appearanceManager?.storiesListOptions.topPadding,
              paddingRight: appearanceManager?.storiesListOptions.sidePadding,
              flexWrap: 'wrap',
              flexDirection: 'row',
              flex: 1,
              alignSelf: 'baseline',
            }
          }
          key="pressable_favorites"
          onPress={() => onFavoritePress(feed)}
        >
          {story.favorites.map((story: Story) => {
            return (
              <StoryComponent
                key={story.storyID}
                story={story}
                storyManager={storyManager}
                appearanceManager={appearanceManager}
                onPress={() => onFavoritePress(feed)}
                cellSize={appearanceManager?.storiesListOptions.card.height / 2}
                hideTitle={true}
                hideBorder={true}
                renderCell={renderCell}
              />
            );
          })}
        </Pressable>
      );
    }
  };

  let emptyList = false;
  if (typeof stories === 'undefined' || !stories.length) {
    emptyList = true;
  }
  if (emptyList && showFavorites && favoriteStories?.length) {
    emptyList = false;
  }

  if (emptyList)
    return (
      <View
        style={{
          height: appearanceManager?.storiesListOptions.card.height + 7,
        }}
      />
    );

  let datasource: any = [];
  if (favoritesOnly) {
    datasource = favoriteStories;
  } else {
    if (!showFavorites || !favoriteStories?.length) {
      datasource = stories;
    } else {
      datasource = [...stories, { favorites: favoriteStories.slice(0, 4) }];
    }
  }
  return (
    <FlatList
      horizontal={horizontal}
      data={datasource}
      renderItem={renderItem}
      contentContainerStyle={{
        gap: appearanceManager.storiesListOptions.card.gap,
      }}
      // numColumns={2}
      // columnWrapperStyle={{ gap: appearanceManager.storiesListOptions.card.gap }}
      // onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, _index) =>
        item.favorites ? 'favorites_cell' : String(item.storyID)
      }
      ref={flatListRef}
      onEndReached={() => {
        if (Platform.OS === 'android') flatListRef?.current?.scrollToEnd();
      }}
      style={{
        height: appearanceManager?.storiesListOptions.card.height + 7,
      }}
    />
  );
};
