import React, { memo, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { applyTajweedRules } from '@/utils/tajweed';
import { applyTajweedWithTawafuq, ALLAH_COLOR } from '@/utils/tawafuq';
import { useTajweed } from '@/contexts/TajweedContext';

/**
 * TajweedText Component
 *
 * Renders Arabic text with Tajweed coloring and/or Allah name highlighting
 * based on user preferences.
 *
 * OPTIMIZED: Uses useMemo to cache processed segments and prevent re-processing on every render
 */
const TajweedText = ({ text, style, baseColor, children, ...props }) => {
  const { tajweedEnabled, tawafuqEnabled } = useTajweed();

  // Memoize the segments calculation to avoid reprocessing on every render
  // This is critical for performance when rendering many verses
  const segments = useMemo(() => {
    if (!text) {
      return null;
    }

    // If both Tajweed and Tawafuq are disabled, return null to render plain text
    if (!tajweedEnabled && !tawafuqEnabled) {
      return null;
    }

    // Apply both Tajweed and Tawafuq
    if (tajweedEnabled && tawafuqEnabled) {
      return applyTajweedWithTawafuq(text, applyTajweedRules);
    }
    // Apply only Tawafuq
    else if (tawafuqEnabled) {
      const tawafuqSegments = require('@/utils/tawafuq').applyTawafuq(text);
      return tawafuqSegments.map((seg) => ({
        text: seg.text,
        color: null,
        isAllah: seg.isAllah,
      }));
    }
    // Apply only Tajweed
    else if (tajweedEnabled) {
      const tajweedSegments = applyTajweedRules(text);
      return tajweedSegments.map((seg) => ({
        ...seg,
        isAllah: false,
      }));
    }

    return null;
  }, [text, tajweedEnabled, tawafuqEnabled]);

  // If no processing needed, render plain text (much faster)
  if (!segments) {
    const { color: _, ...styleWithoutColor } = StyleSheet.flatten(style) || {};
    return (
      <Text style={[styleWithoutColor, { color: baseColor }]} {...props}>
        {text}
        {children}
      </Text>
    );
  }

  // Render the segments with Tajweed/Tawafuq coloring
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
