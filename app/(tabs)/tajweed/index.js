import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TajweedLegend from '@/components/TajweedLegend';

export default function TajweedGuideScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior='automatic'
    >
      <View style={styles.header}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t.tajweedGuideDescription ||
            'Understand the color codes used for Tajweed rules while reading.'}
        </Text>
      </View>

      <TajweedLegend />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
});
