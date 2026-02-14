import React, { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { applyTajweedRules } from '@/utils/tajweed';
import { applyTajweedWithTawafuq, ALLAH_COLOR } from '@/utils/tawafuq';
import { useTajweed } from '@/contexts/TajweedContext';

/**
 * TajweedText Component
 *
 * Renders Arabic text with Tajweed coloring and/or Allah name highlighting
 * based on user preferences.
 */
const TajweedText = ({ text, style, baseColor, children, ...props }) => {
  const { tajweedEnabled, tawafuqEnabled } = useTajweed();

  if (!text) {
    return null;
  }

  // If both Tajweed and Tawafuq are disabled, render plain text
  if (!tajweedEnabled && !tawafuqEnabled) {
    const { color: _, ...styleWithoutColor } = StyleSheet.flatten(style) || {};
    return (
      <Text style={[styleWithoutColor, { color: baseColor }]} {...props}>
        {text}
        {children}
      </Text>
    );
  }

  let segments = [];

  // Apply both Tajweed and Tawafuq
  if (tajweedEnabled && tawafuqEnabled) {
    segments = applyTajweedWithTawafuq(text, applyTajweedRules);
  }
  // Apply only Tawafuq
  else if (tawafuqEnabled) {
    const tawafuqSegments = require('@/utils/tawafuq').applyTawafuq(text);
    segments = tawafuqSegments.map((seg) => ({
      text: seg.text,
      color: null,
      isAllah: seg.isAllah,
    }));
  }
  // Apply only Tajweed
  else if (tajweedEnabled) {
    const tajweedSegments = applyTajweedRules(text);
    segments = tajweedSegments.map((seg) => ({
      ...seg,
      isAllah: false,
    }));
  }

  // Render the segments
  // Important: Remove 'color' from parent style to avoid overriding child colors
  const { color: _, ...styleWithoutColor } = StyleSheet.flatten(style) || {};

  return (
    <Text style={[styleWithoutColor]} {...props}>
      {segments.map((segment, index) => {
        let color = baseColor;

        // Tawafuq takes precedence
        if (segment.isAllah) {
          color = ALLAH_COLOR;
        } else if (segment.color) {
          color = segment.color;
        }

        return (
          <Text key={index} style={{ color }}>
            {segment.text}
          </Text>
        );
      })}
      {children}
    </Text>
  );
};

export default memo(TajweedText);
