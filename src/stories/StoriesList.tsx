import * as React from 'react';
import { StoriesCarousel } from './StoriesCarousel';
import { StoriesWidget } from '../StoriesWidget';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);
  React.useEffect(() => {
    console.error('feed stories = ', feedData?.stories);
  }, [feedData]);
  const onPress = (story) => {
    //FIXME: fire clickOnStory event {"payload": {"feed": "default", "id": 55507, "index": 0, "isDeeplink": false, "slidesCount": 5, "source": "list", "tags": [], "title": "Добавляем виджеты"}}
    console.error('onPress', story.id);
    InAppStorySDK.showSingle(String(story.id));
    console.error('TODO: generate click');
  };
  return (
    <>
      <StoriesWidget
        color="#32a852"
        style={{ width: 200, height: 100, backgroundColor: 'red', flex: 1 }}
      />

      <StoriesCarousel
        stories={feedData?.stories}
        storyManager={storyManager}
        appearanceManager={appearanceManager}
        onPress={onPress}
      />
    </>
  );
};
