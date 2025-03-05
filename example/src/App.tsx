import * as React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainScreen } from './screen/MainScreen';
import NetworkLogger from 'react-native-network-logger';
import { RNWelcome } from './screen/RNWelcome';
import { SettingsScreen } from './screen/SettingsScreen';
import { FavoritesScreen } from './screen/FavoritesScreen';
import { EventsScreen } from './screen/EventsScreen';
import { ProjectSettingsScreen } from './screen/ProjectSettingsScreen';
import { AppearanceSettingsScreen } from './screen/AppearanceSettings';
import { appearanceManager, storyManager } from './services/StoryService';
import BottomSheet, { type BottomSheetMethods } from '@devvie/bottom-sheet';
import { View } from 'react-native';
import {
  StoriesList,
  StoriesListViewModel,
} from '@inappstory/react-native-sdk';

const Stack = createNativeStackNavigator();

export default function App() {
  const storiesListViewModel = React.useRef<StoriesListViewModel>();
  const [favoritesOpen, setFavoritesOpen] = React.useState(false);
  React.useEffect(() => {
    storyManager.on('onFavoriteCell', () => {
      setFavoritesOpen(true);
      sheetRef.current.open();
    });
  }, []);
  const onLoadEnd = () => {};
  const onLoadStart = () => {};
  const sheetRef = React.useRef<BottomSheetMethods>({
    open: () => {},
    close: () => {},
  });
  const viewModelExporter = React.useCallback(
    (viewModel: StoriesListViewModel) =>
      (storiesListViewModel.current = viewModel),
    []
  );
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            /*animationEnabled: Platform.select({
            ios: true,
            android: true,
          }),*/
            animation: 'default',
            presentation: 'card',
            headerShown: true,
            gestureEnabled: false,
            //gestureResponseDistance: 500,
            headerStyle: {
              backgroundColor: '#0c62f3',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="NetworkLogger" component={NetworkLogger} />

          <Stack.Screen name="RNWelcome" component={RNWelcome} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="EventsScreen" component={EventsScreen} />
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
          <Stack.Screen
            name="ProjectSettingsScreen"
            component={ProjectSettingsScreen}
          />
          <Stack.Screen
            name="AppearanceSettingsScreen"
            component={AppearanceSettingsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <BottomSheet ref={sheetRef}>
        <View style={{ paddingHorizontal: 10 }}>
          {!!favoritesOpen && (
            <StoriesList
              feed={'default'}
              favoritesOnly={true}
              storyManager={storyManager}
              appearanceManager={appearanceManager}
              onLoadEnd={onLoadEnd}
              onLoadStart={onLoadStart}
              viewModelExporter={viewModelExporter}
              vertical={false}
            />
          )}
        </View>
      </BottomSheet>
    </>
  );
}

// version migrate
