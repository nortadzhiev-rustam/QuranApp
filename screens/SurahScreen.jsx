import React, { useEffect, useState, memo } from 'react';
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
  Platform,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Picker } from '@react-native-picker/picker';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Enable RTL for Arabic text
I18nManager.allowRTL(true);

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Utility function to convert numbers to Arabic numerals
const convertToArabicNumerals = (number) => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number
    .toString()
    .split('')
    .map((digit) => arabicNumerals[parseInt(digit)])
    .join('');
};

// Calculate dynamic font size based on screen width
const calculateFontSize = (screenWidth) => {
  const multiplier = 0.0664;
  const baseSize = 26;
  const lineHeightMultiplier = 1.5;
  const fontSize = Math.max(baseSize, screenWidth * multiplier);
  const lineHeight = fontSize * lineHeightMultiplier;

  return { fontSize, lineHeight };
};

// Memoized VerseItem to prevent unnecessary re-renders
const VerseItem = memo(
  ({
    item = {},
    fontSize = 16,
    lineHeight = 1.5,
    isEnabled = false,
    theme,
  }) => {
    if (item.id === 'bismillah') {
      return (
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.verseContainer}>
        <Text
          style={[
            styles.verseText,
            {
              fontSize: Platform.isPad ? fontSize * 0.8 : fontSize,
              lineHeight: Platform.isPad ? lineHeight * 0.8 : lineHeight,
              color: theme.colors.text,
            },
          ]}
        >
          {item.text} {convertToArabicNumerals(item.id)}
        </Text>

        {isEnabled && (
          <Text
            style={[
              styles.verseTranslation,
              {
                fontSize: Platform.isPad ? fontSize * 0.4 : fontSize * 0.6,
                lineHeight: Platform.isPad
                  ? lineHeight * 0.6
                  : lineHeight * 0.5,
                marginTop: 10,
                color: theme.colors.textSecondary,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            {item.translation}
          </Text>
        )}
      </View>
    );
  },
);

// HeaderRight component for navigation bar
const HeaderRight = ({ isOpen, toggleOpen, theme }) => (
  <TouchableOpacity style={{ marginRight: 10 }} onPress={toggleOpen}>
    <Icon
      name={isOpen ? 'chevron-up' : 'chevron-down'}
      color={theme.colors.text}
      size={20}
    />
  </TouchableOpacity>
);

const SurahScreen = ({ route, navigation }) => {
  const { surahNumber, hasBismillah, nameArabic, type, surahName } =
    route.params;
  const { theme } = useTheme();
  const { t, language, getQuranData } = useLanguage();

  // States
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [loadingMore, setLoadingMore] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false); // Translation switch
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [selectedValue, setSelectedValue] = useState('English');
  const [isOpen, setIsOpen] = useState(false); // Translation toggle menu
  const [isScrolled, setIsScrolled] = useState(false); // Track scroll state

  // Font loading
  const [fontsLoaded] = useFonts({
    'uthmani-font': require('../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });

  // Toggle switch state for translation
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleOpen = () => setIsOpen((previousState) => !previousState);

  // Load Surah data
  useEffect(() => {
    if (fontsLoaded) {
      // Load quran data based on language
      const quranData = getQuranData();
      let surah = quranData.find((item) => item.id === surahNumber);

      // Get bismillah translation based on language
      let bismillahTranslation =
        'In the name of Allah, the Most Gracious, the Most Merciful';
      if (language === 'tr') {
        bismillahTranslation = "Rahman ve Rahim olan Allah'ın adıyla";
      } else if (language === 'ru') {
        bismillahTranslation = 'Во имя Аллаха, Милостивого, Милосердного';
      }

      const bismillahItem = {
        id: 'bismillah',
        text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        translation: bismillahTranslation,
      };

      if (surah?.verses) {
        if (
          hasBismillah &&
          !surah.verses.some((verse) => verse.id === 'bismillah')
        ) {
          surah = { ...surah, verses: [bismillahItem, ...surah.verses] }; // Add Bismillah if required
        }
        setVerses(surah.verses);
      } else {
        setError('Surah not found');
      }
    }

    setLoading(false);
  }, [surahNumber, fontsLoaded, language, getQuranData]);

  // Update navigation header
  useEffect(() => {
    navigation.setOptions({
      headerBackButtonDisplayMode: 'minimal',
      title: surahName,
      headerRight: () => (
        <HeaderRight isOpen={isOpen} toggleOpen={toggleOpen} theme={theme} />
      ),
    });
  }, [isOpen, navigation, surahName, theme]);

  // Load more verses for pagination
  const loadMoreVerses = () => {
    if (!loadingMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // Modal toggle
  const toggleModal = () => setModalVisible(!isModalVisible);

  // Handle scroll event
  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    setIsScrolled(currentOffset > 50); // Adjust threshold
  };

  // Loading and error views
  if (loading && currentPage === 1) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>{error}</Text>
      </View>
    );
  }

  const { fontSize, lineHeight } = calculateFontSize(width);

  return (
    <View style={{ flex: 1 }}>
      {/* Translation toggle menu */}
      {isOpen && (
        <View
          style={[
            styles.headerContainer,
            {
              backgroundColor: theme.colors.background,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.translationToggle}>
            <Text style={{ marginRight: 10, color: theme.colors.text }}>
              {t.translation}
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          {Platform.OS === 'android' ? (
            <Picker
              selectedValue={selectedValue}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setSelectedValue(itemValue);
              }}
            >
              <Picker.Item label={t.english} value='English' />
              <Picker.Item label={t.burmese} value='Burmese' />
              <Picker.Item label={t.turkish} value='Turkish' />
              <Picker.Item label={t.indonesian} value='Indonesian' />
            </Picker>
          ) : (
            <TouchableOpacity onPress={toggleModal}>
              <Text style={{ color: theme.colors.text }}>{selectedValue}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={{ flex: 1 }}>
        {/* Surah name and type, hidden when scrolled */}
        {!isScrolled && (surahNumber !== 1 || isEnabled) && (
          <SafeAreaView edges={['top']} style={{ marginTop: 50 }}>
            <View style={styles.surahNameContainer}>
              <ImageBackground
                style={styles.surahNameBackground}
                resizeMode='cover'
                source={require('../assets/surahName.jpeg')}
              >
                <Text style={[styles.verseText, styles.surahName]}>
                  سُورَةٌ {nameArabic}
                </Text>
                <Text style={[styles.verseText, styles.surahType]}>
                  {type === 'meccan' ? 'مَكِّيَّاتٌ' : 'مَدَنِيَّاتٌ'}
                </Text>
              </ImageBackground>
            </View>
          </SafeAreaView>
        )}

        {/* FlatList for Surah verses when enabled */}
        {isEnabled ? (
          <FlatList
            data={verses}
            renderItem={({ item }) => (
              <VerseItem
                item={item}
                fontSize={fontSize}
                lineHeight={lineHeight}
                isEnabled={isEnabled}
                theme={theme}
              />
            )}
            contentInsetAdjustmentBehavior='automatic'
            keyExtractor={(item) => item.id.toString() || item.text}
            contentContainerStyle={styles.flatlistContent}
            onEndReached={loadMoreVerses}
            onEndReachedThreshold={0.5}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size='small' color={theme.colors.accent} />
              ) : null
            }
          />
        ) : surahNumber !== 1 ? (
          <ScrollView
            style={{
              flex: 1,
              marginTop: isScrolled ? 0 : Platform.isPad ? 200 : 100,
              backgroundColor: theme.colors.background,
            }}
            onScroll={handleScroll}
            contentInsetAdjustmentBehavior='automatic'
          >
            {/* Render Bismillah as a block at the top */}
            {verses.some((verse) => verse.id === 'bismillah') && (
              <View style={styles.bismillahContainer}>
                <Text style={styles.bismillahText}>
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </Text>
              </View>
            )}

            {/* Render all verses inline after Bismillah */}
            <Text
              style={[
                styles.verseText,
                {
                  fontSize,
                  lineHeight,
                  flexWrap: 'wrap',
                  padding: 10,
                  alignItems: 'justify',
                  color: theme.colors.text,
                },
              ]}
            >
              {verses.map((verse, index) =>
                verse.id !== 'bismillah' ? (
                  <Text key={verse.id.toString()}>
                    {verse.text} {convertToArabicNumerals(verse.id)}{' '}
                  </Text>
                ) : null,
              )}
            </Text>
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <Image
              style={styles.alFatihahImage}
              source={require('../assets/fatiha.png')}
            />
          </View>
        )}
      </View>
      {/* Bottom navigation */}
      <View
        style={[
          styles.bottomNavigation,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.navButton}>
          <Icon name='play' size={25} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <Icon name='bookmark' size={25} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Modal for language selection */}

      {isModalVisible && (
        <Modal
          isVisible={isModalVisible}
          swipeDirection='down' // Change to swipe down if needed
          onSwipeComplete={toggleModal}
          style={styles.modal}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t.selectLanguage}
            </Text>
            <Picker
              selectedValue={selectedValue}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setSelectedValue(itemValue);
                toggleModal();
              }}
            >
              <Picker.Item label={t.english} value='English' />
              <Picker.Item label={t.burmese} value='Burmese' />
              <Picker.Item label={t.turkish} value='Turkish' />
              <Picker.Item label={t.indonesian} value='Indonesian' />
            </Picker>
          </View>
        </Modal>
      )}

      {isModalVisible && (
        <Modal
          isVisible={isModalVisible}
          swipeDirection='down' // Change to swipe down if needed
          onSwipeComplete={toggleModal}
          style={styles.modal}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t.selectLanguage}
            </Text>
            <Picker
              selectedValue={selectedValue}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setSelectedValue(itemValue);
                toggleModal();
              }}
            >
              <Picker.Item label={t.english} value='English' />
              <Picker.Item label={t.burmese} value='Burmese' />
              <Picker.Item label={t.turkish} value='Turkish' />
              <Picker.Item label={t.indonesian} value='Indonesian' />
            </Picker>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Stylesheet for SurahScreen
const styles = StyleSheet.create({
  flatlistContent: {
    minHeight: '100%',
    marginTop: Platform.isPad ? 200 : 100,
    paddingBottom: Platform.isPad ? 200 : 100,
    paddingTop: 10,
  },
  verseContainer: {
    width: width * 0.95,
    marginBottom: 15,
    alignSelf: 'center',
  },
  verseText: {
    fontFamily: 'uthmani-font',
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
  verseTranslation: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
  },
  bismillahContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  bismillahText: {
    fontFamily: 'uthmani-font',
    fontSize: width * 0.08,
    color: '#D7233C',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNameContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
    width: width,
    maxHeight: 1,
    zIndex: 1,
    alignItems: 'center',
  },
  surahNameBackground: {
    width: width,
    height: Platform.isPad ? 200 : 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahName: {
    color: '#fff',
    fontSize: width * 0.07,
    lineHeight: width * 0.1,
    alignItems: 'center',
  },
  surahType: {
    color: '#fff',
    fontSize: width * 0.07,
    lineHeight: width * 0.1,
  },
  alFatihahImage: {
    margin: 0,
    maxWidth: width,
    height: Platform.isPad ? height * 0.9 : height * 0.81,
  },
  bottomNavigation: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  navButton: {
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0, // No margin around the modal
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: width,
    height: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    height: 10,
    width: '40%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 70,
    padding: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  translationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SurahScreen;
