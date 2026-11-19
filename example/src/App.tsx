import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import {
  createAppearanceManager,
  createStoryManagerWithConfig,
} from './StoryService';

import {
  StoriesList,
  BannerGrid,
  BannerList,
  type BannerListRef,
  type BannerGridRef,
  type StoryManagerConfig,
  type StoriesListRef,
  type ListLoadStatus,
} from '@inappstory/react-native-sdk';

const apiKey = 'test-key';
const feedId = 'default';
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
  const bannerGridRef = useRef<BannerGridRef>(null);
  const bannerListRef = useRef<BannerListRef>(null);
  const [showBannerList, setShowBannerList] = useState(true);

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
          <Button
            title={showBannerList ? 'Show banner grid' : 'Show banner list'}
            onPress={() => setShowBannerList((current) => !current)}
          />
          {showBannerList ? (
            <BannerList
              ref={bannerListRef}
              placeId="app-body"
              sideInset={16}
              interItemSpacing={12}
              cornerRadius={12}
              style={styles.bannerList}
              onPlaceLoaded={(size, widgetHeight) =>
                console.log(`Banner list loaded: ${size}, ${widgetHeight}dp`)
              }
            />
          ) : (
            <BannerGrid
              ref={bannerGridRef}
              placeId="app-body"
              columnSpacing={8}
              rowSpacing={12}
              cornerRadius={12}
              onPlaceLoaded={(size, widgetHeight) =>
                console.log(`Banner grid loaded: ${size}, ${widgetHeight}dp`)
              }
            />
          )}
          {showBannerList && (
            <View style={styles.bannerControls}>
              <Button
                title="Refresh"
                onPress={() => bannerListRef.current?.refresh()}
              />
              <Button
                title="Pause"
                onPress={() => bannerListRef.current?.pause()}
              />
              <Button
                title="Resume"
                onPress={() => bannerListRef.current?.resume()}
              />
            </View>
          )}
          <Button
            title="Show targeted story"
            onPress={() =>
              manager
                .showStoryWithTargeting('YOUR-STORY-ID', ['promo'])
                .catch((error) =>
                  console.warn('Targeted story not shown', error)
                )
            }
          />
          <Button
            title="Show targeted IAM"
            onPress={() =>
              manager
                .showIAMByIdWithTargeting('YOUR-IAM-ID', false, ['promo'])
                .catch((error) => console.warn('Targeted IAM not shown', error))
            }
          />
          <Button
            title="Show IAM with input fields"
            onPress={() =>
              manager
                .showIAMById('YOUR-IAM-WITH-INPUT-ID', false)
                .catch((error) => console.warn('IAM not shown', error))
            }
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
  bannerList: {
    flex: 1,
  },
  bannerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
