import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
  Text,
  Switch,
  Platform,
} from 'react-native';
import React, { useState } from 'react';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Slider } from '@miblanchard/react-native-slider';

//import DropDownPicker from 'react-native-dropdown-picker';
import InAppStorySDK from 'react-native-inappstory-sdk';
import SelectDropdown from 'react-native-select-dropdown';
function DropdownElement({
  items,
  label,
  selectedValue,
  onValueChange,
}: {
  items: any;
  selectedValue: any;
  label: string;
  onValueChange: Function;
}): React.JSX.Element {
  return (
    <SelectDropdown
      data={items}
      onSelect={(selectedItem, _index) => {
        console.error(selectedItem);
        onValueChange(selectedItem.value);
      }}
      defaultValue={selectedValue}
      // defaultValueByIndex={8} // use default value by index or default value
      // defaultValue={'kiss'} // use default value by index or default value
      renderButton={(selectedItem, _isOpen) => {
        return (
          <View style={styles.dropdownButtonStyle}>
            <Text style={styles.dropdownButtonTxtStyle}>
              {selectedItem?.label || label}
            </Text>
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View
            style={{
              ...styles.dropdownItemStyle,
              ...(isSelected && { backgroundColor: '#D2D9DF' }),
            }}
          >
            <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
          </View>
        );
      }}
      dropdownStyle={styles.dropdownMenuStyle}
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
  const [hasShare, setHasShare] = useState(true);
  const [hasFavorites, setHasFavorites] = useState(true);
  const [hasLikes, setHasLikes] = useState(true);
  const [overscrollToClose, setOverscrollToClose] = useState(false);
  const [swipeToClose, setSwipeToClose] = useState(false);
  const [timerGradientEnabled, setTimerGradientEnabled] = useState(false);

  const toggleShare = () =>
    setHasShare((previousState) => {
      InAppStorySDK.setHasShare(!previousState);
      return !previousState;
    });

  const toggleFavorites = () =>
    setHasFavorites((previousState) => {
      InAppStorySDK.setHasFavorites(!previousState);
      return !previousState;
    });

  const toggleLikes = () => {
    setHasLikes((previousState) => {
      InAppStorySDK.setHasLike(!previousState);
      return !previousState;
    });
  };

  const toggleOverscrollToClose = () =>
    setOverscrollToClose((previousState) => {
      InAppStorySDK.setOverScrollToClose(!previousState);
      return !previousState;
    });

  const toggleSwipeToClose = () =>
    setSwipeToClose((previousState) => {
      InAppStorySDK.setSwipeToClose(!previousState);
      return !previousState;
    });

  const toggleTimerGradientEnabled = () =>
    setTimerGradientEnabled((previousState) => {
      InAppStorySDK.setTimerGradientEnable(!previousState);
      return !previousState;
    });
  /*
  const generateRandomColor = (alpha = false) => {
    return Math.floor(
      Math.random() * ((alpha ? 256 : 1) * 256 * 256 * 256 - 1)
    ).toString(16);
  };
  const setReaderBackgroundColor = () => {
    generateRandomColor();
  };*/
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
            paddingHorizontal: 5,
            paddingVertical: 5,
          }}
        >
          <View style={styles.settingContainer}>
            <Text>Close button position</Text>
            <DropdownElement
              selectedValue={closeButtonPosition}
              label={'Select Position'}
              onValueChange={(itemValue, _itemIndex) => {
                setCloseButtonPosition(itemValue);
                console.error('closebutton = ', itemValue);
                InAppStorySDK.setCloseButtonPosition(itemValue);
              }}
              items={[
                {
                  label: 'Bottom Left',
                  value: 'bottomLeft',
                },
                {
                  label: 'Bottom Right',
                  value: 'bottomRight',
                },
                {
                  label: 'Left',
                  value: 'left',
                },
                {
                  label: 'Right',
                  value: 'right',
                },
              ]}
            />
          </View>
          <View style={styles.settingContainer}>
            <Text>Scroll style</Text>
            <DropdownElement
              label={'Select scroll style'}
              selectedValue={scrollStyle}
              onValueChange={(itemValue, _itemIndex) => {
                setScrollStyle(itemValue);
                InAppStorySDK.setScrollStyle(itemValue);
              }}
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
              label={'Select presentation style'}
              selectedValue={presentationStyle}
              onValueChange={(itemValue, _itemIndex) => {
                setPresentationStyle(itemValue);
                InAppStorySDK.setPresentationStyle(itemValue);
              }}
              items={
                Platform.OS === 'ios'
                  ? [
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
                    ]
                  : [
                      {
                        label: 'Zoom',
                        value: 'zoom',
                      },
                      {
                        label: 'Fade',
                        value: 'fade',
                      },
                      {
                        label: 'Popup',
                        value: 'popup',
                      },
                      {
                        label: 'Disable',
                        value: 'disable',
                      },
                    ]
              }
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
          {/*<View style={styles.settingContainer}>
            <Text>Reader background color</Text>
            <Button onPress={setReaderBackgroundColor} />
            </View>*/}
          <View style={styles.settingContainer}>
            <Text>Reader Corner Radius</Text>
            <Slider
              value={readerCornerRadius}
              minimumValue={0}
              maximumValue={200}
              onValueChange={(val) => {
                InAppStorySDK.setReaderCornerRadius(Math.ceil(val[0]));
                return setReaderCornerRadius(Math.ceil(val[0]));
              }}
            />
            <Text style={{ fontSize: 12, textAlign: 'right' }}>
              {readerCornerRadius}
            </Text>
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
  container: { zIndex: 10 },
  settingContainer: { zIndex: 10 },
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
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 90,
    backgroundColor: '#E9ECEF',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  headerTxt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#151E26',
  },
  dropdownButtonStyle: {
    width: 200,
    height: 50,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
    textAlign: 'center',
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    height: 200,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B1BDC8',
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
    textAlign: 'center',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  ////////////// dropdown1
  dropdown1ButtonStyle: {
    width: '80%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#444444',
  },
  dropdown1ButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dropdown1ButtonArrowStyle: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  dropdown1ButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
    color: '#FFFFFF',
  },
  dropdown1MenuStyle: {
    backgroundColor: '#444444',
    borderRadius: 8,
  },
  dropdown1ItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B1BDC8',
  },
  dropdown1ItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dropdown1ItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
    color: '#FFFFFF',
  },
  ////////////// dropdown2
  dropdown2ButtonStyle: {
    width: '80%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#B1BDC8',
  },
  dropdown2ButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdown2ButtonArrowStyle: {
    fontSize: 28,
  },
  dropdown2ButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdown2MenuStyle: {
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  dropdown2ItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B1BDC8',
  },
  dropdown2ItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdown2ItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
});
