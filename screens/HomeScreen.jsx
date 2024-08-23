import React, { useEffect, useState } from "react";
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
    // Define the API URL
    const baseUrl = "https://api.quran.com/api/v4";
    const endpoint = "/chapters"; // Example endpoint
    const url = baseUrl + endpoint;

    // Fetch data from the API
    axios
      .get(url)
      .then((response) => {
        setSurahs(response.data.chapters); // Assuming 'chapters' is the key
        //console.log('Set surahs:', response.data.chapters); // Log the set data
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  // Render the list of surahs using FlatList
  return (
    <View style={styles.container}>
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id.toString()} // Ensure key is a string
        renderItem={({ item }) => (
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
            
            {item.revelation_place === "makkah" ? (
              <Image
                source={require("../assets/10171102.png")}
                style={styles.image}
              />
            ) : (
              <Image
                source={require("../assets/6152869.png")}
                style={styles.image}
              />
            )}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.verseText}>{item.name_simple}</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  alignItems: "flex-end",
                  marginRight: 10,
                }}
              >
                <Text style={styles.verseTextArabic}>{item.name_arabic}</Text>
                <Text style={{ fontSize: 10 }}>{item.verses_count} ayahs</Text>
              </View>
            </View>
            <Icon.Button
              name='chevron-right'
              borderRadius={60}
              color={"black"}
              backgroundColor='white'
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  verseContainer: {
    margin: 5,
    padding: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    backgroundColor: "#fff",
    elevation: 2, // Android
    borderRadius: 10,
    height: 100,
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
  loading: {
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
