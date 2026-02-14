import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TAJWEED_COLORS, getTajweedRuleName } from '@/utils/tajweed';
import { ALLAH_COLOR } from '@/utils/tawafuq';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * TajweedLegend Component
 *
 * Displays a legend explaining the Tajweed color coding
 */
const TajweedLegend = ({ style }) => {
  const { theme } = useTheme();

  const legendItems = [
    { color: TAJWEED_COLORS.QALQALA, name: 'Qalqala', description: 'Echoing/Bouncing' },
    { color: TAJWEED_COLORS.IDGHAAM, name: 'Idghaam', description: 'Merging (with Ghunna)' },
    { color: TAJWEED_COLORS.IDGHAAM_WITHOUT_GHUNNA, name: 'Idghaam', description: 'Merging (without Ghunna)' },
    { color: TAJWEED_COLORS.IKHFA, name: 'Ikhfa', description: 'Hiding' },
    { color: TAJWEED_COLORS.IQLAB, name: 'Iqlab', description: 'Changing' },
    { color: TAJWEED_COLORS.MADD, name: 'Madd', description: 'Prolongation' },
    { color: TAJWEED_COLORS.MADD_MUNFASIL, name: 'Madd Munfasil', description: 'Separated Prolongation' },
    { color: TAJWEED_COLORS.MADD_LAZIM, name: 'Madd Lazim', description: 'Necessary Prolongation' },
    { color: TAJWEED_COLORS.LAAM_SHAMSIYYA, name: 'Laam Shamsiyyah', description: 'Silent Laam' },
    { color: ALLAH_COLOR, name: 'Lafz al-Jalala', description: 'Allah\'s Name' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Tajweed Legend
      </Text>
      <View style={styles.legendGrid}>
        {legendItems.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <View style={styles.legendText}>
              <Text style={[styles.ruleName, { color: theme.colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.ruleDescription, { color: theme.colors.textSecondary }]}>
                {item.description}
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
    width: '100%',
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
});

export default TajweedLegend;

