import * as React from 'react';
import { StoriesCarousel } from './StoriesCarousel';
import { StoriesList as StoriesListV1 } from 'react-native-ias';
export const StoriesList = ({
  storyManager,
  appearanceManager,
  feed,
  onLoadStart,
  onLoadEnd,
  viewModelExporter,
}) => {
  const [feedData, setFeedData] = React.useState();
  React.useEffect(() => {
    storyManager.fetchFeed(feed).then((_feedData) => {
      setFeedData(_feedData);
    });
  }, [feed, storyManager]);
  React.useEffect(() => {
    console.error('feed stories = ', feedData?.stories);
  }, [feedData]);
  return (
    <>
      <StoriesCarousel
        stories={feedData?.stories}
        storyManager={storyManager}
        appearanceManager={appearanceManager}
      />
      <StoriesListV1
        storyManager={storyManager}
        appearanceManager={appearanceManager}
        feed={feed}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        viewModelExporter={viewModelExporter}
      />
    </>
  );
};
