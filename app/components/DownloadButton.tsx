'use client';

import { useState } from 'react';
import { ROBOTO_MONO_FONT } from '@/lib/fonts';
import { generatePDF } from '@/app/actions/pdf-generator';
import { TEXT_OPTIONS, TextOptionId } from '@/lib/constants';
import { 
  MultiPagePDFErrorHandler, 
  checkMemoryUsage, 
  adjustPageLimitForMemory,
  logMultiPageError 
} from '@/lib/client-error-handling';
import { MultiPagePDFError } from '@/lib/types/multi-page-pdf';

interface DownloadButtonProps {
  selectedFontId?: string; // 호환성용으로 유지하지만 무시됨
  selectedSize: number;
  selectedTextId: TextOptionId;
  pageLimit?: number; // 새로운 페이지 제한 옵션
  className?: string;
  disabled?: boolean;
}

// 숫자 크기를 가장 가까운 sizeId로 변환하는 헬퍼 함수
const getSizeIdFromSize = (size: number): string => {
  if (size <= 16) return 'small';
  if (size <= 21) return 'medium';
  return 'large';
};

export default function DownloadButton({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedFontId: _selectedFontId, // 호환성용으로 유지하지만 무시됨
  selectedSize, 
  selectedTextId,
  pageLimit = 1, // 기본값 1페이지 (기존 동작 유지)
  className = '',
  disabled = false 
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [suggestedPageLimit, setSuggestedPageLimit] = useState<number | null>(null);

  // selectedFontId 무시하고 항상 Roboto Mono 사용
  const selectedFont = ROBOTO_MONO_FONT;
  const selectedTextOption = TEXT_OPTIONS.find(option => option.id === selectedTextId);

  // PDF 다운로드 처리
  const downloadPDF = (base64Data: string, filename: string) => {
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log(`✅ PDF 다운로드 완료: ${filename}`);
    } catch (error) {
      console.error('다운로드 처리 오류:', error);
      throw new Error('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = async (useAdjustedSettings = false) => {
    if (isGenerating || disabled) return;

    setIsGenerating(true);
    setError(null);
    setSuggestedPageLimit(null);
    setProgress('PDF 생성 준비 중...');
    
    // 메모리 상황 확인
    const memoryInfo = checkMemoryUsage();
    let effectivePageLimit = pageLimit;
    
    if (useAdjustedSettings || (memoryInfo.available && memoryInfo.memoryPressure !== 'low')) {
      effectivePageLimit = adjustPageLimitForMemory(pageLimit, memoryInfo.memoryPressure);
      if (effectivePageLimit < pageLimit) {
        setProgress(`메모리 최적화를 위해 페이지 수를 ${effectivePageLimit}로 조정합니다...`);
      }
    }

    try {
      const sizeId = getSizeIdFromSize(selectedSize);

      const formData = new FormData();
      formData.append('fontId', 'roboto-mono');  // 고정된 폰트 ID
      formData.append('sizeId', sizeId);
      formData.append('textId', selectedTextId);
      formData.append('pageLimit', effectivePageLimit.toString()); // 조정된 페이지 제한 사용
      
      setProgress(effectivePageLimit > 1 ? `멀티페이지 PDF 준비 중... (최대 ${effectivePageLimit}페이지)` : '폰트 분석 중...');
      
      const result = await generatePDF(formData);
      
      if (!result.success) {
        throw new Error(result.error || 'PDF 생성에 실패했습니다.');
      }
      
      if (!result.data || !result.filename) {
        throw new Error('PDF 데이터를 받지 못했습니다.');
      }
      
      setProgress(effectivePageLimit > 1 ? '멀티페이지 PDF 다운로드 중...' : 'PDF 다운로드 중...');
      
      // 재시도 카운트 리셋
      setRetryCount(0);
      
      downloadPDF(result.data, result.filename);
      
      setProgress('완료!');
      
      setTimeout(() => setProgress(''), 2000);
      
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      
      // 오류 분류 및 처리
      const errorType = err instanceof Error ? 
        MultiPagePDFErrorHandler.classifyError(err) : 
        MultiPagePDFError.TEXT_DISTRIBUTION_FAILED;
      
      const errorInfo = MultiPagePDFErrorHandler.createErrorInfo(errorType, {
        pageLimit,
        selectedSize,
        selectedTextId,
        retryCount
      });
      
      // 오류 로깅
      logMultiPageError(errorInfo, {
        pageLimit,
        selectedSize,
        selectedTextId,
        retryCount
      });
      
      // 복구 전략 제안
      const recoveryStrategy = MultiPagePDFErrorHandler.suggestRecoveryStrategy(errorInfo);
      
      // 메모리 압박 상황 확인
      const memoryInfo = checkMemoryUsage();
      if (memoryInfo.available && memoryInfo.memoryPressure === 'high') {
        const adjustedLimit = adjustPageLimitForMemory(pageLimit, memoryInfo.memoryPressure);
        if (adjustedLimit < pageLimit) {
          setSuggestedPageLimit(adjustedLimit);
        }
      }
      
      // 사용자 친화적 오류 메시지 설정
      let displayMessage = errorInfo.message;
      if (errorInfo.suggestedAction) {
        displayMessage += ` ${errorInfo.suggestedAction}`;
      }
      
      // 재시도 가능한 경우 추가 정보 제공
      if (recoveryStrategy.canRetry && retryCount < 2) {
        displayMessage += ' 다시 시도하거나 설정을 조정해보세요.';
      }
      
      setError(displayMessage);
      setProgress('');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        onClick={handleDownload}
        disabled={disabled || isGenerating}
        className={`
          w-full flex items-center justify-center py-3 px-4 border border-transparent 
          rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200
          ${disabled || isGenerating
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }
        `}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {progress || 'PDF 생성 중...'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            PDF 다운로드
          </>
        )}
      </button>

      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="font-medium text-gray-900 mb-1">생성 설정</div>
        <div className="space-y-1">
          <div>폰트: {selectedFont.name}</div>
          <div>사이즈: {selectedSize}px</div>
          <div>텍스트: {selectedTextOption?.name || '선택 안됨'}</div>
          <div>페이지 제한: {pageLimit}페이지</div>
        </div>
      </div>

      {isGenerating && progress && (
        <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">{progress}</span>
          </div>
        </div>
      )}

      {progress === '완료!' && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">PDF가 성공적으로 다운로드되었습니다!</span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="font-medium text-blue-900 mb-1">📋 안내사항</div>
        <ul className="space-y-1 text-blue-800">
          <li>• A4 사이즈로 생성됩니다</li>
          <li>• 4-Zone 가이드라인이 포함됩니다</li>
          <li>• 연습 텍스트가 자동으로 배치됩니다</li>
          <li>• {pageLimit > 1 ? `최대 ${pageLimit}페이지까지 생성됩니다` : '단일 페이지로 생성됩니다'}</li>
          <li>• {pageLimit > 1 ? '페이지 번호가 자동으로 추가됩니다' : 'PDF 파일로 다운로드됩니다'}</li>
          <li>• 생성된 PDF는 고품질 인쇄에 최적화되어 있습니다</li>
        </ul>
      </div>

      {error && (
        <div className="space-y-3">
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">오류:</span>
            </div>
            <p className="mt-1">{error}</p>
          </div>
          
          {/* 재시도 및 조정 버튼들 */}
          <div className="flex flex-col space-y-2">
            {retryCount < 3 && (
              <button
                onClick={() => handleDownload()}
                disabled={isGenerating}
                className="w-full py-2 px-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                다시 시도 ({3 - retryCount}회 남음)
              </button>
            )}
            
            {suggestedPageLimit && suggestedPageLimit < pageLimit && (
              <button
                onClick={() => handleDownload(true)}
                disabled={isGenerating}
                className="w-full py-2 px-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                최적화된 설정으로 생성 ({suggestedPageLimit}페이지)
              </button>
            )}
            
            {pageLimit > 1 && (
              <button
                onClick={() => handleDownload(true)}
                disabled={isGenerating}
                className="w-full py-2 px-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                단일 페이지로 생성
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
