import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  I18nManager,
} from "react-native";
import axios from "axios";
import { useFonts } from "expo-font";
import { PanGestureHandler } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
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

const SurahScreen = ({ route, navigation }) => {
  const { initialPage, nameArabic, hasBismillah } = route.params;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageData, setPageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [isNavVisible, setNavVisible] = useState(false); // State for navigation bar visibility

  const bottomNavAnim = useRef(new Animated.Value(height)).current; // Initial position is offscreen
  const topNavAnim = useRef(new Animated.Value(0)).current; // Initial position is visible (if needed)

  const [fontsLoaded] = useFonts({
    "uthmani-font": require("../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf"),
    "surah-name": require("../assets/fonts/quran/surah_name/sura_names.ttf"),
  });

  

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.quran.com/api/v4/verses/by_page/${currentPage}?fields=text_imlaei,chapter_id`
        );
        setPageData(response.data.verses);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    fetchPage();
  }, [currentPage]);

  const onGestureEvent = (event) => {
    const { translationX } = event.nativeEvent;
    if (translationX > 50 && currentPage < 604) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (translationX < -50 && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const toggleModal = () => setModalVisible(!isModalVisible);

  const handleScreenTap = () => {
    setNavVisible(!isNavVisible);

    if (isNavVisible) {
      // Hide navigation bars
      Animated.timing(bottomNavAnim, {
        toValue: height, // Slide down the bottom bar
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.timing(topNavAnim, {
        toValue: -100, // Slide up the custom top header (adjust height accordingly)
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Show navigation bars
      Animated.timing(bottomNavAnim, {
        toValue: height - 60, // Slide up the bottom bar
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.timing(topNavAnim, {
        toValue: 0, // Slide down the custom top header
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  const { fontSize, lineHeight } = calculateFontSize(width);

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={{ flex: 1 }}>
        {isNavVisible && (
          <Animated.View style={[styles.topNavigation, { top: topNavAnim }]}>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                height: 100,
              }}
              onPress={() => navigation.navigate("Home")}
            >
              <Icon
                name='chevron-left'
                style={{ marginTop: 50, marginLeft: 30 }}
                size={18}
              />
            </TouchableOpacity>
            <View
              style={{
                alignItems: "flex-start",
                height: 100,

                justifyContent: "flex-end",
                paddingBottom: 15,
              }}
            >
              <Text style={{ fontSize: 18 }}>Al Quran-ul Kareem</Text>
            </View>
            <View style={{ flex: 1 }}></View>
          </Animated.View>
        )}
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.verseContainer}>
              <Text
                style={[
                  styles.verseText,
                  { fontSize: fontSize, lineHeight: lineHeight },
                ]}
              >
                {pageData.map((verse) => (
                  <Text key={verse.id}>
                    {/* Conditionally render Bismillah */}
                    {currentPage === initialPage &&
                      hasBismillah &&
                      verse.verse_number === 1 && (
                        <Text
                          style={[styles.bismillah, { fontSize, lineHeight }]}
                        >
                          {"\n"}
                          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                          {"\n"}
                        </Text>
                      )}
                    {verse.text_imlaei}{" "}
                    {convertToArabicNumerals(verse.verse_number)}{" "}
                  </Text>
                ))}
              </Text>
            </View>
            {/* Conditionally render page number */}
            {!isNavVisible && (
              <Text style={styles.pageNumber}>Page: {currentPage}</Text>
            )}
          </ScrollView>
        </PanGestureHandler>

        {/* Conditionally render Bottom Navigation Bar */}
        {isNavVisible && (
          <Animated.View
            style={[styles.bottomNavigation, { bottom: bottomNavAnim }]}
          >
            <TouchableOpacity style={styles.navButton}>
              <Icon name='play' size={25} color='black' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
              <Icon name='book-open' size={25} color='black' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton}>
              <Icon name='bookmark' size={25} color='black' />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Sliding Meal Modal */}
        <Modal
          isVisible={isModalVisible}
          swipeDirection='down'
          onSwipeComplete={toggleModal}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Meal Content</Text>
            <Text>This is the sliding up Meal content.</Text>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6EF",
    paddingTop: 25,
    paddingBottom: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  bismillah: {
    fontSize: 28,
    fontFamily: "uthmani-font",
    textAlign: "center",
    marginBottom: 50,
    color: "#333",
  },
  surahName: {
    fontSize: 24,
    fontFamily: "surah-name",
    textAlign: "center",
    marginVertical: 10,
    color: "#333",
  },
  verseContainer: {
    width: width * 0.9,
  },
  verseText: {
    marginTop: 10,
    fontFamily: "uthmani-font",
    color: "#333",
    flexWrap: "wrap",
    writingDirection: "rtl",
    textAlign: "justify",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20, // Adjusted to accommodate the navigation bar
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    width: "100%",
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
    position: "absolute",
    left: 0,
    right: 0,
    top: height - 60,
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  topNavigation: {
    position: "absolute",
    width: "100%",
    height: 100, // Adjust based on your custom header height
    backgroundColor: "#fff",
    justifyContent: "space-around",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    zIndex: 1, // Ensure it stays on top
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
    position: "absolute",
    top: -80, // Adjust this value to control how far down the button is from the top
    right: 130,
    marginTop: 20,
    fontSize: 18,
    color: "blue",
  },
});

export default SurahScreen;

function convertToArabicNumerals(number) {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((digit) => arabicNumerals[parseInt(digit)])
    .join("");
}
