import {
  SafeAreaView,
  StatusBar,
  View,
  useColorScheme,
  Text,
  TextInput,
  Switch,
  StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraPermission,
  useCodeScanner,
  useCameraDevice,
} from 'react-native-vision-camera';
import Button from 'react-native-button';
import InAppStorySDK from 'react-native-inappstory-sdk';
import { storyManager } from '../services/StoryService';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
function extractParamsFromQR(code: string) {
  var regex = /[?&]([^=#]+)=([^&#]*)/g,
    params: any = {},
    match: RegExpExecArray | null;
  while ((match = regex.exec(code))) {
    if (match[1]) params[match[1]] = match[2];
  }
  var url = decodeURIComponent(params.link);
  while ((match = regex.exec(url))) {
    if (match[1]) params[match[1]] = match[2];
  }
  return params;
}

function randomUserId(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
function isJsonString(str) {
  try {
    var j = JSON.parse(str);
    return j;
  } catch (e) {
    return false;
  }
}
export function ProjectSettingsScreen({
  navigation,
}: {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}): React.ReactNode {
  const isDarkMode = useColorScheme() === 'dark';
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [QREnabled, setQREnabled] = useState(false);
  const [customStoryView, setCustomStoryView] = useState(false);
  const [tags, setTags] = useState(storyManager.tags);
  const [placeholders, setPlaceholders] = useState(
    JSON.stringify(storyManager.placeholders)
  );
  const [imagePlaceholders, setImagePlaceholders] = useState(
    storyManager.imagePlaceholders
  );
  const [APIKey, setAPIKey] = useState(storyManager.apiKey);
  useEffect(() => {
    setTags(storyManager.tags);
  }, []);
  useEffect(() => {
    storyManager.setTags(tags);
  }, [tags]);

  useEffect(() => {
    const json = isJsonString(imagePlaceholders);
    if (json !== false) {
      storyManager.setImagePlaceholders(json);
    }
  }, [imagePlaceholders]);
  React.useEffect(() => {
    const json = isJsonString(placeholders);
    if (json !== false) {
      storyManager.setPlaceholders(json);
    }
  }, [placeholders]);
  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length) {
        var url = codes[0]?.value;
        if (url) {
          const params = extractParamsFromQR(url);
          setAPIKey(params.api_key);
          if (params.api_key) {
            storyManager.setApiKey(params.api_key);
            if (params.story_id) {
              InAppStorySDK.showSingle(params.story_id);
            }
            if (params.feed_id) {
              navigation.navigate('RNWelcome', { storyFeedId: params.feed_id });
            }
          }
        }
      }
    },
  });
  const changeUserID = () => {
    storyManager.setUserId(randomUserId(8));
    navigation.goBack();
  };
  const startQR = () => {
    setQREnabled(true);
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
          <Button
            containerStyle={styles.buttonContainer}
            style={styles.button}
            styleDisabled={styles.buttonDisabled}
            onPress={changeUserID}
          >
            Change user
          </Button>
          <Text>Tags:</Text>
          <TextInput
            onChangeText={(value) => setTags(value.split(','))}
            value={tags.join(',')}
          />
          <Text>Placeholders</Text>
          <TextInput onChangeText={setPlaceholders} value={placeholders} />
          <Text>Image Placeholders</Text>
          <TextInput
            onChangeText={setImagePlaceholders}
            value={imagePlaceholders}
          />
          <Text>API Key</Text>
          <TextInput onChangeText={setAPIKey} value={APIKey} />
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
          {!QREnabled && (
            <Button
              containerStyle={styles.buttonContainer}
              style={styles.button}
              styleDisabled={styles.buttonDisabled}
              onPress={startQR}
            >
              QR Scanner
            </Button>
          )}

          {QREnabled && device && (
            <>
              <Text>Point your camera at the QR code</Text>
              <Camera
                codeScanner={codeScanner}
                device={device}
                isActive={true}
              />
            </>
          )}
          {QREnabled && !device && <Text>Failed to access camera</Text>}
        </View>
      </Animated.ScrollView>
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
