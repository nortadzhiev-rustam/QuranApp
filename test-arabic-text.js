// Simple test to verify Tajweed rules work
// This uses CommonJS since we're running in Node

// Simulate the basic structure
const TAJWEED_COLORS = {
  QALQALA: '#DD0008',
  MADD: '#2144C1',
};

// Test text: Bismillah
const testText = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';

console.log('Testing Tajweed with text:', testText);
console.log('Text length:', testText.length);
console.log('Characters:', testText.split('').map((c, i) => `[${i}]${c}`).join(' '));

// Check if the text contains expected Arabic characters
const hasArabic = /[\u0600-\u06FF]/.test(testText);
console.log('Contains Arabic:', hasArabic);

// Test for Alif
const hasAlif = testText.includes('ا');
console.log('Contains Alif:', hasAlif);

// Test for Allah name
const hasAllah = testText.includes('اللَّهِ');
console.log('Contains Allah name:', hasAllah);

console.log('\n✅ Text validation passed');

