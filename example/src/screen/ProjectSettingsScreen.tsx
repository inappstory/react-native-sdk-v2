import {
  SafeAreaView,
  StatusBar,
  View,
  useColorScheme,
  Text,
  TextInput,
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

  const [tags, setTags] = useState(storyManager.tags);
  const [placeholders, setPlaceholders] = useState(storyManager.placeholders);
  const [imagePlaceholders, setImagePlaceholders] = useState(
    storyManager.imagePlaceholders
  );
  const [APIKey, setAPIKey] = useState(storyManager.apiKey);

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
          console.error(('params = ', params.api_key));
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
  useEffect(() => {
    InAppStorySDK.setTags(['tag1']);
  }, [tags]);
  useEffect(() => {
    //InAppStorySDK.setPlaceholders({ username: 'User1' });
  }, [placeholders]);

  useEffect(() => {
    //InAppStorySDK.setImagePlaceholders({ username: 'User1' });
  }, [imagePlaceholders]);

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
          <Button onPress={changeUserID}>Change user</Button>
          <Text>Tags:</Text>
          <TextInput onChangeText={(value) => setTags(value)} value={tags} />
          <Text>Placeholders</Text>
          <TextInput onChangeText={setPlaceholders} value={placeholders} />
          <Text>Image Placeholders</Text>
          <TextInput
            onChangeText={setImagePlaceholders}
            value={imagePlaceholders}
          />
          <Text>API Key</Text>
          <TextInput onChangeText={setAPIKey} value={APIKey} />
          <Button onPress={startQR}>QR Scanner</Button>
          {QREnabled && device && (
            <Camera codeScanner={codeScanner} device={device} isActive={true} />
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
