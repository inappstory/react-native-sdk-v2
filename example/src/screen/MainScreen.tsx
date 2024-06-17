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
  ScrollView,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-simple-toast';

import React, { useCallback, useRef } from 'react';
import Button from 'react-native-button';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  useInAppStory,
  type StoriesListViewModel,
} from 'react-native-inappstory-sdk';

import { StoryListComponent } from '../components/StoryListComponent';
import { storyManager } from '../services/StoryService';
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
  const { readerOpen } = useInAppStory();
  const [feed, _setFeed] = React.useState('default');
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await storiesListViewModel.current?.reload();
    setRefreshing(false);
  }, []);
  /*const onFeedChangePress = React.useCallback(() => {
    setFeed((feed) => {
      return feed == 'default' ? 'test' : 'default';
    });
  }, []);*/
  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        hidden={readerOpen}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewInnerContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StoryListComponent
          feedId={feed}
          backgroundColor="transparent"
          viewModelExporter={viewModelExporter}
        />
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            if (storiesListViewModel.current) {
              await storiesListViewModel.current.reload();
            }
          }}
        >
          Reload StoriesList
        </Button>
        {/*<Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={onFeedChangePress}
        >
          Change feed
        </Button>*/}
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            storyManager.setTags(['tag1', 'tag2']);
            if (storiesListViewModel.current) {
              await storiesListViewModel.current.reload();
            }
          }}
        >
          Add tags
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            storyManager.setTags([]);
            if (storiesListViewModel.current) {
              await storiesListViewModel.current.reload();
            }
          }}
        >
          Remove tags
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            navigation.navigate('SettingsScreen');
          }}
        >
          Reader Settings
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            navigation.navigate('ProjectSettingsScreen');
          }}
        >
          Project Settings
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            navigation.navigate('AppearanceSettingsScreen');
          }}
        >
          Appearance Settings
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            const showed = await InAppStorySDK.showSingle('5663');
            console.error('single show', showed);
          }}
        >
          Show single story
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            const showed = await InAppStorySDK.showOnboardings(
              'default',
              10,
              []
            );
            if (!showed) {
              Toast.show('No more onboarding stories, switch user to test');
            }
          }}
        >
          Show onboarding stories
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={async () => {
            const showed = await storyManager.showGame('263');
            console.error('Showed game = ', showed);
          }}
        >
          Open game
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            InAppStorySDK.showEditor();
          }}
        >
          Open editor
        </Button>
        <Button
          containerStyle={styles.buttonContainer}
          style={styles.button}
          styleDisabled={styles.buttonDisabled}
          onPress={() => {
            navigation.navigate('EventsScreen');
          }}
        >
          Events Log
        </Button>
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
  scrollView: {
    flex: 1,
  },
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
    marginVertical: 10,
  },
  buttonDisabled: { color: 'red' },
  pad32: { height: 32 },
});
