import React, { useEffect, useState, memo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Switch,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
import RenderHTML from "react-native-render-html";
import { Picker } from "@react-native-picker/picker";
import { useFonts } from "expo-font";

// Allow RTL for Quranic text
I18nManager.allowRTL(true);

const { width, height } = Dimensions.get("window");

const calculateFontSize = (screenWidth) => {
  const multiplier = 0.0664;
  const baseSize = 26;
  const lineHeightMultiplier = 1.5;

  const fontSize = Math.max(baseSize, screenWidth * multiplier);
  const lineHeight = fontSize * lineHeightMultiplier;

  return { fontSize, lineHeight };
};
// Utility to convert numbers to Arabic numerals
const convertToArabicNumerals = (number) => {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicNumerals[parseInt(digit)])
    .join("");
};

// Memoized verse item to prevent unnecessary re-renders
const VerseItem = memo(
  ({ item = {}, fontSize = 16, lineHeight = 1.5, isEnabled = false }) => {
    const source = {
      html: `<span>${
        item.translations[0]?.text || "No translation available"
      }</span>`,
    };

    return (
      <View style={styles.verseContainer}>
        <Text style={[styles.verseText, { fontSize, lineHeight }]}>
          {item.text_imlaei} {convertToArabicNumerals(item.verse_number)}
        </Text>

        {isEnabled && (
          <RenderHTML
            contentWidth={Dimensions.get("window").width}
            source={source}
            tagsStyles={{ p: { color: "#555", fontSize: 16 } }}
          />
        )}
      </View>
    );
  }
);

// Define the HeaderRight component outside of SurahScreen
const HeaderRight = ({ isOpen, toggleOpen }) => (
  <TouchableOpacity style={{ marginRight: 10 }} onPress={toggleOpen}>
    {isOpen ? (
      <Icon name='chevron-up' color='black' size={20} />
    ) : (
      <Icon name='chevron-down' color='black' size={20} />
    )}
  </TouchableOpacity>
);

const SurahScreen = ({ route, navigation }) => {
  const { surahNumber, hasBismillah, verseCount, surahName } = route.params;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page for pagination
  const [loadingMore, setLoadingMore] = useState(false); // Handle loading more verses
  const [isEnabled, setIsEnabled] = useState(false); // State for the switch
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [selectedValue, setSelectedValue] = useState("Choose a Language");
  const [isOpen, setIsOpen] = useState(false);
  // Toggle switch state
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleOpen = () => setIsOpen((previousState) => !previousState);

  // Set navigation options (header title and Switch)
  useEffect(() => {
    navigation.setOptions({
      title: surahName,
      headerRight: () => (
        <HeaderRight isOpen={isOpen} toggleOpen={toggleOpen} />
      ), // Pass props
    });
  }, [surahName, isOpen, navigation]);

  const [fontsLoaded] = useFonts({
    "uthmani-font": require("../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf"),
  });

  // Fetch surah data (with pagination)
  const fetchSurah = useCallback(
    async (page) => {
      setLoadingMore(true);
      try {
        const response = await axios.get(
          `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?page=${page}&fields=text_imlaei,chapter_id&translations=131&per_page=${verseCount}`
        );
        let fetchedVerses = response.data.verses;

        if (
          page === 1 &&
          surahNumber !== 9 &&
          surahNumber !== 1 &&
          hasBismillah
        ) {
          const bismillahItem = {
            id: "bismillah",
            text_imlaei: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
            verse_number: "", // No verse number for Bismillah
            translations: [
              {
                text: "In the name of Allah, the Most Gracious, the Most Merciful",
              },
            ],
          };
          fetchedVerses = [bismillahItem, ...fetchedVerses];
        }

        setVerses((prevVerses) => [...prevVerses, ...fetchedVerses]);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An error occurred");
        setLoading(false);
      } finally {
        setLoadingMore(false);
      }
    },
    [surahNumber, hasBismillah, verseCount]
  );

  useEffect(() => {
    fetchSurah(currentPage); // Fetch first page of verses when the component mounts
  }, [currentPage, fetchSurah]);

  // Load more verses when the user reaches the end of the list
  const loadMoreVerses = () => {
    if (!loadingMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Toggle modal visibility
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Render loading state
  if (loading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  const { fontSize, lineHeight } = calculateFontSize(width);

  const handleSelect = (index, value) => {
    setSelectedValue(value);
  };

  return (
    <View style={{ flex: 1 }}>
      {isOpen && (
        <View
          style={{
            backgroundColor: "white",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            maxHeight: 50,
            paddingHorizontal: 10,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              maxHeight: 50,
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ marginRight: 10 }}>Translation</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor='#3e3e3e'
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>

          <TouchableOpacity onPress={toggleModal}>
            <Text>{selectedValue}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <FlatList
          data={verses}
          renderItem={({ item }) => (
            <VerseItem
              item={item}
              fontSize={fontSize}
              lineHeight={lineHeight}
              isEnabled={isEnabled}
            />
          )}
          keyExtractor={(item) => item.id.toString() || item.text_imlaei}
          contentContainerStyle={styles.flatlistContent}
          onEndReached={loadMoreVerses} // Fetch more data when the user scrolls to the end
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size='small' color='#0000ff' />
            ) : null
          }
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navButton}>
            <Icon name='play' size={25} color='black' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
            <Icon name='book-open' size={25} color='black' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name='bookmark' size={25} color='black' />
          </TouchableOpacity>
        </View>

        {/* Modal */}
        <Modal
          isVisible={isModalVisible}
          swipeDirection='down'
          onSwipeComplete={toggleModal}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.label}>Choose a language:</Text>
            <Picker
              selectedValue={selectedValue}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedValue(itemValue)
              }
            >
              <Picker.Item label='English' value='English' />
              <Picker.Item label='Burmese' value='Burmese' />
              <Picker.Item label='Turkish' value='Turkish' />
              <Picker.Item label='Indonesian' value='Indonesian' />
            </Picker>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flatlistContent: {
    padding: 15,
    backgroundColor: "#F9F6EF",
    minHeight: "100%",
  },
  verseContainer: {
    width: width * 0.9,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderBottomColor: "#000",
    alignSelf: "center",
  },
  verseText: {
    fontFamily: "uthmani-font",
    color: "#333",
    flexWrap: "wrap",
    writingDirection: "rtl",
    textAlign: "justify",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNavigation: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  navButton: {
    alignItems: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.3,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    fontSize: 18,
    color: "blue",
  },
  picker: {
    height: 50,
    width: 200,
  },
});

export default SurahScreen;
