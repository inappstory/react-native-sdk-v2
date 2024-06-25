import * as React from 'react';
import { View, Platform } from 'react-native';
import { StoryComponent } from './StoryComponent';
import { FlatList, Pressable } from 'react-native';
import InAppStorySDK from '@inappstory/react-native-sdk';
import { AppearanceManager, StoryManager } from '../index';

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
  renderCell: any;
  horizontal: any;
}) => {
  const visibleIds = React.useRef<any>([]);
  const flatListRef = React.useRef<any>(null);
  const renderItem = ({ item, index }) => {
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
          isFirstItem={index === 0}
          isLastItem={index === datasource.length - 1}
        />
      );
    } else {
      return (
        <Pressable
          style={{
            width: appearanceManager?.storiesListOptions.card.height + 30,
            height: appearanceManager?.storiesListOptions.card.height,
            // paddingTop: appearanceManager?.storiesListOptions.topPadding,
            paddingRight: appearanceManager?.storiesListOptions.sidePadding,
            flexWrap: 'wrap',
            flexDirection: 'row',
            flex: 1,
            alignSelf: 'baseline',
          }}
          key="pressable"
          onPress={() => onFavoritePress(feed)}
        >
          {story.favorites.map((story) => {
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

  if (typeof stories === 'undefined' || !stories.length)
    return (
      <View
        style={{
          height: appearanceManager?.storiesListOptions.card.height + 7,
        }}
      />
    );
  const onViewableItemsChanged = (items) => {
    const newIDs = items.changed
      .filter((i) => i.isViewable)
      .map((i) => String(i.key))
      .filter((id) => !visibleIds.current.includes(id))
      .filter((f) => f !== 'undefined');
    newIDs.map((id) => {
      visibleIds.current.push(id);
    });
    if (newIDs.length > 0) {
      InAppStorySDK.setVisibleWith(newIDs);
    }
  };
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
      onViewableItemsChanged={onViewableItemsChanged}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, _index) => item.storyID}
      ref={flatListRef}
      onEndReached={() => {
        if (Platform.OS === 'android') flatListRef?.current?.scrollToEnd();
      }}
    />
  );
};

StoriesCarousel.whyDidYouRender = true;
