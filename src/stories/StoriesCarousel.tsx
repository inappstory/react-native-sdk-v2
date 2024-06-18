import * as React from 'react';
import { View, Platform } from 'react-native';
import { StoryComponent } from './StoryComponent';
import { FlatList, Pressable } from 'react-native';
import InAppStorySDK from 'react-native-inappstory-sdk';

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
}: {
  feed: any;
  stories: any;
  storyManager: any;
  appearanceManager: any;
  onPress: any;
  showFavorites: any;
  favoriteStories: any;
  onFavoritePress: any;
  favoritesOnly: any;
  renderCell: any;
}) => {
  const visibleIds = React.useRef<any>([]);
  const flatListRef = React.useRef<any>(null);
  const renderItem = (item) => {
    const story = item.item;
    if (!story.favorites) {
      return (
        <StoryComponent
          key={story.storyID}
          story={story}
          storyManager={storyManager}
          appearanceManager={appearanceManager}
          onPress={!favoritesOnly ? onPress : onFavoritePress}
          renderCell={renderCell}
        />
      );
    } else {
      return (
        <Pressable
          style={{
            width: appearanceManager?.storiesListOptions.card.height + 10,
            height: appearanceManager?.storiesListOptions.card.height,
            paddingTop: appearanceManager?.storiesListOptions.topPadding,
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
                renderCell={renderCell}
              />
            );
          })}
        </Pressable>
      );
    }
  };

  if (typeof stories === 'undefined')
    return (
      <View
        style={{
          height: appearanceManager?.storiesListOptions.card.height + 7,
        }}
      ></View>
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
  return (
    <>
      <FlatList
        horizontal
        data={
          !favoritesOnly
            ? !showFavorites || !favoriteStories?.length
              ? stories
              : [...stories, { favorites: favoriteStories.slice(0, 4) }]
            : favoriteStories
        }
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, _index) => item.storyID}
        ref={flatListRef}
        onEndReached={() => {
          if (Platform.OS === 'android') flatListRef?.current?.scrollToEnd();
        }}
      />
    </>
  );
};

StoriesCarousel.whyDidYouRender = true;
