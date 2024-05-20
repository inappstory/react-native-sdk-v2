import React, { useEffect, useRef } from 'react';
import { PixelRatio, UIManager, findNodeHandle } from 'react-native';
import { InappstorySdkViewManager } from './ViewManager';

const createFragment = (viewId) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.InappstorySdkView.Commands.create.toString(),
    [viewId]
  );

/*const createClick = (viewId) =>
  UIManager.dispatchViewManagerCommand(
    viewId,
    // we are calling the 'create' command
    UIManager.InappstorySdkView.Commands.click.toString(),
    [viewId]
  );*/

export const StoriesWidget = ({ _clickAt }) => {
  const ref = useRef(null);
  useEffect(() => {
    const viewId = findNodeHandle(ref.current);
    createFragment(viewId);
  }, []);
  useEffect(() => {
    setTimeout(() => {
      //const viewId = findNodeHandle(ref.current);
      //console.error('clicking');
      //createClick(viewId);
    }, 5000);
  }, []);

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
