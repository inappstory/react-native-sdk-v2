import {
  SafeAreaView,
  StatusBar,
  View,
  useColorScheme,
  Text,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';

import { Colors, Header } from 'react-native/Libraries/NewAppScreen';

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

export function ProjectSettingsScreen(): React.ReactNode {
  const isDarkMode = useColorScheme() === 'dark';
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [QREnabled, setQREnabled] = useState(false);
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
      console.log(`Scanned ${codes.length} codes!`);
    },
  });
  const changeUserID = () => {
    randomUserId(8);
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
  const [tags, setTags] = useState('');
  const [placeholders, setPlaceholders] = useState('');
  const [imagePlaceholders, setImagePlaceholders] = useState('');
  const [APIKey, setAPIKey] = useState('');

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
