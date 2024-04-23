import { type NavigationProp, type RouteProp } from '@react-navigation/native';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import React, { useRef, type ReactNode } from 'react';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { StoryListComponent } from '../components/StoryListComponent';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import Button from 'react-native-button';
import { type StoriesListViewModel } from 'react-native-inappstory-sdk';

const Section = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

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
            height: 2000,
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
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.js</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
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
