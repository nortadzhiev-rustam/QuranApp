import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    // Tab Bar
    quran: 'Quran',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
    search: 'Search',

    // HomeScreen
    ayahs: 'ayahs',
    searchSurahs: 'Search surahs',
    alQuran: "Al-Qur'an",
    loading: 'Loading...',

    // SettingsScreen
    appearance: 'Appearance',
    theme: 'Theme',
    autoSystem: 'Auto (System)',
    light: 'Light',
    dark: 'Dark',
    currentTheme: 'Current theme',
    mode: 'Mode',
    autoFollowingSystem: 'Auto (following system)',
    language: 'Language',
    selectLanguage: 'Select Language',
    startTypingToSearch: 'Start typing to search...',
    // BookmarksScreen
    loadingBookmarks: 'Loading bookmarks...',
    noBookmarksYet: 'No bookmarks yet',
    edit: 'Edit',
    ayah: 'Ayah',

    // SearchScreen
    searchSurahsAndBookmarks: 'Search surahs and bookmarks',
    surahs: 'Surahs',

    // SurahScreen
    translation: 'Translation',
    surah: 'Surah',
    meccan: 'Meccan',
    medinan: 'Medinan',

    // Languages
    english: 'English',
    russian: 'Russian',
    turkish: 'Turkish',
    burmese: 'Burmese',
    indonesian: 'Indonesian',
  },
  ru: {
    // Tab Bar
    quran: 'Коран',
    bookmarks: 'Закладки',
    settings: 'Настройки',
    search: 'Поиск',

    // HomeScreen
    ayahs: 'аяты',
    searchSurahs: 'Поиск сур',
    alQuran: 'Коран',
    loading: 'Загрузка...',

    // SettingsScreen
    appearance: 'Внешний вид',
    theme: 'Тема',
    autoSystem: 'Авто (Система)',
    light: 'Светлая',
    dark: 'Тёмная',
    currentTheme: 'Текущая тема',
    mode: 'Режим',
    autoFollowingSystem: 'Авто (следует системе)',
    language: 'Язык',
    selectLanguage: 'Выберите язык',

    // BookmarksScreen
    loadingBookmarks: 'Загрузка закладок...',
    noBookmarksYet: 'Пока нет закладок',
    edit: 'Изменить',
    ayah: 'Аят',

    // SearchScreen
    searchSurahsAndBookmarks: 'Поиск сур и закладок',
    surahs: 'Суры',

    // SurahScreen
    translation: 'Перевод',
    surah: 'Сура',
    meccan: 'Мекканская',
    medinan: 'Мединская',

    // Languages
    english: 'Английский',
    russian: 'Русский',
    turkish: 'Турецкий',
    burmese: 'Бирманский',
    indonesian: 'Индонезийский',
  },
  tr: {
    // Tab Bar
    quran: 'Kuran',
    bookmarks: 'Ayraç',
    settings: 'Ayarlar',
    search: 'Ara',

    // HomeScreen
    ayahs: 'ayet',
    searchSurahs: 'Sure ara',
    alQuran: 'Kuran',
    loading: 'Yükleniyor...',

    // SettingsScreen
    appearance: 'Görünüm',
    theme: 'Tema',
    autoSystem: 'Otomatik (Sistem)',
    light: 'Açık',
    dark: 'Koyu',
    currentTheme: 'Mevcut tema',
    mode: 'Mod',
    autoFollowingSystem: 'Otomatik (sistemi takip ediyor)',
    language: 'Dil',
    selectLanguage: 'Dil Seçin',
    noResultsFound: 'Sonuç bulunamadı',
    startTypingToSearch: 'Aramaya başlamak için yazın...',
    // BookmarksScreen
    loadingBookmarks: 'ayraç yükleniyor...',
    noBookmarksYet: 'Henüz ayraç yok',
    edit: 'Düzenle',
    ayah: 'Ayet',

    // SearchScreen
    searchSurahsAndBookmarks: 'Sureleri ve ayraç ara',
    surahs: 'Sureler',

    // SurahScreen
    translation: 'Çeviri',
    surah: 'Sure',
    meccan: 'Mekki',
    medinan: 'Medeni',

    // Languages
    english: 'İngilizce',
    russian: 'Rusça',
    turkish: 'Türkçe',
    burmese: 'Birmanca',
    indonesian: 'Endonezce',
  },
};

// Helper function to get the appropriate Quran data file based on language
export const getQuranData = (language) => {
  switch (language) {
    case 'tr':
      return require('../quran/quran_tr.json');
    case 'ru':
      return require('../quran/quran_ru.json');
    case 'en':
    default:
      return require('../quran/quran.json');
  }
};

// Helper function to get chapter data with translations based on language
export const getChapterData = (language) => {
  const chapters = require('../quran/chapters.json');
  const quranData = getQuranData(language);

  // Map chapters with language-specific translations
  return chapters.map((chapter) => {
    const quranChapter = quranData.find((q) => q.id === chapter.id);
    return {
      ...chapter,
      translation: quranChapter?.translation || chapter.translation,
    };
  });
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
  getQuranData: () => {},
  getChapterData: () => {},
});

const LANGUAGE_STORAGE_KEY = '@quran_app_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  // Load saved language on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const setLanguage = async (lang) => {
    try {
      if (translations[lang]) {
        setLanguageState(lang);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    getQuranData: (lang) => getQuranData(lang || language),
    getChapterData: (lang) => getChapterData(lang || language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { translations };
