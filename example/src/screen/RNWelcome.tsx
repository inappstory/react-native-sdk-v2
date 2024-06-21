import { type NavigationProp, type RouteProp } from '@react-navigation/native';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import React, { useRef } from 'react';

import { Colors, Header } from 'react-native/Libraries/NewAppScreen';

import { StoryListComponent } from '../components/StoryListComponent';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import Button from 'react-native-button';
import { type StoriesListViewModel } from 'react-native-inappstory-sdk';

export function RNWelcome({
  route,
}: {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}): React.ReactNode {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const storiesListViewModel = useRef<StoriesListViewModel>();
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        onScroll={scrollHandler}
        scrollEventThrottle={1}
      >
        <Header />
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            flex: 1,
          }}
        >
          <StoryListComponent
            feedId={route.params?.storyFeedId}
            backgroundColor={isDarkMode ? Colors.black : Colors.white}
            viewModelExporter={(viewModel) =>
              (storiesListViewModel.current = viewModel)
            }
          />
          {
            // eslint-disable-next-line react-native/no-inline-styles
          }
          <View style={{ height: 32 }} />
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
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  button: { fontSize: 18, color: 'white' },
  buttonDisabled: {
    color: 'red',
  },
  buttonContainer: {
    padding: 10,
    height: 'auto',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#0c62f3',
  },
});
