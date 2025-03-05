import * as React from 'react';
import { View, Platform, Dimensions } from 'react-native';
import { StoryComponent } from './StoryComponent';
import { Pressable } from 'react-native';
import { FlashList, MasonryFlashList } from '@shopify/flash-list';
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
  const GapComponent = (
    <View
      style={{ width: appearanceManager.storiesListOptions.card.gap }}
    ></View>
  );

  const screenWidth = Dimensions.get('window').width;

  const renderFavorites = ({ item }) => {
    return (
      <StoryComponent
        key={item.storyID}
        story={item}
        storyManager={storyManager}
        appearanceManager={appearanceManager}
        onPress={!favoritesOnly ? onPress : onFavoritePress}
        renderCell={renderCell}
        favorite
        cellSize={screenWidth / 3.3}
      />
    );
  };
  return !favoritesOnly ? (
    <View style={{ height: appearanceManager?.storiesListOptions.card.height }}>
      <FlashList
        horizontal={horizontal}
        data={datasource}
        renderItem={renderItem}
        ItemSeparatorComponent={() => GapComponent}
        estimatedItemSize={159}
        contentContainerStyle={{
          gap: appearanceManager.storiesListOptions.card.gap,
        }}
        // numColumns={2}
        // columnWrapperStyle={{ gap: appearanceManager.storiesListOptions.card.gap }}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => {
          return item?.storyID || 9999;
        }}
        ref={flatListRef}
        onEndReached={() => {
          if (Platform.OS === 'android') flatListRef?.current?.scrollToEnd();
        }}
      />
    </View>
  ) : (
    <View
      style={{
        width: screenWidth - 20,
        height: 455,
      }}
    >
      <MasonryFlashList
        data={datasource}
        renderItem={renderFavorites}
        estimatedItemSize={159}
        numColumns={3}
        // numColumns={2}
        // columnWrapperStyle={{ gap: appearanceManager.storiesListOptions.card.gap }}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 10,
        }}
        keyExtractor={(item) => {
          return item?.storyID || 9999;
        }}
        //ItemSeparatorComponent={() => GapComponent}
        ref={flatListRef}
      />
    </View>
  );
};

StoriesCarousel.whyDidYouRender = true;
