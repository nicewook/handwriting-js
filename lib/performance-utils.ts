import { MULTI_PAGE_CONFIG } from './constants';

/**
 * 성능 및 메모리 관리 유틸리티
 */

// 메모리 사용량 임계값 (바이트)
const MEMORY_THRESHOLDS = {
  LOW: 50 * 1024 * 1024,    // 50MB
  MEDIUM: 100 * 1024 * 1024, // 100MB
  HIGH: 200 * 1024 * 1024,   // 200MB
  CRITICAL: 300 * 1024 * 1024 // 300MB
} as const;

// 성능 메트릭 인터페이스
export interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
    pressure: 'low' | 'medium' | 'high' | 'critical';
  };
  timing: {
    startTime: number;
    currentTime: number;
    elapsed: number;
  };
  recommendations: {
    maxRecommendedPages: number;
    shouldUseStreaming: boolean;
    shouldReduceQuality: boolean;
    shouldShowWarning: boolean;
  };
}

/**
 * 현재 메모리 사용량 확인
 */
export function getCurrentMemoryUsage(): {
  available: boolean;
  used: number;
  total: number;
  limit: number;
  pressure: 'low' | 'medium' | 'high' | 'critical';
} {
  // @ts-ignore - performance.memory는 일부 브라우저에서만 사용 가능
  const memory = (performance as any)?.memory;
  
  if (!memory) {
    return {
      available: false,
      used: 0,
      total: 0,
      limit: 0,
      pressure: 'low'
    };
  }
  
  const used = memory.usedJSHeapSize || 0;
  const total = memory.totalJSHeapSize || 0;
  const limit = memory.jsHeapSizeLimit || 0;
  
  // 메모리 압박 수준 계산
  let pressure: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (used > MEMORY_THRESHOLDS.CRITICAL) {
    pressure = 'critical';
  } else if (used > MEMORY_THRESHOLDS.HIGH) {
    pressure = 'high';
  } else if (used > MEMORY_THRESHOLDS.MEDIUM) {
    pressure = 'medium';
  }
  
  return {
    available: true,
    used,
    total,
    limit,
    pressure
  };
}

/**
 * 페이지 수에 따른 예상 메모리 사용량 계산
 */
export function estimateMemoryUsage(pageCount: number, textLength: number): {
  estimatedBytes: number;
  isSafe: boolean;
  recommendation: string;
} {
  // 대략적인 계산: 페이지당 기본 메모리 + 텍스트 크기
  const baseMemoryPerPage = 1024 * 1024; // 1MB per page (대략적)
  const textMemoryFactor = 10; // 텍스트 1바이트당 10바이트 메모리 사용 (대략적)
  
  const estimatedBytes = (pageCount * baseMemoryPerPage) + (textLength * textMemoryFactor);
  const isSafe = estimatedBytes < MEMORY_THRESHOLDS.HIGH;
  
  let recommendation = '';
  if (estimatedBytes > MEMORY_THRESHOLDS.CRITICAL) {
    recommendation = '매우 위험: 페이지 수를 크게 줄이세요 (5페이지 이하 권장)';
  } else if (estimatedBytes > MEMORY_THRESHOLDS.HIGH) {
    recommendation = '위험: 페이지 수를 줄이세요 (15페이지 이하 권장)';
  } else if (estimatedBytes > MEMORY_THRESHOLDS.MEDIUM) {
    recommendation = '주의: 메모리 사용량이 높을 수 있습니다';
  } else {
    recommendation = '안전: 메모리 사용량이 적절합니다';
  }
  
  return {
    estimatedBytes,
    isSafe,
    recommendation
  };
}

/**
 * 성능 메트릭 수집
 */
export function collectPerformanceMetrics(
  startTime: number,
  pageCount: number,
  textLength: number
): PerformanceMetrics {
  const currentTime = Date.now();
  const memoryUsage = getCurrentMemoryUsage();
  const memoryEstimate = estimateMemoryUsage(pageCount, textLength);
  
  // 권장사항 계산
  let maxRecommendedPages = MULTI_PAGE_CONFIG.MAX_PAGES;
  let shouldUseStreaming = false;
  let shouldReduceQuality = false;
  let shouldShowWarning = false;
  
  switch (memoryUsage.pressure) {
    case 'critical':
      maxRecommendedPages = 3;
      shouldUseStreaming = true;
      shouldReduceQuality = true;
      shouldShowWarning = true;
      break;
    case 'high':
      maxRecommendedPages = 10;
      shouldUseStreaming = true;
      shouldShowWarning = true;
      break;
    case 'medium':
      maxRecommendedPages = 25;
      shouldUseStreaming = pageCount > 20;
      break;
    case 'low':
    default:
      // 기본값 유지
      break;
  }
  
  return {
    memoryUsage: {
      used: memoryUsage.used,
      total: memoryUsage.total,
      limit: memoryUsage.limit,
      pressure: memoryUsage.pressure
    },
    timing: {
      startTime,
      currentTime,
      elapsed: currentTime - startTime
    },
    recommendations: {
      maxRecommendedPages,
      shouldUseStreaming,
      shouldReduceQuality,
      shouldShowWarning
    }
  };
}

/**
 * 가비지 컬렉션 힌트 (가능한 경우)
 */
