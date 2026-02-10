import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsScreen = () => {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const themeOptions = [
    { value: 'auto', label: t.autoSystem },
    { value: 'light', label: t.light },
    { value: 'dark', label: t.dark },
  ];

  const languageOptions = [
    { value: 'en', label: t.english },
    { value: 'ru', label: t.russian },
    { value: 'tr', label: t.turkish },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t.appearance}
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t.theme}
            </Text>
            <View style={styles.themeOptions}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        themeMode === option.value
                          ? theme.colors.accent
                          : 'transparent',
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode(option.value)}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color:
                          themeMode === option.value
                            ? '#fff'
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t.language}
            </Text>
            <View style={styles.themeOptions}>
              {languageOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor:
                        language === option.value
                          ? theme.colors.accent
                          : 'transparent',
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setLanguage(option.value)}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      {
                        color:
                          language === option.value
                            ? '#fff'
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#f0f8ff',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
            >
              {t.currentTheme}: {isDark ? t.dark : t.light}
            </Text>
            <Text
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
            >
              {t.mode}:{' '}
              {themeMode === 'auto' ? t.autoFollowingSystem : themeMode}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOptions: {
    gap: 8,
  },
  themeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 4,
  },
});

export default SettingsScreen;
