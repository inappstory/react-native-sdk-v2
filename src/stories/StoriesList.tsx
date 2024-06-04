import React, { useRef } from 'react';
import { View } from 'react-native';

import { StoriesCarousel } from './StoriesCarousel';
import { StoriesWidget } from '../StoriesWidget';
import InAppStorySDK from 'react-native-inappstory-sdk';
/*const createClick = (viewId, storyIndex) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.InappstorySdkView.Commands.click.toString(),
    [viewId, storyIndex]
  );
*/
export const StoriesList = ({
  storyManager,
  appearanceManager,
  feed,
  onLoadStart,
  onLoadEnd,
  viewModelExporter,
}) => {
  const tags = storyManager.tags;
  const placeholders = storyManager.placeholders;
  const imagePlaceholders = storyManager.imagePlaceholders;
  const userID = storyManager.userId;
  const ref = useRef(null);
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
  const onViewLoaded = (refId) => {
    ref.current = refId;
  };
  const onPress = React.useCallback((story) => {
    InAppStorySDK.selectStoryCellWith(String(story.id));
  }, []);
  const customFeed = false;
  const customizedCells = false;
  return (
    <View userID={userID}>
      {!customFeed && customizedCells && (
        <StoriesCarousel
          stories={feedData?.stories}
          storyManager={storyManager}
          appearanceManager={appearanceManager}
          onPress={onPress}
        />
      )}
      {!customFeed && !customizedCells && (
        <StoriesWidget
          feed={feed}
          onViewLoaded={onViewLoaded}
          tags={tags}
          placeholders={placeholders}
          imagePlaceholders={imagePlaceholders}
          userID={userID}
        />
      )}
    </View>
  );
};