export function triggerGarbageCollection(): void {
  try {
    // @ts-ignore - gc는 일부 환경에서만 사용 가능
    if (typeof gc === 'function') {
      gc();
      console.log('🗑️ 가비지 컬렉션 실행됨');
    }
  } catch (error) {
    // 가비지 컬렉션을 사용할 수 없는 환경에서는 무시
    console.debug('가비지 컬렉션을 사용할 수 없습니다:', error);
  }
}

/**
 * 메모리 정리 유틸리티
 */
export function cleanupMemory(): void {
  // 가비지 컬렉션 힌트
  triggerGarbageCollection();
  
  // 큰 객체들을 null로 설정하여 메모리 해제 도움
  // (실제 사용 시에는 구체적인 객체들을 정리해야 함)
  console.log('🧹 메모리 정리 완료');
}

/**
 * 성능 모니터링 클래스
 */
export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Array<{ name: string; time: number; memory?: number }> = [];
  
  constructor() {
    this.startTime = Date.now();
    this.addCheckpoint('start');
  }
  
  addCheckpoint(name: string): void {
    const currentTime = Date.now();
    const memoryUsage = getCurrentMemoryUsage();
    
    this.checkpoints.push({
      name,
      time: currentTime,
      memory: memoryUsage.available ? memoryUsage.used : undefined
    });
    
    console.log(`📊 체크포인트 [${name}]: ${currentTime - this.startTime}ms${
      memoryUsage.available ? `, 메모리: ${(memoryUsage.used / 1024 / 1024).toFixed(1)}MB` : ''
    }`);
  }
  
  getReport(): {
    totalTime: number;
    checkpoints: Array<{ name: string; elapsed: number; memoryMB?: number }>;
    memoryPeak: number;
  } {
    const totalTime = Date.now() - this.startTime;
    const processedCheckpoints = this.checkpoints.map((checkpoint, index) => ({
      name: checkpoint.name,
      elapsed: checkpoint.time - this.startTime,
      memoryMB: checkpoint.memory ? Math.round(checkpoint.memory / 1024 / 1024) : undefined
    }));
    
    const memoryPeak = Math.max(
      ...this.checkpoints
        .map(cp => cp.memory || 0)
        .filter(mem => mem > 0)
    );
    
    return {
      totalTime,
      checkpoints: processedCheckpoints,
      memoryPeak
    };
  }
  
  logReport(): void {
    const report = this.getReport();
    
    console.log('\n📈 성능 리포트:');
    console.log(`총 소요 시간: ${report.totalTime}ms`);
    console.log(`메모리 피크: ${(report.memoryPeak / 1024 / 1024).toFixed(1)}MB`);
    console.log('\n체크포인트:');
    
    report.checkpoints.forEach(cp => {
      console.log(`  ${cp.name}: ${cp.elapsed}ms${
        cp.memoryMB ? ` (${cp.memoryMB}MB)` : ''
      }`);
    });
    
    console.log('');
  }
}

/**
 * 자동 메모리 관리 설정
 */
export function setupAutoMemoryManagement(): {
  cleanup: () => void;
} {
  let intervalId: NodeJS.Timeout | null = null;
  
  // 주기적으로 메모리 상태 확인 (30초마다)
  intervalId = setInterval(() => {
    const memoryUsage = getCurrentMemoryUsage();
    
    if (memoryUsage.available && memoryUsage.pressure === 'high') {
      console.warn('⚠️ 높은 메모리 사용량 감지, 정리 실행...');
      cleanupMemory();
    }
  }, 30000);
  
  return {
    cleanup: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
}

/**
 * 페이지 수 자동 조정
 */
export function autoAdjustPageLimit(
  requestedPages: number,
  textLength: number
): {
  adjustedPages: number;
  reason: string;
  wasAdjusted: boolean;
} {
  const memoryUsage = getCurrentMemoryUsage();
  const memoryEstimate = estimateMemoryUsage(requestedPages, textLength);
  
  let adjustedPages = requestedPages;
  let reason = '';
  let wasAdjusted = false;
  
  // 메모리 기반 조정
  if (memoryUsage.available) {
    switch (memoryUsage.pressure) {
      case 'critical':
        adjustedPages = Math.min(adjustedPages, 3);
        reason = '메모리 부족으로 인한 조정';
        wasAdjusted = adjustedPages !== requestedPages;
        break;
      case 'high':
        adjustedPages = Math.min(adjustedPages, 10);
        reason = '높은 메모리 사용량으로 인한 조정';
        wasAdjusted = adjustedPages !== requestedPages;
        break;
      case 'medium':
        if (requestedPages > 25) {
          adjustedPages = 25;
          reason = '메모리 최적화를 위한 조정';
          wasAdjusted = true;
        }
        break;
    }
  }
  
  // 예상 메모리 사용량 기반 조정
  if (!memoryEstimate.isSafe && !wasAdjusted) {
    if (memoryEstimate.estimatedBytes > MEMORY_THRESHOLDS.CRITICAL) {
      adjustedPages = Math.min(adjustedPages, 5);
      reason = '예상 메모리 사용량이 너무 높음';
      wasAdjusted = true;
    } else if (memoryEstimate.estimatedBytes > MEMORY_THRESHOLDS.HIGH) {
      adjustedPages = Math.min(adjustedPages, 15);
      reason = '예상 메모리 사용량 최적화';
      wasAdjusted = true;
    }
  }
  
  return {
    adjustedPages,
    reason,
    wasAdjusted
  };
}