'use client';

import { useState } from 'react';
import { getFontById, getFontSizeById } from '@/lib/fonts';
import { generatePDF } from '@/app/actions/pdf-generator';

interface DownloadButtonProps {
  selectedFontId: string;
  selectedSizeId: string;
  className?: string;
  disabled?: boolean;
}

export default function DownloadButton({ 
  selectedFontId, 
  selectedSizeId, 
  className = '',
  disabled = false 
}: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const selectedFont = getFontById(selectedFontId);
  const selectedSize = getFontSizeById(selectedSizeId);

  // PDF 다운로드 처리
  const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
    try {
      // Blob 생성
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 링크 클릭으로 다운로드 시작
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 메모리 정리
      URL.revokeObjectURL(url);
      
      console.log(`✅ PDF 다운로드 완료: ${filename}`);
    } catch (error) {
      console.error('다운로드 처리 오류:', error);
      throw new Error('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = async () => {
    if (isGenerating || disabled || !selectedFont || !selectedSize) return;

    setIsGenerating(true);
    setError(null);
    setProgress('PDF 생성 준비 중...');

    try {
      // FormData 준비
      const formData = new FormData();
      formData.append('fontId', selectedFontId);
      formData.append('sizeId', selectedSizeId);
      
      setProgress('폰트 분석 중...');
      
      // Server Action 호출
      const result = await generatePDF(formData);
      
      if (!result.success) {
        throw new Error(result.error || 'PDF 생성에 실패했습니다.');
      }
      
      if (!result.data || !result.filename) {
        throw new Error('PDF 데이터를 받지 못했습니다.');
      }
      
      setProgress('PDF 다운로드 중...');
      
      // PDF 다운로드
      downloadPDF(result.data, result.filename);
      
      setProgress('완료!');
      
      // 성공 메시지 (선택적)
      setTimeout(() => setProgress(''), 2000);
      
    } catch (err) {
      console.error('PDF 생성 오류:', err);
      const errorMessage = err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 다운로드 버튼 */}
      <button
        onClick={handleDownload}
        disabled={disabled || isGenerating || !selectedFont || !selectedSize}
        className={`
          w-full flex items-center justify-center py-3 px-4 border border-transparent 
          rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200
          ${disabled || isGenerating || !selectedFont || !selectedSize
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

      {/* 선택된 설정 요약 */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="font-medium text-gray-900 mb-1">생성 설정</div>
        <div className="space-y-1">
          <div>폰트: {selectedFont?.name || '선택 안됨'}</div>
          <div>사이즈: {selectedSize?.label || '선택 안됨'} ({selectedSize?.size || 0}px)</div>
        </div>
      </div>

      {/* 진행 상황 표시 */}
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

      {/* 성공 메시지 */}
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

      {/* 주의사항 */}
      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="font-medium text-blue-900 mb-1">📋 안내사항</div>
        <ul className="space-y-1 text-blue-800">
          <li>• A4 사이즈로 생성됩니다</li>
          <li>• 4-Zone 가이드라인이 포함됩니다</li>
          <li>• 연습 텍스트가 자동으로 배치됩니다</li>
          <li>• PDF 파일로 다운로드됩니다</li>
          <li>• 생성된 PDF는 고품질 인쇄에 최적화되어 있습니다</li>
        </ul>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">오류:</span>
          </div>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* 비활성화 상태 메시지 */}
      {(!selectedFont || !selectedSize) && (
        <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>폰트와 사이즈를 선택해주세요</span>
          </div>
        </div>
      )}
    </div>
  );
}