import * as React from 'react';
import { StoryComponent } from './StoryComponent';
import { ScrollView } from 'react-native';

export const StoriesCarousel = ({
  stories,
  storyManager,
  appearanceManager,
}) => {
  if (typeof stories === 'undefined') return;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {stories.map((story: any) => {
        return (
          <StoryComponent
            story={story}
            storyManager={storyManager}
            appearanceManager={appearanceManager}
          />
        );
      })}
    </ScrollView>
  );
};
