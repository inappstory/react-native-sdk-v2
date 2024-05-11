import {
  type NavigationProp,
  type RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  Alert,
  BackHandler,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useRef } from 'react';
import Button from 'react-native-button';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { type StoriesListViewModel } from 'react-native-inappstory-sdk';

import Toast from 'react-native-simple-toast';
import { StoryListComponent } from '../components/StoryListComponent';
import { appearanceManager, storyManager } from '../services/StoryService';
import InAppStorySDK from 'react-native-inappstory-sdk';

export function MainScreen({
  navigation,
}: {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}) {
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to go back?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', backAction);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, [])
  );

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const storiesListViewModel = useRef<StoriesListViewModel>();
  const viewModelExporter = useCallback(
    (viewModel: StoriesListViewModel) =>
      (storiesListViewModel.current = viewModel),
    []
  );

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await storiesListViewModel.current?.reload();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewInnerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StoryListComponent
          feedId="rniasdemo"
          backgroundColor="transparent"
          viewModelExporter={viewModelExporter}
        />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            if (storiesListViewModel.current) {
              console.log(await storiesListViewModel.current.reload());
            }
          }}
        >
          Reload StoriesList
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() =>
            navigation.navigate('RNWelcome', { storyFeedId: 'default' })
          }
        >
          Success loading (default)
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() =>
            navigation.navigate('RNWelcome', { storyFeedId: 'undefinedFeed' })
          }
        >
          Fail loading
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            storyManager.showStory(26702, appearanceManager).then((res) => {
              console.log({ res });
              res.loaded === false && Toast.show('Failed to load story', 2000);
            });
          }}
        >
          Open one story(success)
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            storyManager
              .showStory('undefinedId', appearanceManager)
              .then((res) => {
                console.log({ res });
                res.loaded === false &&
                  Toast.show('Failed to load story', 2000);
              });
          }}
        >
          Open one story(fail)
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            storyManager
              .showOnboardingStories(appearanceManager)
              .then((res) => {
                let onboardingOpened = false;
                if (res.success && res.defaultListLength > 0) {
                  onboardingOpened = true;
                }
                console.log({ onboardingOpened });
              });
          }}
        >
          Open onboarding
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            InAppStorySDK.showGame('2');
          }}
        >
          Open game
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            InAppStorySDK.showSingle('26702');
          }}
        >
          Show single story (New SDK)
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            InAppStorySDK.showOnboardings('26702', 1, []);
          }}
        >
          Show onboarding story (New SDK)
        </Button>
        <View style={styles.pad32} />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            navigation.navigate('NetworkLogger');
          }}
        >
          NetworkLogger
        </Button>

        <View style={styles.pad32} />
        {/*</View>*/}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // container: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {},
  scrollViewInnerContainer: {
    marginHorizontal: 20,
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 42,
  },
  button: { fontSize: 18, color: 'white' },
  buttonContainer: {
    padding: 10,
    height: 'auto',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#0c62f3',
  },
  buttonDisabled: { color: 'red' },
  pad32: { height: 32 },
});
