import {
  requireNativeComponent,
  UIManager,
  Platform,
  type ViewStyle,
} from 'react-native';
type InappstorySdkProps = {
  color?: string;
  tags?: string[];
  placeholders?: string[];
  imagePlaceholders?: string[];
  userID?: string;
  style?: ViewStyle;
  feed?: string;
  ref?: any;
};
const LINKING_ERROR =
  `The package '@inappstory/react-native-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const ComponentName = 'InappstorySdkView';
export const InappstorySdkViewManager =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<InappstorySdkProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };
export const InAppStoryFavorites =
  UIManager.getViewManagerConfig('InAppStoryFavorites') != null
    ? requireNativeComponent<InappstorySdkProps>('InAppStoryFavorites')
    : () => {
        throw new Error(LINKING_ERROR);
      };
