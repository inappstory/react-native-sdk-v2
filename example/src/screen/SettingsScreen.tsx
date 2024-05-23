import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  Text,
  Switch,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import { Colors, Header } from 'react-native/Libraries/NewAppScreen';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';
import Button from 'react-native-button';

import DropDownPicker from 'react-native-dropdown-picker';

function DropdownElement({
  items,
  selectedValue,
  onValueChange,
}: {
  items: any;
  selectedValue: any;
  onValueChange: Function;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [_items, setItems] = useState(items);
  useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);
  useEffect(() => {
    if (value) {
      onValueChange(value);
    }
  }, [value, onValueChange]);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
    />
  );
}

export function SettingsScreen(): React.ReactNode {
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

  const [readerCornerRadius, setReaderCornerRadius] = useState<
    number | number[]
  >(20);
  const [closeButtonPosition, setCloseButtonPosition] = useState('right');
  const [scrollStyle, setScrollStyle] = useState('cover');
  const [presentationStyle, setPresentationStyle] = useState('crossDissolve');
  //const [coverQuality, setCoverQuality] = useState('medium');

  const [hasShare, setHasShare] = useState(false);
  const [hasFavorites, setHasFavorites] = useState(false);

  const [hasLikes, setHasLikes] = useState(false);

  const [overscrollToClose, setOverscrollToClose] = useState(false);

  const [swipeToClose, setSwipeToClose] = useState(false);

  const [timerGradientEnabled, setTimerGradientEnabled] = useState(false);

  const toggleShare = () => setHasShare((previousState) => !previousState);

  const toggleFavorites = () =>
    setHasFavorites((previousState) => !previousState);

  const toggleLikes = () => setHasLikes((previousState) => !previousState);

  const toggleOverscrollToClose = () =>
    setOverscrollToClose((previousState) => !previousState);

  const toggleSwipeToClose = () =>
    setSwipeToClose((previousState) => !previousState);

  const toggleTimerGradientEnabled = () =>
    setTimerGradientEnabled((previousState) => !previousState);
  const generateRandomColor = (alpha = false) => {
    return Math.floor(
      Math.random() * ((alpha ? 256 : 1) * 256 * 256 * 256 - 1)
    ).toString(16);
  };
  const setReaderBackgroundColor = () => {
    generateRandomColor();
  };
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
          <View style={styles.settingContainer}>
            <Text>Close button position</Text>
            <DropdownElement
              selectedValue={closeButtonPosition}
              onValueChange={(itemValue, _itemIndex) =>
                setCloseButtonPosition(itemValue)
              }
              items={[
                {
                  label: 'Bottom Left',
                  value: 'bottomLeft',
                },
                {
                  label: 'Bottom Left',
                  value: 'bottomRight',
                },
                {
                  label: 'Bottom Left',
                  value: 'left',
                },
                {
                  label: 'Bottom Left',
                  value: 'right',
                },
              ]}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Scroll style</Text>
            <DropdownElement
              selectedValue={scrollStyle}
              onValueChange={(itemValue, _itemIndex) =>
                setScrollStyle(itemValue)
              }
              items={[
                {
                  label: 'Cover',
                  value: 'cover',
                },
                {
                  label: 'Flat',
                  value: 'flat',
                },
                {
                  label: 'Cube',
                  value: 'cube',
                },
                {
                  label: 'Depth',
                  value: 'depth',
                },
              ]}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Presentation style</Text>
            <DropdownElement
              selectedValue={presentationStyle}
              onValueChange={(itemValue, _itemIndex) =>
                setPresentationStyle(itemValue)
              }
              items={[
                {
                  label: 'Cross Dissolve',
                  value: 'crossDissolve',
                },
                {
                  label: 'Modal',
                  value: 'modal',
                },
                {
                  label: 'Zoom',
                  value: 'zoom',
                },
              ]}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Swipe to close</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={swipeToClose ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwipeToClose}
              value={swipeToClose}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Overscroll to close</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={overscrollToClose ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleOverscrollToClose}
              value={overscrollToClose}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Timer gradient enabled</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={timerGradientEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleTimerGradientEnabled}
              value={timerGradientEnabled}
            />
          </View>
          {/*<Text>FIXME: Timer gradient</Text>*/}
          <View style={styles.settingContainer}>
            <Text>Reader background color</Text>
            <Button onPress={setReaderBackgroundColor} />
          </View>
          <View style={styles.settingContainer}>
            <Text>Reader Corner Radius</Text>
            <Slider
              value={readerCornerRadius}
              onValueChange={(val) => setReaderCornerRadius(val)}
            />
          </View>
          {/*<Text>Placeholder background color</Text>
          <Text>Placeholder element color</Text>*/}
          <View style={styles.settingContainer}>
            <Text>Has Likes</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={hasLikes ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleLikes}
              value={hasLikes}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Has Favorites</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={hasFavorites ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleFavorites}
              value={hasFavorites}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Has Share</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={hasShare ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleShare}
              value={hasShare}
            />
          </View>
          {/*<View style={styles.settingContainer}>
            <Text>Cover Quality</Text>
            <Picker
              selectedValue={coverQuality}
              onValueChange={(itemValue, _itemIndex) =>
                setCoverQuality(itemValue)
              }
            >
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
            </Picker>
            </View>*/}
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
  settingContainer: {
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
