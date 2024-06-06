import * as React from 'react';
import { StoryComponent } from './StoryComponent';
import { FlatList } from 'react-native';
import InAppStorySDK from 'react-native-inappstory-sdk';

export const StoriesCarousel = ({
  stories,
  storyManager,
  appearanceManager,
  onPress,
  showFavorites,
  favoriteStories,
  onFavoritePress,
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
          onPress={onPress}
        />
      );
    } else {
      return story.favorites.map((story) => {
        return (
          <StoryComponent
            key={story.id}
            story={story}
            storyManager={storyManager}
            appearanceManager={appearanceManager}
            onPress={onFavoritePress}
          />
        );
      });
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
          !showFavorites || !favoriteStories.length
            ? stories
            : [...stories, { favorites: favoriteStories }]
        }
        renderItem={(item) => renderItem(item)}
        onViewableItemsChanged={onViewableItemsChanged}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, _index) => item.storyID}
      />
    </>
  );
};
