import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTajweed } from '@/contexts/TajweedContext';
import { Stack } from 'expo-router';

export default function SettingsTab() {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { tajweedEnabled, tawafuqEnabled, toggleTajweed, toggleTawafuq } =
    useTajweed();

  const themeOptions = [
    { value: 'auto', label: t.autoSystem, icon: '🌓' },
    { value: 'light', label: t.light, icon: '☀️' },
    { value: 'dark', label: t.dark, icon: '🌙' },
  ];

  const languageOptions = [
    { value: 'en', label: t.english, icon: '🇬🇧' },
    { value: 'ru', label: t.russian, icon: '🇷🇺' },
    { value: 'tr', label: t.turkish, icon: '🇹🇷' },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior='automatic'
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t.appearance}
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}
        >
          {t.customizeYourExperience}
        </Text>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}
          >
            {t.theme}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              shadowColor: isDark ? '#000' : '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
            },
          ]}
        >
          <View style={styles.optionsGrid}>
            {themeOptions.map((option) => {
              const isSelected = themeMode === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.accent
                        : isDark
                          ? '#2c2c2e'
                          : '#f5f5f5',
                      borderColor: isSelected
                        ? theme.colors.accent
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setThemeMode(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? '#fff' : theme.colors.text,
                        fontWeight: isSelected ? '600' : '500',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}
          >
            {t.language}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              shadowColor: isDark ? '#000' : '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
            },
          ]}
        >
          <View style={styles.optionsGrid}>
            {languageOptions.map((option) => {
              const isSelected = language === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.accent
                        : isDark
                          ? '#2c2c2e'
                          : '#f5f5f5',
                      borderColor: isSelected
                        ? theme.colors.accent
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setLanguage(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? '#fff' : theme.colors.text,
                        fontWeight: isSelected ? '600' : '500',
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Tajweed Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}
          >
            {t.tajweedSettings}
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              shadowColor: isDark ? '#000' : '#000',
              shadowOpacity: isDark ? 0.3 : 0.1,
            },
          ]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                {t.enableTajweed}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t.tajweedDescription}
              </Text>
            </View>
            <Switch
              value={tajweedEnabled}
              onValueChange={toggleTajweed}
              trackColor={{ false: '#767577', true: theme.colors.accent }}
              thumbColor='#fff'
            />
          </View>

          <View
            style={[styles.separator, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                {t.highlightAllah}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t.tawafuqDescription}
              </Text>
            </View>
            <Switch
              value={tawafuqEnabled}
              onValueChange={toggleTawafuq}
              trackColor={{ false: '#767577', true: theme.colors.accent }}
              thumbColor='#fff'
            />
          </View>
        </View>
      </View>

      {/* Status Info */}
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: isDark
              ? 'rgba(0, 122, 255, 0.15)'
              : 'rgba(0, 122, 255, 0.08)',
            borderColor: isDark
              ? 'rgba(0, 122, 255, 0.3)'
              : 'rgba(0, 122, 255, 0.2)',
          },
        ]}
      >
        <View style={styles.statusRow}>
          <Text
            style={[styles.statusLabel, { color: theme.colors.textSecondary }]}
          >
            {t.currentTheme}
          </Text>
          <Text style={[styles.statusValue, { color: theme.colors.text }]}>
            {isDark ? t.dark : t.light}
          </Text>
        </View>
        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />
        <View style={styles.statusRow}>
          <Text
            style={[styles.statusLabel, { color: theme.colors.textSecondary }]}
          >
            {t.mode}
          </Text>
          <Text style={[styles.statusValue, { color: theme.colors.text }]}>
            {themeMode === 'auto' ? t.autoFollowingSystem : themeMode}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 16,
    paddingTop: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 19,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '31%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statusCard: {
    marginTop: 2,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
    opacity: 0.3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    marginVertical: 6,
    opacity: 0.2,
  },
});
