import 'react-native-gesture-handler';
import React, { useCallback, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import SurahScreen from './screens/SurahScreen';
import LibraryScreen from './screens/LibraryScreen';
import SettingsScreen from './screens/SettingsScreen';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Haptic from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from './components/CustomSplashScreen';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
import { View, TextInput, StyleSheet, Platform } from 'react-native';

// Hide the native splash screen immediately
SplashScreen.hideAsync();

const HomeStack = ({ navigation }) => {
  const handleDrawerToggle = useCallback(() => {
    // Trigger a heavy vibration
    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);

    // Toggle the drawer
    navigation.toggleDrawer();
  }, [navigation]);
  return (
    <Stack.Navigator
      initialRouteName='Home'
      screenOptions={{
        headerLargeTitle: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name='Home'
        component={HomeScreen}
        options={{
          headerLeft: () => (
            <Icon.Button
              name='bars'
              size={28}
              backgroundColor='transparent'
              color='default'
              style={{ marginLeft: 20 }}
              onPress={handleDrawerToggle}
              underlayColor='transparent'
            />
          ),
        }}
      />
      <Stack.Screen name='Surah' component={SurahScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!appIsReady || showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName='Al Quran'>
          <Drawer.Screen
            name='Al Quran'
            component={HomeStack}
            options={{ headerShown: false }}
          />
          <Drawer.Screen name='Library' component={LibraryScreen} />
          <Drawer.Screen name='Settings' component={SettingsScreen} />
          {/* You can add more screens to the Drawer here */}
        </Drawer.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginVertical: 5,
  },
  searchInput: {
    width: '100%',
    padding: 8,
    fontSize: 16,
  },
});

export default App;
