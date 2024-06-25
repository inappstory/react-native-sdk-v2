import {
  SafeAreaView,
  StatusBar,
  View,
  useColorScheme,
  Text,
} from 'react-native';
import React from 'react';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useStore } from '@inappstory/react-native-sdk';

export function EventsScreen(): React.ReactNode {
  const isDarkMode = useColorScheme() === 'dark';
  const events = useStore((state) => state.events);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        onScroll={scrollHandler}
        scrollEventThrottle={1}
      >
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            flex: 1,
          }}
        >
          {events.map((event, i) => {
            return (
              <View
                key={i}
                style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}
              >
                <Text>{event.event}</Text>
                {['storyUpdate', 'storyListUpdate'].indexOf(event.event) ===
                -1 ? (
                  <Text style={{ fontSize: 11 }}>
                    {JSON.stringify(event.data)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
