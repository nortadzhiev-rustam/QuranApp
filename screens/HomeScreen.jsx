import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';  // Use expo-file-system instead of react-native-fs
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { useFonts } from "expo-font";

// Storage keys
const SURAH_METADATA_KEY = "quran_surah_metadata";
const SURAH_DATA_PATH = FileSystem.documentDirectory + "quran_surah_data/";

const HomeScreen = ({ navigation }) => {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    "custom-font": require("../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf"),
  });

  // Check if data exists in AsyncStorage or download from API
  const loadSurahData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(SURAH_METADATA_KEY);
      if (cachedData) {
        setSurahs(JSON.parse(cachedData));
        setLoading(false);
      } else {
        // If no cached data, download from API
        fetchSurahsFromAPI();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error);
      setLoading(false);
    }
  };

  // Fetch Surah metadata and store it in AsyncStorage
  const fetchSurahsFromAPI = async () => {
    const baseUrl = "https://api.quran.com/api/v4";
    const endpoint = "/chapters";
    const url = baseUrl + endpoint;

    try {
      const response = await axios.get(url);
      const data = response.data.chapters;

      // Save to AsyncStorage for offline use
      await AsyncStorage.setItem(SURAH_METADATA_KEY, JSON.stringify(data));
      setSurahs(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Surah data:", error);
      setError(error);
      setLoading(false);
    }
  };

  // Fetch and store Surah data using expo-file-system
  const fetchAndStoreSurah = async (surahNumber) => {
    const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?fields=text_imlaei,chapter_id`;
    const filePath = `${SURAH_DATA_PATH}${surahNumber}.json`;
  
    try {
      // Check if the folder exists, if not, create it
      const folderInfo = await FileSystem.getInfoAsync(SURAH_DATA_PATH);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(SURAH_DATA_PATH, { intermediates: true });
        console.log("Surah data directory created.");
      }
  
      // Check if the Surah data is already stored
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        // Download and store the Surah data
        const response = await axios.get(url);
        const surahData = response.data.verses;
  
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(surahData));
        console.log(`Surah ${surahNumber} data saved!`);
      } else {
        console.log(`Surah ${surahNumber} already cached!`);
      }
    } catch (error) {
      console.error(`Error downloading Surah ${surahNumber}:`, error);
    }
  };

  // Memoized render function to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={async () => {
          // Fetch and store the selected Surah when it's opened
          await fetchAndStoreSurah(item.id);
          navigation.navigate("Surah", {
            surahNumber: item.id,
            surahName: item.name_simple,
            nameArabic: item.name_arabic,
            initialPage: item.pages[0],
            hasBismillah: item.bismillah_pre,
            verseCount: item.verse_count,
          });
        }}
        style={styles.verseContainer}
      >
        <Image
          source={
            item.revelation_place === "makkah"
              ? require("../assets/10171102.png")
              : require("../assets/6152869.png")
          }
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.verseText}>{item.name_simple}</Text>
          <View style={styles.verseInfoContainer}>
            <Text style={styles.verseTextArabic}>{item.name_arabic}</Text>
            <Text style={styles.verseCount}>{item.verses_count} ayahs</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

  // Load data on component mount
  useEffect(() => {
    loadSurahData();
  }, []);

  // Handle loading and error states
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: {error.message}</Text>
        <TouchableOpacity onPress={loadSurahData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Implement getItemLayout if all items have the same height
  const getItemLayout = (data, index) => ({
    length: 100, // item height
    offset: 100 * index, // item height multiplied by index
    index,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        windowSize={5} // Adjust based on list size
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  verseContainer: {
    marginVertical: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "rgba(0,0,0, .4)", // iOS
    shadowOffset: { height: 1, width: 1 }, // iOS
    shadowOpacity: 1, // iOS
    shadowRadius: 1, // iOS
    backgroundColor: "#fff",
    elevation: 2, // Android
    borderRadius: 20,
    height: 100,
    margin: 5,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verseText: {
    fontSize: 20,
    color: "#333",
  },
  verseTextArabic: {
    fontSize: 20,
    color: "#333",
    fontFamily: "custom-font",
  },
  verseInfoContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginRight: 10,
  },
  verseCount: {
    fontSize: 10,
    color: "#999",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
});

export default HomeScreen;
