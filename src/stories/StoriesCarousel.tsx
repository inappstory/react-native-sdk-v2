import * as React from 'react';
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
}) => {
  const visibleIds = React.useRef([]);
  if (typeof stories === 'undefined') return;
  const renderItem = (item) => {
    const story = item.item;
    if (!story.favorites) {
      return (
        <StoryComponent
          key={story.id}
          story={story}
          storyManager={storyManager}
          appearanceManager={appearanceManager}
          onPress={!favoritesOnly ? onPress : onFavoritePress}
        />
      );
    } else {
      return (
        <Pressable
          style={{
            width: appearanceManager?.storiesListOptions.card.height + 30,
            height: appearanceManager?.storiesListOptions.card.height * 2,
            paddingTop: appearanceManager?.storiesListOptions.topPadding,
            flexWrap: 'wrap',
            flexDirection: 'row',
            flex: 1,
            alignSelf: 'baseline',
            top: -5,
          }}
          onPress={() => onFavoritePress(feed)}
        >
          {story.favorites.map((story) => {
            return (
              <StoryComponent
                key={story.id}
                story={story}
                storyManager={storyManager}
                appearanceManager={appearanceManager}
                onPress={() => onFavoritePress(feed)}
                cellSize={appearanceManager?.storiesListOptions.card.height / 2}
                hideTitle={true}
              />
            );
          })}
        </Pressable>
      );
    }
  };
  const onViewableItemsChanged = (items) => {
    const newIDs = items.changed
      .filter((i) => i.isViewable)
      .map((i) => String(i.key))
      .filter((id) => !visibleIds.current.includes(id));
    newIDs.map((id) => {
      visibleIds.current.push(id);
    });
    if (newIDs.length) {
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
              : [...stories, { favorites: favoriteStories }]
            : favoriteStories
        }
        renderItem={(item) => renderItem(item)}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, _index) => item.storyID}
      />
    </>
  );
};
