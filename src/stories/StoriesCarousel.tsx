import * as React from 'react';
import { StoryComponent } from './StoryComponent';
import { FlatList } from 'react-native';
import InAppStorySDK from 'react-native-inappstory-sdk';

export const StoriesCarousel = ({
  stories,
  storyManager,
  appearanceManager,
  onPress,
}) => {
  const visibleIds = React.useRef([]);
  if (typeof stories === 'undefined') return;
  const renderItem = (item) => {
    const story = item.item;
    return (
      <StoryComponent
        key={story.id}
        story={story}
        storyManager={storyManager}
        appearanceManager={appearanceManager}
        onPress={onPress}
      />
    );
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
    <FlatList
      style={{ width: 100 }}
      horizontal
      data={stories}
      renderItem={(item) => renderItem(item)}
      onViewableItemsChanged={onViewableItemsChanged}
      //keyExtractor={(item, index) => index}
    />
  );
};
