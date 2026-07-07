import { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  createAppearanceManager,
  createStoryManagerWithConfig,
} from './StoryService';

import {
  StoriesList,
  BannerCarousel,
  type StoryManagerConfig,
  type StoriesListRef,
  type ListLoadStatus,
} from '@inappstory/react-native-sdk';

const App = () => {
  const apiKey = 'test-key';
  const feedId = 'flutter';
  const sendStatistics = true;
  const userId = '';

  const config: StoryManagerConfig = {
    apiKey: apiKey,
    userId: userId,
  };

  const manager = useMemo(
    () => createStoryManagerWithConfig(config),
    // ponytail: config is static here; recreate only if apiKey/userId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const appearanceManager = useMemo(() => createAppearanceManager(), []);

  useEffect(() => {
    manager.setSendStatistics(sendStatistics);
    manager.onStoryReaderWillShow((event: any) => {
      console.log('Story reader will show: ', event);
    });
    manager.onShowStory((event: any) => {
      console.log('Show story event received: ', event);
    });
  }, [manager, sendStatistics]);

  const onLoadStart = () => {
    console.log('onLoadStart');
  };

  const onLoadEnd = (listLoadStatus: ListLoadStatus) => {
    console.log('onLoadEnd: %d', listLoadStatus.defaultListLength);
  };

  const listRef = useRef<StoriesListRef>(null);

  const handlePress = () => {
    listRef.current?.reload();
  };

  // manager.on('showStory', (event: any) => {
  //   console.log('Show story event received: ', event);
  // });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <StoriesList
            storyManager={manager}
            ref={listRef}
            appearanceManager={appearanceManager}
            feed={feedId}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
            showFavorites={true}
            //viewModelExporter={storiesListViewModel}
          />
          <BannerCarousel
            placeId="app-head"
            height={150}
            onScroll={(index) => console.log('banner onScroll', index)}
            onPlaceLoaded={(size, widgetHeight) =>
              console.log('banner onPlaceLoaded', size, widgetHeight)
            }
          />
          <Button title="load" onPress={handlePress} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
