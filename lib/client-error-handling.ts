/**
 * 클라이언트 사이드 전용 오류 처리 유틸리티
 */

import { 
  MultiPagePDFError, 
  MultiPagePDFErrorInfo 
} from './types/multi-page-pdf';

/**
 * 멀티페이지 PDF 오류 처리 유틸리티 (클라이언트 사이드)
 */
export class MultiPagePDFErrorHandler {
  
  /**
   * 오류 타입에 따른 사용자 친화적 메시지 생성
   */
  static createErrorInfo(error: MultiPagePDFError, details?: Record<string, any>): MultiPagePDFErrorInfo {
    switch (error) {
      case MultiPagePDFError.CONTENT_TOO_LARGE:
        return {
          type: error,
          message: '선택한 텍스트 내용이 너무 큽니다.',
          details,
          suggestedAction: '더 짧은 텍스트를 선택하거나 페이지 제한을 늘려보세요.'
        };
        
      case MultiPagePDFError.PAGE_LIMIT_EXCEEDED:
        return {
          type: error,
          message: '페이지 제한을 초과했습니다.',
          details,
          suggestedAction: '페이지 제한을 늘리거나 더 짧은 텍스트를 선택해주세요.'
        };
        
      case MultiPagePDFError.TEXT_DISTRIBUTION_FAILED:
        return {
          type: error,
          message: '텍스트 분배 중 오류가 발생했습니다.',
          details,
          suggestedAction: '다른 텍스트를 선택하거나 페이지를 새로고침해보세요.'
        };
        
      case MultiPagePDFError.MEMORY_LIMIT_EXCEEDED:
        return {
          type: error,
          message: '메모리 한계를 초과했습니다.',
          details,
          suggestedAction: '페이지 수를 줄이거나 더 짧은 텍스트를 선택해주세요.'
        };
        
      case MultiPagePDFError.GENERATION_TIMEOUT:
        return {
          type: error,
          message: 'PDF 생성 시간이 초과되었습니다.',
          details,
          suggestedAction: '페이지 수를 줄이거나 잠시 후 다시 시도해주세요.'
        };
        
      case MultiPagePDFError.INVALID_PAGE_LIMIT:
        return {
          type: error,
          message: '유효하지 않은 페이지 제한입니다.',
          details,
          suggestedAction: '1-50 사이의 페이지 수를 선택해주세요.'
        };
        
      default:
        return {
          type: error,
          message: '알 수 없는 오류가 발생했습니다.',
          details,
          suggestedAction: '페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'
        };
    }
  }
  
  /**
   * 일반 오류를 멀티페이지 PDF 오류로 분류
   */
  static classifyError(error: Error): MultiPagePDFError {
    const message = error.message.toLowerCase();
    
    if (message.includes('memory') || message.includes('heap')) {
      return MultiPagePDFError.MEMORY_LIMIT_EXCEEDED;
    }
    
    if (message.includes('timeout') || message.includes('time')) {
      return MultiPagePDFError.GENERATION_TIMEOUT;
    }
    
    if (message.includes('page limit') || message.includes('too many pages')) {
      return MultiPagePDFError.PAGE_LIMIT_EXCEEDED;
    }
    
    if (message.includes('text distribution') || message.includes('split')) {
      return MultiPagePDFError.TEXT_DISTRIBUTION_FAILED;
    }
    
    if (message.includes('content') && message.includes('large')) {
      return MultiPagePDFError.CONTENT_TOO_LARGE;
    }
    
    if (message.includes('invalid') && message.includes('page')) {
      return MultiPagePDFError.INVALID_PAGE_LIMIT;
    }
    
    // 기본값
    return MultiPagePDFError.TEXT_DISTRIBUTION_FAILED;
  }
  
  /**
   * 오류 복구 전략 제안
   */
  static suggestRecoveryStrategy(errorInfo: MultiPagePDFErrorInfo): {
    canRetry: boolean;
    shouldReducePageLimit: boolean;
    shouldChangeText: boolean;
    fallbackToSinglePage: boolean;
  } {
    switch (errorInfo.type) {
      case MultiPagePDFError.MEMORY_LIMIT_EXCEEDED:
        return {
          canRetry: true,
          shouldReducePageLimit: true,
          shouldChangeText: false,
          fallbackToSinglePage: true
        };
        
      case MultiPagePDFError.PAGE_LIMIT_EXCEEDED:
        return {
          canRetry: true,
          shouldReducePageLimit: true,
          shouldChangeText: true,
          fallbackToSinglePage: false
        };
        
      case MultiPagePDFError.CONTENT_TOO_LARGE:
        return {
          canRetry: true,
          shouldReducePageLimit: false,
          shouldChangeText: true,
          fallbackToSinglePage: true
        };
        
      case MultiPagePDFError.GENERATION_TIMEOUT:
        return {
          canRetry: true,
          shouldReducePageLimit: true,
          shouldChangeText: false,
          fallbackToSinglePage: true
        };
        
      case MultiPagePDFError.TEXT_DISTRIBUTION_FAILED:
        return {
          canRetry: true,
          shouldReducePageLimit: false,
          shouldChangeText: true,
          fallbackToSinglePage: true
        };
        
      case MultiPagePDFError.INVALID_PAGE_LIMIT:
        return {
          canRetry: true,
          shouldReducePageLimit: true,
          shouldChangeText: false,
          fallbackToSinglePage: false
        };
        
      default:
        return {
          canRetry: true,
          shouldReducePageLimit: false,
          shouldChangeText: false,
          fallbackToSinglePage: true
        };
    }
  }
}

/**
 * 메모리 사용량 모니터링 (브라우저 환경에서 사용 가능한 경우)
 */
export function checkMemoryUsage(): {
  available: boolean;
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  memoryPressure: 'low' | 'medium' | 'high';
} {
  // @ts-ignore - performance.memory는 일부 브라우저에서만 사용 가능
  const memory = (performance as any)?.memory;
  
  if (!memory) {
    return {
      available: false,
      memoryPressure: 'low'
    };
  }
  
  const used = memory.usedJSHeapSize;
  const limit = memory.jsHeapSizeLimit;
  const usageRatio = used / limit;
  
  let memoryPressure: 'low' | 'medium' | 'high' = 'low';
  if (usageRatio > 0.8) {
    memoryPressure = 'high';
  } else if (usageRatio > 0.6) {
    memoryPressure = 'medium';
  }
  
  return {
    available: true,
    usedJSHeapSize: used,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: limit,
    memoryPressure
  };
}

/**
 * 자동 페이지 제한 조정
 */
export function adjustPageLimitForMemory(
  currentLimit: number,
  memoryPressure: 'low' | 'medium' | 'high'
): number {
  switch (memoryPressure) {
    case 'high':
      return Math.min(currentLimit, 5); // 최대 5페이지로 제한
    case 'medium':
      return Math.min(currentLimit, 15); // 최대 15페이지로 제한
    case 'low':
    default:
      return currentLimit; // 제한 없음
  }
}

/**
 * 오류 로깅 유틸리티
 */
export function logMultiPageError(
  errorInfo: MultiPagePDFErrorInfo,
  context?: Record<string, any>
) {
  console.error('🚨 멀티페이지 PDF 오류:', {
    type: errorInfo.type,
    message: errorInfo.message,
    details: errorInfo.details,
    suggestedAction: errorInfo.suggestedAction,
    context,
    timestamp: new Date().toISOString()
  });
}