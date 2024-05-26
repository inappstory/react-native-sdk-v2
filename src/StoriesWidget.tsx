import React, { useEffect, useRef } from 'react';
import { PixelRatio, Platform, UIManager, findNodeHandle } from 'react-native';
import { InappstorySdkViewManager } from './ViewManager';

const createFragment = (viewId) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.InappstorySdkView.Commands.create.toString(),
    [viewId]
  );

export const StoriesWidget = ({ onViewLoaded }) => {
  const ref = useRef(null);
  useEffect(() => {
    const viewId = findNodeHandle(ref.current);
    if (Platform.OS == 'android') {
      createFragment(viewId);
    }
    onViewLoaded(viewId);
  }, [onViewLoaded]);

  return (
    <InappstorySdkViewManager
      style={{
        // converts dpi to px, provide desired height
        height: PixelRatio.getPixelSizeForLayoutSize(100),
        // converts dpi to px, provide desired width
        width: PixelRatio.getPixelSizeForLayoutSize(400),
      }}
      ref={ref}
    />
  );
};
