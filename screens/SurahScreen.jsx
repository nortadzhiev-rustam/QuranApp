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
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
import RenderHTML from "react-native-render-html";
import { I18nManager } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
const VerseItem = memo(({ item, fontSize, lineHeight, isEnabled }) => {
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

      <RenderHTML
        contentWidth={Dimensions.get("window").width}
        source={source}
        tagsStyles={{ p: { color: "#555", fontSize: 16 } }}
      />
    </View>
  );
});

const SurahScreen = ({ route, navigation }) => {
  const { surahNumber, hasBismillah, verseCount, surahName } = route.params;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page for pagination
  const [loadingMore, setLoadingMore] = useState(false); // Handle loading more verses
  const [isEnabled, setIsEnabled] = useState(false); // State for the switch
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [selectedValue, setSelectedValue] = useState("java");
  // Toggle switch state
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  // Set navigation options (header title and Switch)
  useEffect(() => {
    navigation.setOptions({
      title: surahName,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 10 }} onPress={toggleSwitch}>
          {isEnabled ? (
            <Icon name='chevron-up' color='black' size={20} />
          ) : (
            <Icon name='chevron-down' color='black' size={20} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [surahName, isEnabled, navigation]);

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

  return (
    <View style={{ flex: 1 }}>
      {isEnabled && (
        <View style={{ flex: 1, height: 2, backgroundColor: "white" }}></View>
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
            <Text style={styles.modalTitle}>Modal Content</Text>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
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
    height: height * 0.9,
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
});

export default SurahScreen;
