import { SafeAreaView, View, useColorScheme, Text, Switch } from 'react-native';
import React from 'react';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import Animated from 'react-native-reanimated';
import { useInAppStory } from 'react-native-inappstory-sdk';
export function AppearanceSettingsScreen(): React.ReactNode {
  const {
    customStoryView,
    setCustomStoryView,
    showFavorites,
    setShowFavorites,
  } = useInAppStory();

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
        >
          <Text>Custom story view</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={customStoryView ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              setCustomStoryView((csv) => !csv);
            }}
            value={customStoryView}
          />
          {customStoryView && (
            <>
              <Text>Show Favorites</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={showFavorites ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setShowFavorites((csv) => !csv);
                }}
                value={showFavorites}
              />
            </>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
