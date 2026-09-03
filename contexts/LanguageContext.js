import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  en: {
    // Tab Bar
    quran: 'Quran',
    bookmarks: 'Bookmarks',
    settings: 'Settings',
    tajweedGuide: 'Tajweed Guide',
    tajweedGuideDescription:
      'Understand the color codes used for Tajweed rules while reading.',
    tajweedLegendTitle: 'Tajweed Legend',
    tajweedRuleQalqalaName: 'Qalqala',
    tajweedRuleQalqalaDescription: 'Echoing/Bouncing',
    tajweedRuleIdghaamName: 'Idghaam',
    tajweedRuleIdghaamDescription: 'Merging (with Ghunna)',
    tajweedRuleIdghaamWithoutGhunnaDescription: 'Merging (without Ghunna)',
    tajweedRuleIkhfaName: 'Ikhfa',
    tajweedRuleIkhfaDescription: 'Hiding',
    tajweedRuleIqlabName: 'Iqlab',
    tajweedRuleIqlabDescription: 'Changing',
    tajweedRuleIzharName: 'Izhar',
    tajweedRuleIzharDescription: 'Clear Pronunciation',
    tajweedRuleMaddName: 'Madd',
    tajweedRuleMaddDescription: 'Prolongation',
    tajweedRuleMaddMunfasilName: 'Madd Munfasil',
    tajweedRuleMaddMunfasilDescription: 'Separated Prolongation',
    tajweedRuleMaddLazimName: 'Madd Lazim',
    tajweedRuleMaddLazimDescription: 'Necessary Prolongation',
    tajweedRuleLaamShamsiyyaName: 'Laam Shamsiyyah',
    tajweedRuleLaamShamsiyyaDescription: 'Silent Laam',
    tajweedRuleAllahName: 'Lafz al-Jalala',
    tajweedRuleAllahDescription: "Allah's Name",
    tajweedExampleLabel: 'Example',
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
    customizeYourExperience: 'Customize your app experience',
    tajweedSettings: 'Tajweed Settings',
    enableTajweed: 'Enable Tajweed',
    tajweedDescription: 'Color-code Quranic text according to Tajweed rules',
    highlightAllah: "Highlight Allah's Name",
    tawafuqDescription: 'Highlight occurrences of Lafz al-Jalala (الله)',
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
    arabicOnly: 'Arabic only',
    surah: 'Surah',
    meccan: 'Meccan',
    medinan: 'Medinan',

    // Juz / Hizb / Page
    juz: 'Juz',
    hizb: 'Hizb',
    page: 'Page',
    goToPage: 'Go to page',
    pageRangeHint: 'Enter a page number from 1 to 604',
    go: 'Go',
    cancel: 'Cancel',

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
    tajweedGuide: 'Таджвид',
    tajweedGuideDescription:
      'Понимайте цветовые правила таджвида во время чтения.',
    tajweedLegendTitle: 'Легенда таджвида',
    tajweedRuleQalqalaName: 'Калькаля',
    tajweedRuleQalqalaDescription: 'Отражённое/прыгающее произношение',
    tajweedRuleIdghaamName: 'Идгам',
    tajweedRuleIdghaamDescription: 'Слияние (с гунной)',
    tajweedRuleIdghaamWithoutGhunnaDescription: 'Слияние (без гунны)',
    tajweedRuleIkhfaName: 'Ихфа',
    tajweedRuleIkhfaDescription: 'Скрывание',
    tajweedRuleIqlabName: 'Икляб',
    tajweedRuleIqlabDescription: 'Преобразование',
    tajweedRuleIzharName: 'Изхар',
    tajweedRuleIzharDescription: 'Ясное произношение',
    tajweedRuleMaddName: 'Мадд',
    tajweedRuleMaddDescription: 'Продление',
    tajweedRuleMaddMunfasilName: 'Мадд мунфасиль',
    tajweedRuleMaddMunfasilDescription: 'Раздельное продление',
    tajweedRuleMaddLazimName: 'Мадд лазим',
    tajweedRuleMaddLazimDescription: 'Обязательное продление',
    tajweedRuleLaamShamsiyyaName: 'Лям шамсийя',
    tajweedRuleLaamShamsiyyaDescription: 'Немая лям',
    tajweedRuleAllahName: 'Лафз аль-Джаляля',
    tajweedRuleAllahDescription: 'Имя Аллаха',
    tajweedExampleLabel: 'Пример',
    search: 'Поиск',

    // HomeScreen
    ayahs: 'аяты',
    searchSurahs: 'Поиск сур',
    alQuran: 'Священный Коран',
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
    customizeYourExperience: 'Настройте приложение под себя',
    tajweedSettings: 'Настройки таджвида',
    enableTajweed: 'Включить таджвид',
    tajweedDescription: 'Раскрашивать текст Корана по правилам таджвида',
    highlightAllah: 'Выделять имя Аллаха',
    tawafuqDescription: 'Подсвечивать вхождения Лафз аль-Джаляля (الله)',
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
    arabicOnly: 'Только арабский',
    surah: 'Сура',
    meccan: 'Мекканская',
    medinan: 'Мединская',

    // Juz / Hizb / Page
    juz: 'Джуз',
    hizb: 'Хизб',
    page: 'Страница',
    goToPage: 'Перейти к странице',
    pageRangeHint: 'Введите номер страницы от 1 до 604',
    go: 'Перейти',
    cancel: 'Отмена',

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
    tajweedGuide: 'Tecvid Rehberi',
    tajweedGuideDescription:
      'Okurken kullanılan Tecvid renk kodlarını anlayın.',
    tajweedLegendTitle: 'Tecvid Açıklaması',
    tajweedRuleQalqalaName: 'Kalkale',
    tajweedRuleQalqalaDescription: 'Yankılı/Sıçrayarak okuma',
    tajweedRuleIdghaamName: 'İdğam',
    tajweedRuleIdghaamDescription: 'Birleştirme (Gunne ile)',
    tajweedRuleIdghaamWithoutGhunnaDescription: 'Birleştirme (Gunnesiz)',
    tajweedRuleIkhfaName: 'İhfa',
    tajweedRuleIkhfaDescription: 'Gizleme',
    tajweedRuleIqlabName: 'İklab',
    tajweedRuleIqlabDescription: 'Dönüştürme',
    tajweedRuleIzharName: 'İzhar',
    tajweedRuleIzharDescription: 'Açık okuma',
    tajweedRuleMaddName: 'Medd',
    tajweedRuleMaddDescription: 'Uzatma',
    tajweedRuleMaddMunfasilName: 'Medd-i Münfasıl',
    tajweedRuleMaddMunfasilDescription: 'Ayrı uzatma',
    tajweedRuleMaddLazimName: 'Medd-i Lazım',
    tajweedRuleMaddLazimDescription: 'Gerekli uzatma',
    tajweedRuleLaamShamsiyyaName: 'Lam-ı Şemsiyye',
    tajweedRuleLaamShamsiyyaDescription: 'Sessiz lam',
    tajweedRuleAllahName: 'Lafz-ı Celâle',
    tajweedRuleAllahDescription: 'Allah lafzı',
    tajweedExampleLabel: 'Örnek',
    search: 'Ara',

    // HomeScreen
    ayahs: 'ayet',
    searchSurahs: 'Sure ara',
    alQuran: 'Kuranı Kerim',
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
    customizeYourExperience: 'Uygulama deneyiminizi özelleştirin',
    tajweedSettings: 'Tecvid Ayarları',
    enableTajweed: 'Tecvidi Etkinleştir',
    tajweedDescription: 'Kur’an metnini Tecvid kurallarına göre renklendir',
    highlightAllah: 'Allah lafzını vurgula',
    tawafuqDescription: 'Lafz-ı Celâle (الله) geçen yerleri vurgula',
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
    arabicOnly: 'Yalnızca Arapça',
    surah: 'Sure',
    meccan: 'Mekki',
    medinan: 'Medeni',

    // Juz / Hizb / Page
    juz: 'Cüz',
    hizb: 'Hizip',
    page: 'Sayfa',
    goToPage: 'Sayfaya git',
    pageRangeHint: "1 ile 604 arasında bir sayfa numarası girin",
    go: 'Git',
    cancel: 'İptal',

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
    case 'uz':
      return require('../quran/quran_uz.json');
    case 'tj':
      return require('../quran/quran_tj.json');
    case 'en':
    default:
      return require('../quran/quran.json');
  }
};

