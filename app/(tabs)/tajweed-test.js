import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TajweedText from '@/components/TajweedText';
import { useTajweed } from '@/contexts/TajweedContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TAJWEED_COLORS } from '@/utils/tajweed';

export default function TajweedTestScreen() {
  const { theme } = useTheme();
  const { tajweedEnabled, tawafuqEnabled, toggleTajweed, toggleTawafuq } = useTajweed();

  // Test verses
  const testVerses = [
    {
      name: 'Bismillah',
      text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      expected: 'Should have: Madd (blue), Allah (gold if enabled)'
    },
    {
      name: 'Al-Ikhlas (112:1)',
      text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      expected: 'Should have: Qalqala on د (red), Allah (gold)'
    },
    {
      name: 'Simple Qalqala Test',
      text: 'قَدْ',
      expected: 'Should have: د with sukoon in red (Qalqala)'
    },
    {
      name: 'Simple Madd Test',
      text: 'قَالَ',
      expected: 'Should have: ا after fatha in blue (Madd)'
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Tajweed Test Screen
        </Text>

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: theme.colors.card }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Enable Tajweed
            </Text>
            <Switch value={tajweedEnabled} onValueChange={toggleTajweed} />
          </View>
          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Highlight Allah
            </Text>
            <Switch value={tawafuqEnabled} onValueChange={toggleTawafuq} />
          </View>
        </View>

        {/* Test Cases */}
        {testVerses.map((verse, index) => (
          <View key={index} style={[styles.testCase, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.testName, { color: theme.colors.text }]}>
              {verse.name}
            </Text>

            <TajweedText
              text={verse.text}
              baseColor={theme.colors.text}
              style={[styles.arabicText]}
            />

            <Text style={[styles.expected, { color: theme.colors.textSecondary }]}>
              Expected: {verse.expected}
            </Text>

            {/* Plain text for comparison */}
            <Text style={[styles.plainText, { color: theme.colors.textSecondary }]}>
              Plain: {verse.text}
            </Text>
          </View>
        ))}

        {/* Color Legend */}
        <View style={[styles.legend, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>
            Color Legend:
          </Text>
          {Object.entries(TAJWEED_COLORS).map(([name, color]) => (
            <View key={name} style={styles.legendRow}>
              <View style={[styles.colorBox, { backgroundColor: color }]} />
              <Text style={[styles.legendText, { color: theme.colors.text }]}>
                {name}: {color}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
            How to Test:
          </Text>
          <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
            1. Enable Tajweed toggle{'\n'}
            2. Check console logs for debug info{'\n'}
            3. Compare colored text with plain text{'\n'}
            4. Verify colors match the legend{'\n'}
            5. Toggle Allah highlighting to see gold color
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  controls: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  testCase: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  arabicText: {
    fontSize: 28,
    lineHeight: 48,
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: 'uthmani-font',
  },
  expected: {
    fontSize: 14,
    marginBottom: 8,
  },
  plainText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  legend: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
  },
  instructions: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

