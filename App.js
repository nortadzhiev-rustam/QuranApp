import "react-native-gesture-handler";
import React,{useCallback} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "./screens/HomeScreen";
import SurahScreen from "./screens/SurahScreen";
import LibraryScreen from "./screens/LibraryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import Icon from "react-native-vector-icons/FontAwesome5";
import * as Haptic from "expo-haptics";
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const HomeStack = ({ navigation }) => {
  const handleDrawerToggle = useCallback(() => {
    // Trigger a light vibration
    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);

    // Toggle the drawer
    navigation.toggleDrawer();
  }, [navigation]);
  return (
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen
        name='Al Quran-ul Kareem'
        component={HomeScreen}
        options={{
          headerLeft: () => (
            <Icon.Button
              name='bars'
              size={20}
              backgroundColor='transparent'
              color='black'
              style={{ marginLeft: 20 }}
              onPress={handleDrawerToggle}
              underlayColor='transparent'
            />
          ),
          
        }}
      />
      <Stack.Screen
        name='Surah'
        component={SurahScreen}
        
      />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName='Main'>
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
  );
};

export default App;
