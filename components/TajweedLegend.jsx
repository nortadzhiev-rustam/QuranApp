import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TAJWEED_COLORS } from '@/utils/tajweed';
import { ALLAH_COLOR } from '@/utils/tawafuq';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFonts } from 'expo-font';
import TajweedText from './TajweedText';
/**
 * TajweedLegend Component
 *
 * Displays a legend explaining the Tajweed color coding
 */
const TajweedLegend = ({ style }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [fontsLoaded] = useFonts({
    'uthmani-font': require('@/assets/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf'),
  });
  const legendItems = [
    {
      color: TAJWEED_COLORS.QALQALA,
      name: t.tajweedRuleQalqalaName || 'Qalqala',
      description: t.tajweedRuleQalqalaDescription || 'Echoing/Bouncing',
      example: 'قَدْ',
    },
    {
      color: TAJWEED_COLORS.IDGHAAM,
      name: t.tajweedRuleIdghaamName || 'Idghaam',
      description: t.tajweedRuleIdghaamDescription || 'Merging (with Ghunna)',
      example: 'مِنْ نَّعِيمٍ',
    },
    {
      color: TAJWEED_COLORS.IDGHAAM_WITHOUT_GHUNNA,
      name: t.tajweedRuleIdghaamName || 'Idghaam',
      description:
        t.tajweedRuleIdghaamWithoutGhunnaDescription ||
        'Merging (without Ghunna)',
      example: 'مِنْ رَّبِّهِمْ',
    },
    {
      color: TAJWEED_COLORS.IKHFA,
      name: t.tajweedRuleIkhfaName || 'Ikhfa',
      description: t.tajweedRuleIkhfaDescription || 'Hiding',
      example: 'مِنْ قَبْلِ',
    },
    {
      color: theme.colors.text,
      name: t.tajweedRuleIzharName || 'Izhar',
      description:
        t.tajweedRuleIzharDescription || 'Clear Pronunciation (no color)',
      example: 'مِنْ عِلْمٍ',
    },
    {
      color: TAJWEED_COLORS.IQLAB,
      name: t.tajweedRuleIqlabName || 'Iqlab',
      description: t.tajweedRuleIqlabDescription || 'Changing',
      example: 'أَنْبِئْهُم',
    },

    {
      color: TAJWEED_COLORS.MADD,
      name: t.tajweedRuleMaddName || 'Madd',
      description: t.tajweedRuleMaddDescription || 'Prolongation',
      example: 'قَالَ',
    },
    {
      color: TAJWEED_COLORS.MADD_MUNFASIL,
      name: t.tajweedRuleMaddMunfasilName || 'Madd Munfasil',
      description:
        t.tajweedRuleMaddMunfasilDescription || 'Separated Prolongation',
      example: 'فِي أَنفُسِكُمْ',
    },
    {
      color: TAJWEED_COLORS.MADD_LAZIM,
      name: t.tajweedRuleMaddLazimName || 'Madd Lazim',
      description:
        t.tajweedRuleMaddLazimDescription || 'Necessary Prolongation',
      example: 'الضَّالِّينَ',
    },
    {
      color: TAJWEED_COLORS.LAAM_SHAMSIYYA,
      name: t.tajweedRuleLaamShamsiyyaName || 'Laam Shamsiyyah',
      description: t.tajweedRuleLaamShamsiyyaDescription || 'Silent Laam',
      example: 'الشَّمْس',
    },
    {
      color: ALLAH_COLOR,
      name: t.tajweedRuleAllahName || 'Lafz al-Jalala',
      description: t.tajweedRuleAllahDescription || "Allah's Name",
      example: 'اللَّه',
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.card }, style]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t.tajweedLegendTitle || 'Tajweed Legend'}
      </Text>
      <View style={styles.legendGrid}>
        {legendItems.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <View style={styles.legendText}>
              <Text style={[styles.ruleName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.ruleDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {item.description}
              </Text>
            </View>
            <View style={styles.example}>
              <Text style={[styles.ruleExample, { color: theme.colors.text }]}>
                {(t.tajweedExampleLabel || 'Example') + ': '}{' '}
                <TajweedText
                  text={item.example}
                  style={{ fontSize: 29, lineHeight: 36 }}
                ></TajweedText>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // Full width minus padding and gap
    marginBottom: 8,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ruleDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  ruleExample: {
    fontFamily: 'uthmani-font',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default TajweedLegend;
