import { SafeAreaView, View, useColorScheme } from 'react-native';
import React from 'react';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import Animated from 'react-native-reanimated';
export function AppearanceSettingsScreen(): React.ReactNode {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  return (
    <SafeAreaView style={backgroundStyle}>
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        scrollEventThrottle={1}
      >
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            flex: 1,
          }}
        />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
