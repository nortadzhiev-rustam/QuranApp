import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { useFonts } from "expo-font";

const HomeScreen = ({ navigation }) => {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    "custom-font": require("../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf"),
  });

  useEffect(() => {
    // Hide drawer header when Surah screen is active
    navigation.setOptions({ headerShown: true });

    // Re-enable drawer header when leaving Surah screen
    return () => navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const baseUrl = "https://api.quran.com/api/v4";
    const endpoint = "/chapters";
    const url = baseUrl + endpoint;

    axios
      .get(url)
      .then((response) => {
        setSurahs(response.data.chapters);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  // Memoized render function to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Surah", {
            surahNumber: item.id,
            surahName: item.name_simple,
            nameArabic: item.name_arabic,
            initialPage: item.pages[0],
            hasBismillah: item.bismillah_pre,
          })
        }
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
        {/* <Icon name="chevron-right" size={20} color={"black"} /> */}
      </TouchableOpacity>
    ),
    [navigation]
  );

  // Return loading state
  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Return error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error: {error.message}</Text>
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
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
});

export default HomeScreen;
