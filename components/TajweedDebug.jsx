// Quick debug file to test if Tajweed context is working
// Add this temporarily to see console logs

import { useTajweed } from '@/contexts/TajweedContext';
import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function TajweedDebug() {
  const { tajweedEnabled, tawafuqEnabled } = useTajweed();

  useEffect(() => {
    console.log('🐛 TajweedDebug - Current state:', {
      tajweedEnabled,
      tawafuqEnabled
    });
  }, [tajweedEnabled, tawafuqEnabled]);

  return (
    <View style={{ padding: 20, backgroundColor: 'yellow' }}>
      <Text>Tajweed: {tajweedEnabled ? 'ON' : 'OFF'}</Text>
      <Text>Tawafuq: {tawafuqEnabled ? 'ON' : 'OFF'}</Text>
    </View>
  );
}