// Translations shipped with the app. `null` (Arabic only) is the absence of one.
export const TRANSLATION_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'tj', label: 'Тоҷикӣ' },
];

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
  translationLanguage: null,
  setTranslationLanguage: () => {},
  t: translations.en,
  getQuranData: () => {},
  getChapterData: () => {},
});

const LANGUAGE_STORAGE_KEY = '@quran_app_language';
const TRANSLATION_STORAGE_KEY = '@quran_app_translation_language';
// AsyncStorage holds strings only, so "Arabic only" needs a sentinel.
const TRANSLATION_OFF = 'none';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  // Which translation is shown alongside the Arabic; null means Arabic only.
  const [translationLanguage, setTranslationLanguageState] = useState(null);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [[, savedLanguage], [, savedTranslation]] =
        await AsyncStorage.multiGet([
          LANGUAGE_STORAGE_KEY,
          TRANSLATION_STORAGE_KEY,
        ]);

      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }
      if (
        savedTranslation &&
        TRANSLATION_LANGUAGES.some((item) => item.code === savedTranslation)
      ) {
        setTranslationLanguageState(savedTranslation);
      }
    } catch (error) {
      console.error('Failed to load language preferences:', error);
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

  // Pass a language code to show that translation, or null for Arabic only.
  const setTranslationLanguage = async (lang) => {
    const next = TRANSLATION_LANGUAGES.some((item) => item.code === lang)
      ? lang
      : null;
    setTranslationLanguageState(next);

    try {
      await AsyncStorage.setItem(
        TRANSLATION_STORAGE_KEY,
        next ?? TRANSLATION_OFF,
      );
    } catch (error) {
      console.error('Failed to save translation language:', error);
    }
  };

  const value = {
    language,
    setLanguage,
    translationLanguage,
    setTranslationLanguage,
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
