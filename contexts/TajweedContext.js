import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TajweedContext = createContext();

const TAJWEED_STORAGE_KEY = 'tajweed_enabled';
const TAWAFUQ_STORAGE_KEY = 'tawafuq_enabled';

export const TajweedProvider = ({ children }) => {
  const [tajweedEnabled, setTajweedEnabled] = useState(true);
  const [tawafuqEnabled, setTawafuqEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [tajweedValue, tawafuqValue] = await Promise.all([
        AsyncStorage.getItem(TAJWEED_STORAGE_KEY),
        AsyncStorage.getItem(TAWAFUQ_STORAGE_KEY),
      ]);

      console.log('📖 Loading Tajweed settings from AsyncStorage...');
      console.log('   Tajweed value:', tajweedValue);
      console.log('   Tawafuq value:', tawafuqValue);

      if (tajweedValue !== null) {
        setTajweedEnabled(tajweedValue === 'true');
      }
      if (tawafuqValue !== null) {
        setTawafuqEnabled(tawafuqValue === 'true');
      }

      console.log('✅ Settings loaded - Tajweed:', tajweedValue === 'true', 'Tawafuq:', tawafuqValue === 'true');
    } catch (error) {
      console.error('❌ Error loading Tajweed settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTajweed = async () => {
    try {
      const newValue = !tajweedEnabled;
      console.log('🎨 Toggling Tajweed from', tajweedEnabled, 'to', newValue);
      setTajweedEnabled(newValue);
      await AsyncStorage.setItem(TAJWEED_STORAGE_KEY, newValue.toString());
      console.log('✅ Tajweed saved to AsyncStorage:', newValue);
    } catch (error) {
      console.error('❌ Error saving Tajweed setting:', error);
    }
  };

  const toggleTawafuq = async () => {
    try {
      const newValue = !tawafuqEnabled;
      console.log('🟡 Toggling Tawafuq from', tawafuqEnabled, 'to', newValue);
      setTawafuqEnabled(newValue);
      await AsyncStorage.setItem(TAWAFUQ_STORAGE_KEY, newValue.toString());
      console.log('✅ Tawafuq saved to AsyncStorage:', newValue);
    } catch (error) {
      console.error('❌ Error saving Tawafuq setting:', error);
    }
  };

  const value = useMemo(() => ({
    tajweedEnabled,
    tawafuqEnabled,
    toggleTajweed,
    toggleTawafuq,
    loading,
  }), [tajweedEnabled, tawafuqEnabled, loading]);

  console.log('🔄 TajweedContext re-rendering with values:', { tajweedEnabled, tawafuqEnabled });

  return (
    <TajweedContext.Provider value={value}>
      {children}
    </TajweedContext.Provider>
  );
};

export const useTajweed = () => {
  const context = useContext(TajweedContext);
  if (!context) {
    throw new Error('useTajweed must be used within TajweedProvider');
  }
  return context;
};

export default TajweedContext;

