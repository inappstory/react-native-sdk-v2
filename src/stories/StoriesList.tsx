import * as React from 'react';
import { StoriesCarousel } from './StoriesCarousel';
export const StoriesList = ({
  storyManager,
  appearanceManager,
  feed,
  onLoadStart,
  onLoadEnd,
  viewModelExporter,
}) => {
  const [feedData, setFeedData] = React.useState();
  const fetchFeed = React.useCallback(() => {
    onLoadStart();
    storyManager.fetchFeed(feed).then((_feedData) => {
      setFeedData(_feedData);
      onLoadEnd({ defaultListLength: _feedData?.stories.length, feed });
    });
  }, [feed, onLoadEnd, onLoadStart, storyManager]);
  React.useEffect(() => {
    viewModelExporter({
      reload: () => {
        fetchFeed();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    fetchFeed();
  }, [feed, storyManager, fetchFeed]);
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
    </>
  );
};
