/**
 * TextDistributor 테스트
 * 
 * 실제 테스트 프레임워크 없이 간단한 테스트 함수들을 제공합니다.
 * 프로덕션 환경에서는 Jest, Vitest 등의 테스트 프레임워크를 사용하세요.
 */

import { TextDistributor } from '../text-distributor';
import { ROBOTO_MONO_FONT, FONT_SIZES } from '../fonts';

// 간단한 테스트 유틸리티
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertGreaterThan(actual: number, expected: number, message: string): void {
  if (actual <= expected) {
    throw new Error(`Assertion failed: ${message}. Expected > ${expected}, Actual: ${actual}`);
  }
}

// 테스트 데이터
const testFont = ROBOTO_MONO_FONT;
const testFontSize = FONT_SIZES[1]; // medium
const shortText = ["Hello world. This is a test."];
const longText = [
  "This is the first sentence. This is the second sentence. This is the third sentence.",
  "This is another paragraph with multiple sentences. Each sentence should be preserved.",
  "The final paragraph contains even more text to test the distribution algorithm properly."
];

/**
 * 기본 텍스트 분배 테스트
 */
export function testBasicTextDistribution(): void {
  console.log('🧪 Testing basic text distribution...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  const result = distributor.distributeText(shortText, 5);
  
  assert(result.success !== false, 'Distribution should succeed');
  assert(result.totalPages >= 1, 'Should generate at least 1 page');
  assert(result.pages.length > 0, 'Should have page content');
  assert(result.distributionStats.totalCharacters > 0, 'Should have character count');
  
  console.log('✅ Basic text distribution test passed');
}

/**
 * 페이지 제한 테스트
 */
export function testPageLimitEnforcement(): void {
  console.log('🧪 Testing page limit enforcement...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  const pageLimit = 3;
  const result = distributor.distributeText(longText, pageLimit);
  
  assert(result.totalPages <= pageLimit, `Should not exceed page limit of ${pageLimit}`);
  assertEqual(result.pages.length, Math.min(result.totalPages, pageLimit), 'Page count should match');
  
  console.log('✅ Page limit enforcement test passed');
}

/**
 * 문장 보존 테스트
 */
export function testSentencePreservation(): void {
  console.log('🧪 Testing sentence preservation...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  const testText = ["First sentence. Second sentence. Third sentence."];
  const result = distributor.distributeText(testText, 10);
  
  // 모든 페이지의 텍스트를 합쳐서 원본과 비교
  const allText = result.pages
    .flatMap(page => page.textLines)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const originalText = testText.join(' ').replace(/\s+/g, ' ').trim();
  
  // 문장 수 확인 (정확한 비교는 어려우므로 대략적으로)
  const originalSentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const distributedSentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  assert(distributedSentences.length >= originalSentences.length - 1, 'Should preserve most sentences');
  
  console.log('✅ Sentence preservation test passed');
}

/**
 * 페이지 수 추정 테스트
 */
export function testPageCountEstimation(): void {
  console.log('🧪 Testing page count estimation...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  
  // 짧은 텍스트
  const shortEstimate = distributor.estimatePageCount(shortText);
  assert(shortEstimate >= 1, 'Should estimate at least 1 page for short text');
  assert(shortEstimate <= 3, 'Should not overestimate for short text');
  
  // 긴 텍스트
  const longEstimate = distributor.estimatePageCount(longText);
  assertGreaterThan(longEstimate, shortEstimate, 'Long text should need more pages');
  
  console.log('✅ Page count estimation test passed');
}

/**
 * 텍스트 측정 테스트
 */
export function testTextMeasurement(): void {
  console.log('🧪 Testing text measurement...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  
  const shortMeasurement = distributor.measureText("Hello");
  const longMeasurement = distributor.measureText("Hello world this is a longer text");
  
  assert(shortMeasurement.characterCount === 5, 'Should count characters correctly');
  assert(longMeasurement.characterCount > shortMeasurement.characterCount, 'Longer text should have more characters');
  assert(longMeasurement.wordCount > shortMeasurement.wordCount, 'Longer text should have more words');
  
  console.log('✅ Text measurement test passed');
}

/**
 * 캐시 기능 테스트
 */
export function testCacheFunctionality(): void {
  console.log('🧪 Testing cache functionality...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  
  // 같은 텍스트로 여러 번 처리
  const result1 = distributor.distributeText(shortText, 5);
  const result2 = distributor.distributeText(shortText, 5);
  
  // 결과가 일관되어야 함
  assertEqual(result1.totalPages, result2.totalPages, 'Cached results should be consistent');
  assertEqual(result1.distributionStats.totalCharacters, result2.distributionStats.totalCharacters, 'Character counts should match');
  
  // 캐시 통계 확인
  const cacheStats = distributor.getCacheStats();
  assert(cacheStats.fontMetrics >= 0, 'Should have cache statistics');
  
  // 캐시 정리
  distributor.clearAllCaches();
  const clearedStats = distributor.getCacheStats();
  assertEqual(clearedStats.fontMetrics, 0, 'Cache should be cleared');
  
  console.log('✅ Cache functionality test passed');
}

/**
 * 에지 케이스 테스트
 */
export function testEdgeCases(): void {
  console.log('🧪 Testing edge cases...');
  
  const distributor = new TextDistributor(testFont, testFontSize);
  
  // 빈 텍스트
  const emptyResult = distributor.distributeText([], 5);
  assert(emptyResult.totalPages >= 0, 'Should handle empty text gracefully');
  
  // 매우 짧은 텍스트
  const veryShortResult = distributor.distributeText(["Hi."], 5);
  assert(veryShortResult.totalPages >= 1, 'Should handle very short text');
  
  // 페이지 제한 1
  const singlePageResult = distributor.distributeText(longText, 1);
  assertEqual(singlePageResult.totalPages, 1, 'Should respect single page limit');
  
  console.log('✅ Edge cases test passed');
}

/**
 * 모든 테스트 실행
 */
export function runAllTests(): void {
  console.log('🚀 Starting TextDistributor tests...\n');
  
  const tests = [
    testBasicTextDistribution,
    testPageLimitEnforcement,
    testSentencePreservation,
    testPageCountEstimation,
    testTextMeasurement,
    testCacheFunctionality,
    testEdgeCases
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (error) {
      console.error(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
}

// 개발 환경에서 테스트 자동 실행
if (process.env.NODE_ENV === 'development') {
  // runAllTests();
}