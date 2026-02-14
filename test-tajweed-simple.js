/**
 * Simple test for Tajweed implementation
 * Run with: node test-tajweed-simple.js
 */

const { applyTajweedRules, TAJWEED_COLORS } = require('./utils/tajweed.js');
const { applyTawafuq, applyTajweedWithTawafuq, ALLAH_COLOR } = require('./utils/tawafuq.js');

console.log('🧪 Testing Tajweed Implementation\n');

// Test 1: Basic Tajweed - Qalqala
console.log('Test 1: Qalqala Rule');
const qalqalaTest = 'قَدْ'; // Qaaf with Damma, Daal with Sukoon
const qalqalaResult = applyTajweedRules(qalqalaTest);
console.log('Input:', qalqalaTest);
console.log('Result:', qalqalaResult);
console.log('Expected: Daal (د) with Sukoon should be RED');
console.log('✓ Qalqala test complete\n');

// Test 2: Madd Rule
console.log('Test 2: Madd Rule');
const maddTest = 'قَالَ'; // Qaal (Alif after Fatha)
const maddResult = applyTajweedRules(maddTest);
console.log('Input:', maddTest);
console.log('Result:', maddResult);
console.log('Expected: Alif (ا) should be BLUE');
console.log('✓ Madd test complete\n');

// Test 3: Noon Saakin + Ba (Iqlab)
console.log('Test 3: Iqlab Rule (Noon + Ba)');
const iqlabTest = 'مَنْ بَعْدِ'; // man ba'di
const iqlabResult = applyTajweedRules(iqlabTest);
console.log('Input:', iqlabTest);
console.log('Result:', iqlabResult);
console.log('Expected: Noon (ن) with Sukoon before Ba should be ORANGE');
console.log('✓ Iqlab test complete\n');

// Test 4: Tawafuq - Allah name detection
console.log('Test 4: Tawafuq - Allah Name Detection');
const allahTest = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
const allahResult = applyTawafuq(allahTest);
console.log('Input:', allahTest);
console.log('Result:', allahResult);
console.log('Expected: اللَّهِ should be marked as isAllah=true');
const foundAllah = allahResult.some(seg => seg.isAllah);
console.log('Allah found:', foundAllah ? '✓ YES' : '✗ NO');
console.log('✓ Tawafuq test complete\n');

// Test 5: Combined Tajweed + Tawafuq
console.log('Test 5: Combined Tajweed + Tawafuq');
const combinedTest = 'وَاللَّهُ عَلِيمٌ'; // wa Allahu 'Aleem
const combinedResult = applyTajweedWithTawafuq(combinedTest, applyTajweedRules);
console.log('Input:', combinedTest);
console.log('Result:', combinedResult);
console.log('Expected: اللَّهُ marked as Allah, Tanween colored by Tajweed');
console.log('✓ Combined test complete\n');

// Test 6: Empty and edge cases
console.log('Test 6: Edge Cases');
console.log('Empty string:', applyTajweedRules(''));
console.log('Null:', applyTajweedRules(null));
console.log('Single char:', applyTajweedRules('ا'));
console.log('✓ Edge cases handled\n');

console.log('✅ All tests completed!');
console.log('\nColor Reference:');
console.log('- Qalqala:', TAJWEED_COLORS.QALQALA, '(Red)');
console.log('- Iqlab:', TAJWEED_COLORS.IQLAB, '(Orange)');
console.log('- Ikhfa:', TAJWEED_COLORS.IKHFA, '(Purple)');
console.log('- Idghaam:', TAJWEED_COLORS.IDGHAAM, '(Dark Green)');
console.log('- Madd:', TAJWEED_COLORS.MADD, '(Blue)');
console.log('- Allah:', ALLAH_COLOR, '(Gold)');

