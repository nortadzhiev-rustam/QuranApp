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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  statusCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    marginVertical: 8,
    opacity: 0.2,
  },
});
