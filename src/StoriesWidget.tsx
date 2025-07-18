import React from 'react';
import { PixelRatio, Platform, UIManager, findNodeHandle } from 'react-native';
import { InAppStoryFavorites, InappstorySdkViewManager } from './ViewManager';

const createFragment = (viewId) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    // @ts-ignore:next-line
    UIManager.InappstorySdkView.Commands.create.toString(),
    [viewId]
  );

export const StoriesWidget = ({
  onViewLoaded,
  tags,
  placeholders,
  imagePlaceholders,
  userID,
  feed,
  favoritesOnly,
}) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const viewId = findNodeHandle(ref.current);
    if (Platform.OS === 'android') {
      createFragment(viewId);
    }
    onViewLoaded(viewId);
  }, [onViewLoaded]);
  return !favoritesOnly ? (
    <InappstorySdkViewManager
      style={{
        // converts dpi to px, provide desired height
        height: PixelRatio.getPixelSizeForLayoutSize(120),
        // converts dpi to px, provide desired width
        width: PixelRatio.getPixelSizeForLayoutSize(370),
      }}
      tags={tags}
      ref={ref}
      placeholders={placeholders}
      imagePlaceholders={imagePlaceholders}
      userID={userID}
      feed={feed}
    />
  ) : (
    <>
      <InAppStoryFavorites
        style={{
          // converts dpi to px, provide desired height
          height: PixelRatio.getPixelSizeForLayoutSize(120),
          // converts dpi to px, provide desired width
          width: PixelRatio.getPixelSizeForLayoutSize(370),
        }}
        tags={tags}
        ref={ref}
        placeholders={placeholders}
        imagePlaceholders={imagePlaceholders}
        userID={userID}
        feed={feed}
      />
    </>
  );
};
