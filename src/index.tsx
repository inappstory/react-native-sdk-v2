import {
  requireNativeComponent,
  UIManager,
  Platform,
  type ViewStyle,
} from 'react-native';
import * as React from 'react';
import { Button, NativeModules, StyleSheet, Text, View } from 'react-native';
import {
  AppearanceManager as AppearanceManagerV1,
  type ListLoadStatus,
  type StoriesListViewModel,
  type StoryManagerConfig,
  StoriesList,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  StoryManager as StoryManagerV1,
  StoryReader,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  useIas,
} from 'react-native-ias';

const LINKING_ERROR =
  `The package 'react-native-inappstory-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type InappstorySdkProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'InappstorySdkView';

export const InappstorySdkView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<InappstorySdkProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export {
  type ListLoadStatus,
  StoriesList,
  StoriesListCardTitlePosition,
  StoriesListCardTitleTextAlign,
  StoriesListCardViewVariant,
  type StoriesListViewModel,
  type StoryManagerConfig,
  StoryReader,
  StoryReaderCloseButtonPosition,
  StoryReaderSwipeStyle,
  useIas,
};
export class StoryManager extends StoryManagerV1 {
  constructor(config: StoryManagerConfig) {
    super(config);
    //TODO: Initialize the API
  }
}
export class AppearanceManager extends AppearanceManagerV1 {
  //TODO: Migrate the APIs from JS to Native
}

export const addOne = (input: number) => input + 1;

export const Counter = () => {
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text>You pressed {count} times</Text>
      <Button onPress={() => setCount(addOne(count))} title="Press Me" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
});

export default NativeModules.RNInAppStorySDKModule;
