'use client';

import { useState } from 'react';
import { PageEstimate } from '@/lib/types/multi-page-pdf';
import { TextOptionId, TEXT_OPTIONS } from '@/lib/constants';
import { useHydrationSafe, useClientEffect } from '@/lib/hooks/useHydrationSafe';

interface PageCountPreviewProps {
  selectedTextId: TextOptionId;
  selectedSize: number;
  pageLimit: number;
  onEstimateUpdate?: (estimate: PageEstimate) => void;
  className?: string;
}

export default function PageCountPreview({
  selectedTextId,
  selectedSize,
  pageLimit,
  onEstimateUpdate,
  className = ''
}: PageCountPreviewProps) {
  // 하이드레이션 안전한 상태 관리
  const { isHydrated } = useHydrationSafe(false, true);
  const [estimate, setEstimate] = useState<PageEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 선택된 텍스트 옵션 찾기
  const selectedTextOption = TEXT_OPTIONS.find(option => option.id === selectedTextId);

  // 페이지 수 추정 함수
  const estimatePages = async () => {
    if (!selectedTextOption) return;

    setIsLoading(true);
    setError(null);

    try {
      // 클라이언트 사이드에서 간단한 추정 (실제로는 서버 액션을 호출할 수 있음)
      const combinedText = selectedTextOption.texts.join(' ');
      const totalCharacters = combinedText.length;
      
      // 폰트 크기에 따른 페이지당 예상 문자 수 계산
      const baseCharsPerPage = 2000; // 기본값
      const sizeMultiplier = selectedSize <= 16 ? 1.3 : selectedSize <= 21 ? 1.0 : 0.7;
      const charsPerPage = Math.round(baseCharsPerPage * sizeMultiplier);
      
      const estimatedPages = Math.max(1, Math.ceil(totalCharacters / charsPerPage));
      const exceedsLimit = estimatedPages > pageLimit;
      
      // 신뢰도 계산
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      if (totalCharacters < 1000) {
        confidence = 'high';
      } else if (totalCharacters > 10000) {
        confidence = 'low';
      }

      const newEstimate: PageEstimate = {
        estimatedPages,
        exceedsLimit,
        totalCharacters,
        averageCharsPerPage: charsPerPage,
        confidence
      };

      setEstimate(newEstimate);
      onEstimateUpdate?.(newEstimate);

    } catch (err) {
      console.error('페이지 수 추정 오류:', err);
      setError('페이지 수를 추정할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 하이드레이션 완료 후에만 추정 실행
  useClientEffect(() => {
    estimatePages();
  }, [selectedTextId, selectedSize, pageLimit]);

  // 하이드레이션 전에는 플레이스홀더 표시
  if (!isHydrated) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900">페이지 수 예상</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-400">-</span>
                <span className="ml-2 text-lg text-gray-400">페이지</span>
              </div>
              <p className="text-sm mt-1 text-gray-500">계산 준비 중...</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500">
                계산 중...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900">페이지 수 예상</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-800">페이지 수 계산 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900">페이지 수 예상</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // 추정 결과가 없는 경우
  if (!estimate) {
    return null;
  }

  // 신뢰도에 따른 색상 및 아이콘
  const getConfidenceDisplay = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '✓',
          text: '높음'
        };
      case 'low':
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: '⚠',
          text: '낮음'
        };
      default:
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: 'ℹ',
          text: '보통'
        };
    }
  };

  const confidenceDisplay = getConfidenceDisplay(estimate.confidence);

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">페이지 수 예상</h3>
      
      {/* 메인 추정 결과 */}
      <div className={`rounded-lg p-4 ${estimate.exceedsLimit ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${estimate.exceedsLimit ? 'text-red-600' : 'text-green-600'}`}>
                {estimate.estimatedPages}
              </span>
              <span className={`ml-2 text-lg ${estimate.exceedsLimit ? 'text-red-600' : 'text-green-600'}`}>
                페이지
              </span>
            </div>
            <p className={`text-sm mt-1 ${estimate.exceedsLimit ? 'text-red-700' : 'text-green-700'}`}>
              예상 페이지 수
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${estimate.exceedsLimit ? 'text-red-600' : 'text-green-600'}`}>
              제한: {pageLimit}페이지
            </div>
            {estimate.exceedsLimit && (
              <div className="text-xs text-red-600 mt-1">
                {estimate.estimatedPages - pageLimit}페이지 초과
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      {estimate.exceedsLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">내용이 페이지 제한을 초과합니다</p>
              <p className="text-xs text-amber-700 mt-1">
                일부 내용이 잘릴 수 있습니다. 페이지 제한을 늘리거나 더 짧은 텍스트를 선택하세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 상세 정보 */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <h4 className="text-sm font-medium text-gray-900">상세 정보</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">총 문자 수:</span>
            <span className="ml-2 font-medium text-gray-900">
              {estimate.totalCharacters.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">페이지당 평균:</span>
            <span className="ml-2 font-medium text-gray-900">
              {estimate.averageCharsPerPage.toLocaleString()}자
            </span>
          </div>
          <div>
            <span className="text-gray-600">선택된 텍스트:</span>
            <span className="ml-2 font-medium text-gray-900">
              {selectedTextOption?.name}
            </span>
          </div>
          <div>
            <span className="text-gray-600">폰트 크기:</span>
            <span className="ml-2 font-medium text-gray-900">
              {selectedSize}px
            </span>
          </div>
        </div>
      </div>

      {/* 신뢰도 표시 */}
      <div className={`rounded-lg p-3 ${confidenceDisplay.bgColor} ${confidenceDisplay.borderColor} border`}>
        <div className="flex items-center">
          <span className="text-lg mr-2">{confidenceDisplay.icon}</span>
          <div>
            <p className={`text-sm font-medium ${confidenceDisplay.color}`}>
              추정 신뢰도: {confidenceDisplay.text}
            </p>
            <p className={`text-xs mt-1 ${confidenceDisplay.color}`}>
              {estimate.confidence === 'high' && '짧은 텍스트로 정확한 추정이 가능합니다.'}
              {estimate.confidence === 'medium' && '일반적인 길이의 텍스트입니다. 실제 페이지 수는 ±1페이지 정도 차이날 수 있습니다.'}
              {estimate.confidence === 'low' && '매우 긴 텍스트입니다. 실제 페이지 수는 추정치와 다를 수 있습니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <button
        onClick={estimatePages}
        className="w-full py-2 px-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200"
      >
        <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        페이지 수 다시 계산
      </button>
    </div>
  );
}