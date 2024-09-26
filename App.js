import "react-native-gesture-handler";
import React,{useCallback, useState} from "react";
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
import { View, TextInput, StyleSheet } from 'react-native';
const SearchBar = ({ searchQuery, setSearchQuery }) => 
  {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Surah..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    );
  };
const HomeStack = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleDrawerToggle = useCallback(() => {
    // Trigger a heavy vibration
    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);

   
    

    // Toggle the drawer
    navigation.toggleDrawer();
  }, [navigation]);
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        
        options={{
          headerLeft: () => (
            <Icon.Button
              name="bars"
              size={28}
              backgroundColor="transparent"
              color="default"
              style={{ marginLeft: 20 }}
              onPress={handleDrawerToggle}
              underlayColor="transparent"
            />
          ),
          
          // Custom Search Bar in headerTitle
          headerTitle: () => (
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          ),
        }}
      />
      <Stack.Screen
        name="Surah"
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

const styles = StyleSheet.create({
  searchContainer: 
  {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginVertical: 5
  },
  searchInput: 
  {
    width: '100%',
    padding: 8,
    fontSize: 16,
  },
});

export default App;
