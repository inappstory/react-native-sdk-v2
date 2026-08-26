import { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  createAppearanceManager,
  createStoryManagerWithConfig,
} from './StoryService';

import {
  StoriesList,
  type StoryManagerConfig,
  type StoriesListRef,
  type ListLoadStatus,
} from '@inappstory/react-native-sdk';

const apiKey = 'YOUR-API-KEY-HERE';
const feedId = 'YOUR-FEED-ID-HERE';
const sendStatistics = true;
const userId = '';

const config: StoryManagerConfig = {
  apiKey,
  userId,
};

const App = () => {
  const manager = useMemo(() => createStoryManagerWithConfig(config), []);

  const appearanceManager = useMemo(() => createAppearanceManager(), []);

  useEffect(() => {
    manager.setSendStatistics(sendStatistics);
    manager.onStoryReaderWillShow((event: any) => {
      console.log('Story reader will show: ', event);
    });
    manager.onShowStory((event: any) => {
      console.log('Show story event received: ', event);
    });
  }, [manager]);

  const onLoadStart = () => {
    console.log('onLoadStart');
  };

  const onLoadEnd = (listLoadStatus: ListLoadStatus) => {
    console.log('onLoadEnd: %d', listLoadStatus.defaultListLength);
  };

  const listRef = useRef<StoriesListRef>(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StoriesList
            storyManager={manager}
            ref={listRef}
            appearanceManager={appearanceManager}
            feed={feedId}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
            showFavorites={true}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
});
