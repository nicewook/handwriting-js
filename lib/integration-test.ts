/**
 * 멀티페이지 PDF 생성 통합 테스트
 * 
 * 전체 워크플로우가 제대로 작동하는지 확인하는 간단한 테스트
 */

import { ROBOTO_MONO_FONT, FONT_SIZES } from './fonts';
import { TEXT_OPTIONS } from './constants';
import { TextDistributor } from './text-distributor';
import { PageManager } from './page-manager';

/**
 * 기본 통합 테스트
 */
export async function testBasicIntegration(): Promise<boolean> {
  try {
    console.log('🧪 멀티페이지 PDF 통합 테스트 시작...');
    
    // 1. 기본 설정
    const font = ROBOTO_MONO_FONT;
    const fontSize = FONT_SIZES[1]; // medium
    const pageLimit = 5;
    const testTexts = TEXT_OPTIONS[0].texts; // classic
    
    console.log('📝 테스트 설정:', {
      font: font.name,
      fontSize: fontSize.label,
      pageLimit,
      textLength: testTexts.join(' ').length
    });
    
    // 2. TextDistributor 테스트
    console.log('🔄 TextDistributor 테스트...');
    const textDistributor = new TextDistributor(font, fontSize);
    const distributionResult = textDistributor.distributeText(testTexts, pageLimit);
    
    console.log('📊 분배 결과:', {
      totalPages: distributionResult.totalPages,
      truncated: distributionResult.truncatedContent,
      totalChars: distributionResult.distributionStats.totalCharacters,
      avgCharsPerPage: distributionResult.distributionStats.averageCharsPerPage
    });
    
    // 3. PageManager 테스트
    console.log('🔄 PageManager 테스트...');
    const pageManager = new PageManager(font, fontSize, pageLimit);
    const layoutInfo = pageManager.getLayoutInfo();
    
    console.log('📐 레이아웃 정보:', {
      pageLimit: layoutInfo.pageLimit,
      maxLinesPerPage: layoutInfo.maxLinesPerPage,
      lineSpacing: layoutInfo.lineSpacing
    });
    
    // 4. 페이지 수 추정 테스트
    console.log('🔄 페이지 수 추정 테스트...');
    const estimatedPages = textDistributor.estimatePageCount(testTexts);
    
    console.log('📈 추정 결과:', {
      estimated: estimatedPages,
      actual: distributionResult.totalPages,
      difference: Math.abs(estimatedPages - distributionResult.totalPages)
    });
    
    // 5. 기본 검증
    const validations = [
      distributionResult.totalPages > 0,
      distributionResult.totalPages <= pageLimit,
      distributionResult.pages.length > 0,
      distributionResult.distributionStats.totalCharacters > 0,
      estimatedPages > 0,
      layoutInfo.pageLimit === pageLimit
    ];
    
    const allValid = validations.every(v => v);
    
    if (allValid) {
      console.log('✅ 모든 통합 테스트 통과!');
      return true;
    } else {
      console.error('❌ 일부 검증 실패:', validations);
      return false;
    }
    
  } catch (error) {
    console.error('💥 통합 테스트 실패:', error);
    return false;
  }
}

/**
 * 성능 테스트
 */
export async function testPerformance(): Promise<boolean> {
  try {
    console.log('🚀 성능 테스트 시작...');
    
    const font = ROBOTO_MONO_FONT;
    const fontSize = FONT_SIZES[1];
    const longTexts = TEXT_OPTIONS.flatMap(option => option.texts); // 모든 텍스트 합치기
    
    const startTime = Date.now();
    
    // 큰 텍스트로 테스트
    const textDistributor = new TextDistributor(font, fontSize);
    const result = textDistributor.distributeText(longTexts, 20);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('⏱️ 성능 결과:', {
      duration: `${duration}ms`,
      totalPages: result.totalPages,
      totalChars: result.distributionStats.totalCharacters,
      charsPerMs: Math.round(result.distributionStats.totalCharacters / duration)
    });
    
    // 성능 기준: 10초 이내, 1ms당 100자 이상 처리
    const performanceOk = duration < 10000 && (result.distributionStats.totalCharacters / duration) > 100;
    
    if (performanceOk) {
      console.log('✅ 성능 테스트 통과!');
      return true;
    } else {
      console.warn('⚠️ 성능이 기준에 미달합니다.');
      return false;
    }
    
  } catch (error) {
    console.error('💥 성능 테스트 실패:', error);
    return false;
  }
}

/**
 * 메모리 테스트
 */
export async function testMemoryUsage(): Promise<boolean> {
  try {
    console.log('🧠 메모리 사용량 테스트 시작...');
    
    const font = ROBOTO_MONO_FONT;
    const fontSize = FONT_SIZES[1];
    
    // @ts-ignore
    const initialMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
    
    // 여러 번 실행하여 메모리 누수 확인
    for (let i = 0; i < 5; i++) {
      const textDistributor = new TextDistributor(font, fontSize);
      const result = textDistributor.distributeText(TEXT_OPTIONS[0].texts, 10);
      
      // 캐시 정리
      textDistributor.clearAllCaches();
      
      console.log(`반복 ${i + 1}: ${result.totalPages}페이지 생성`);
    }
    
    // @ts-ignore
    const finalMemory = (performance as any)?.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log('💾 메모리 사용량:', {
      initial: `${Math.round(initialMemory / 1024 / 1024)}MB`,
      final: `${Math.round(finalMemory / 1024 / 1024)}MB`,
      increase: `${Math.round(memoryIncrease / 1024 / 1024)}MB`
    });
    
    // 메모리 증가가 10MB 이하면 양호
    const memoryOk = memoryIncrease < 10 * 1024 * 1024;
    
    if (memoryOk) {
      console.log('✅ 메모리 테스트 통과!');
      return true;
    } else {
      console.warn('⚠️ 메모리 사용량이 높습니다.');
      return false;
    }
    
  } catch (error) {
    console.error('💥 메모리 테스트 실패:', error);
    return false;
  }
}

/**
 * 전체 통합 테스트 실행
 */
export async function runIntegrationTests(): Promise<void> {
  console.log('🎯 멀티페이지 PDF 통합 테스트 시작\n');
  
  const tests = [
    { name: '기본 통합', fn: testBasicIntegration },
    { name: '성능', fn: testPerformance },
    { name: '메모리 사용량', fn: testMemoryUsage }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} 테스트 ---`);
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} 테스트 통과`);
      } else {
        failed++;
        console.log(`❌ ${test.name} 테스트 실패`);
      }
    } catch (error) {
      failed++;
      console.error(`💥 ${test.name} 테스트 오류:`, error);
    }
  }
  
  console.log(`\n📊 통합 테스트 결과: ${passed}개 통과, ${failed}개 실패`);
  
  if (failed === 0) {
    console.log('🎉 모든 통합 테스트 통과! 멀티페이지 PDF 기능이 준비되었습니다.');
  } else {
    console.log('⚠️ 일부 테스트가 실패했습니다. 구현을 확인해주세요.');
  }
}

// 개발 환경에서 자동 실행 (주석 처리)
// if (process.env.NODE_ENV === 'development') {
//   runIntegrationTests();
// }