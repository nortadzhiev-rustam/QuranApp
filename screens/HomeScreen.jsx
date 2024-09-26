import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";

import { useFonts } from "expo-font";

const HomeScreen = ({ navigation }) => {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    "custom-font": require("../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf"),
  });
  const chapters = require("../quran/chapters.json");
  useEffect(() => {
    if (fontsLoaded) {
      setSurahs(chapters);
    }
    setLoading(false);
  }, [fontsLoaded]);

  // Memoized render function to prevent unnecessary re-renders
  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={async () => {
          navigation.navigate("Surah", {
            surahNumber: item.id,
            surahName: item.transliteration,
            nameArabic: item.name,
            hasBismillah: item.bismillah,
            type: item.type,
          });
        }}
        style={styles.verseContainer}
      >
        <Image
          source={
            item.type === "meccan"
              ? require("../assets/10171102.png")
              : require("../assets/6152869.png")
          }
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.verseText}>{item.transliteration}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "30%",
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
              <View></View>
              <View style={{ flex: 1, height: 1, backgroundColor: "black" }} />
            </View>
            <Text style={styles.verseText}>"{item.translation}"</Text>
          </View>
          <View style={styles.verseInfoContainer}>
            <Text style={styles.verseTextArabic}>{item.name}</Text>
            <Text style={styles.verseCount}>{item.total_verses} ayahs</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

  // Handle loading and error states
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size='large' color='#333' />
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
    fontSize: Platform.isPad ? 20 : 14,
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
