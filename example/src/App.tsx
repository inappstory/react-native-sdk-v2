import * as React from 'react';

import { InappstorySdkView } from 'react-native-inappstory-sdk';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainScreen } from './screen/MainScreen';
import NetworkLogger from 'react-native-network-logger';
import { RNWelcome } from './screen/RNWelcome';
import { SettingsScreen } from './screen/SettingsScreen';
import { FavoritesScreen } from './screen/FavoritesScreen';
import { EventsScreen } from './screen/EventsScreen';
import { ProjectSettingsScreen } from './screen/ProjectSettingsScreen';
import { EventsContext } from './context/EventsContext';

export function SDKView() {
  return (
    <View style={styles.container}>
      <InappstorySdkView color="#32a852" style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
const Stack = createNativeStackNavigator();

export default function App() {
  const [events, setEvents] = React.useState([]);
  return (
    <EventsContext.Provider value={{ events, setEvents }}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </EventsContext.Provider>
  );
}

// version migrate
