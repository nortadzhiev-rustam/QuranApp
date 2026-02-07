import React, { useEffect, useState, memo, use } from 'react';
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
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { TabBarContext } from '@/contexts/TabBarContext';
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
    .map((digit) => arabicNumerals[Number.parseInt(digit, 10)])
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
  ({ item = {}, fontSize = 16, lineHeight = 1.5, isEnabled = false }) => {
    if (item.id === 'bismillah') {
      return (
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
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
              textAlign: isEnabled ? 'right' : 'justify',
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
const HeaderRight = ({ isOpen, toggleOpen }) => (
  <TouchableOpacity style={{}} onPress={toggleOpen}>
    <Icon
      name={isOpen ? 'chevron-up' : 'chevron-down'}
      color='black'
      size={20}
    />
  </TouchableOpacity>
);

// Main SurahScreen component
const SurahScreen = () => {
  const params = useLocalSearchParams();
  const surahNumber = Number.parseInt(params.id, 10);
  const hasBismillah =
    params.hasBismillah === 'true' || params.hasBismillah === true;
  const nameArabic = params.nameArabic;
  const type = params.type;
  const surahName = params.surahName;

  // States
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Pagination
  const [loadingMore] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false); // Translation switch
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
  const [selectedValue, setSelectedValue] = useState('English');
  const [isOpen, setIsOpen] = useState(false); // Translation toggle menu
  const [isScrolled, setIsScrolled] = useState(false); // Track scroll state
  const { setIsTabBarHidden } = use(TabBarContext);
  // Font loading
  const [fontsLoaded] = useFonts({
    'uthmani-font': require('../../../../assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });

  // Toggle switch state for translation
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleOpen = () => setIsOpen((previousState) => !previousState);
  const handlePlayPress = () => {};
  const handleBookmarkPress = () => {};
  useFocusEffect(() => {
    setIsTabBarHidden(true);
    return () => setIsTabBarHidden(false);
  });
  // Load Surah data
  useEffect(() => {
    if (fontsLoaded) {
      // Lazy load quran data to prevent Metro freeze
      const quranData = require('@/quran/quran.json');
      let surah = quranData.find((item) => item.id === surahNumber);

      const bismillahItem = {
        id: 'bismillah',
        text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        translation:
          'In the name of Allah, the Most Gracious, the Most Merciful',
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
  }, [surahNumber, fontsLoaded]);

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
    <>
      <Stack.Screen
        options={{
          headerBackButtonDisplayMode: 'minimal',
          title: surahName,
          headerRight:
            Platform.OS === 'android'
              ? () => <HeaderRight isOpen={isOpen} toggleOpen={toggleOpen} />
              : undefined,
        }}
      />
      {Platform.OS === 'ios' && (
        <>
          <Stack.Toolbar placement='bottom'>
            <Stack.Toolbar.Button
              icon='play.fill'
              accessibilityLabel='Play verse'
              onPress={handlePlayPress}
            />
            <Stack.Toolbar.Spacer />
            <Stack.Toolbar.Button
              icon='bookmark'
              accessibilityLabel='Bookmark verse'
              onPress={handleBookmarkPress}
            />
          </Stack.Toolbar>
          <Stack.Toolbar placement='right'>
            {isEnabled && (
              <Stack.Toolbar.Menu icon='translate' title={selectedValue}>
                {['English', 'Burmese', 'Turkish', 'Indonesian'].map(
                  (language) => (
                    <Stack.Toolbar.MenuAction
                      key={language}
                      isOn={selectedValue === language}
                      onPress={() => setSelectedValue(language)}
                    >
                      {language}
                    </Stack.Toolbar.MenuAction>
                  ),
                )}
              </Stack.Toolbar.Menu>
            )}
            <Stack.Toolbar.Menu icon='ellipsis'>
              <Stack.Toolbar.MenuAction
                icon='switch.2'
                isOn={isEnabled}
                onPress={toggleSwitch}
              >
                Translate
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
          </Stack.Toolbar>
        </>
      )}
      <View style={{ flex: 1 }}>
        {/* Translation toggle menu */}
        {isOpen && Platform.OS === 'android' && (
          <View style={styles.headerContainer}>
            <View style={styles.translationToggle}>
              <Text style={{ marginRight: 10 }}>Translation</Text>
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
                <Picker.Item label='English' value='English' />
                <Picker.Item label='Burmese' value='Burmese' />
                <Picker.Item label='Turkish' value='Turkish' />
                <Picker.Item label='Indonesian' value='Indonesian' />
              </Picker>
            ) : (
              <TouchableOpacity onPress={toggleModal}>
                <Text>{selectedValue}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={{ flex: 1 }}>
          {/* Surah name and type, hidden when scrolled */}
          {!isScrolled && (surahNumber !== 1 || isEnabled) && (
            <SafeAreaView
              edges={[Platform.OS === 'ios' && 'top']}
              style={{ marginTop: Platform.OS === 'ios' ? 50 : 0 }}
            >
              <View style={styles.surahNameContainer}>
                <ImageBackground
                  style={styles.surahNameBackground}
                  resizeMode='cover'
                  source={require('../../../../assets/surahName.jpeg')}
                >
                  <Text style={[styles.verseText, styles.surahName]}>
                    سُورَةٌ {nameArabic}
                  </Text>
                  <Text style={[styles.verseText, styles.surahType]}>
                    {type === 'meccan' ? 'مَكِّيَّاتٌ' : 'مَدَنِيَّاتٌ'}
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
                  <ActivityIndicator size='small' color='#0000ff' />
                ) : null
              }
            />
          ) : surahNumber !== 1 ? (
            <ScrollView
              style={{
                flex: 1,
                marginTop: isScrolled ? 0 : Platform.isPad ? 200 : 100,
                backgroundColor: '#F9F6EF',
              }}
              onScroll={handleScroll}
              contentInsetAdjustmentBehavior='automatic'
            >
              {/* Render Bismillah as a block at the top */}
              {verses.some((verse) => verse.id === 'bismillah') && (
                <View style={styles.bismillahContainer}>
                  <Text style={styles.bismillahText}>
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
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
            <SafeAreaView
              edges={[Platform.OS === 'ios' && 'top']}
              style={{ marginTop: Platform.OS === 'ios' ? 50 : 0 }}
            >
              <View style={{ flex: 1 }}>
                <Image
                  style={styles.alFatihahImage}
                  source={require('../../../../assets/fatiha.png')}
                />
              </View>
            </SafeAreaView>
          )}
          {/* Bottom navigation */}
          {Platform.OS === 'android' && (
            <View style={styles.bottomNavigation}>
              <TouchableOpacity style={styles.navButton}>
                <Icon name='play' size={25} color='black' />
              </TouchableOpacity>

              <TouchableOpacity style={styles.navButton}>
                <Icon name='bookmark' size={25} color='black' />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

// Stylesheet for SurahScreen
const styles = StyleSheet.create({
  flatlistContent: {
    backgroundColor: '#F9F6EF',
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
    color: '#333',
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
  verseTranslation: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
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
    height: Platform.isPad ? height * 0.9 : height * 0.78,
  },
  bottomNavigation: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  navButton: {
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  modalContent: {
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 70,
    padding: 10,
    justifyContent: 'space-between',
  },
  translationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SurahScreen;
