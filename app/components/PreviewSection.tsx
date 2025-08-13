'use client';

import { PREVIEW_TEXT, ROBOTO_MONO_FONT } from '@/lib/fonts';
import { useFontState } from '@/lib/hooks/useFontLoader';
import { TEXT_OPTIONS, TextOptionId } from '@/lib/constants';

interface PreviewSectionProps {
  selectedFontId?: string; // 호환성용으로 유지하지만 무시됨
  selectedSizeId: string; // This prop is now unused but kept for compatibility
  selectedTextId: TextOptionId;
  pageLimit?: number; // 페이지 제한 정보 추가
  className?: string;
}

const previewSizes = [
  { name: '소 (Small)', size: 14 },
  { name: '중 (Medium)', size: 18 },
  { name: '대 (Large)', size: 22 },
];

export default function PreviewSection({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedFontId: _selectedFontId, // 호환성용으로 유지하지만 무시됨
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedSizeId, // This prop is now unused but kept for compatibility
  selectedTextId,
  pageLimit = 1, // 기본값 1페이지
  className = '' 
}: PreviewSectionProps) {
  // selectedFontId 무시하고 항상 Roboto Mono 사용
  const { isReady: isFontReady, state: fontState } = useFontState();
  const selectedFont = ROBOTO_MONO_FONT;
  const selectedTextOption = TEXT_OPTIONS.find(option => option.id === selectedTextId);
  
  // 선택된 텍스트의 첫 번째 내용을 미리보기로 사용
  const previewText = selectedTextOption?.texts[0] || PREVIEW_TEXT;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">미리보기</h2>
        
        {/* 폰트 상태 표시 */}
        <div className="text-sm text-gray-500">
          {selectedFont && (
            <span className="font-medium">{selectedFont.name}</span>
          )}
          {fontState === 'loading' && (
            <span className="text-blue-600 ml-2">로딩 중...</span>
          )}
          {fontState === 'error' && (
            <span className="text-red-600 ml-2">로딩 실패</span>
          )}
        </div>
      </div>

      {/* 모든 사이즈 미리보기 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        {previewSizes.map(({ name, size }) => (
          <div key={name}>
            <h3 className="text-lg font-medium text-gray-900">
              {name} ({size}px)
            </h3>
            <div
              className={`font-preview p-4 bg-gray-50 rounded border-2 border-dashed border-gray-200 ${getFontClassName()} ${!isFontReady && fontState === 'loading' ? 'loading' : ''}`}
              style={{ 
                fontSize: `${size}px`,
                fontWeight: 200,
                fontStyle: 'italic',
                lineHeight: 1.5
              }}
            >
              {previewText.substring(0, 200)}{previewText.length > 200 && '...'}
            </div>
          </div>
        ))}
      </div>


      {/* 폰트 정보 */}
      {selectedFont && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">폰트 정보</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>폰트: {selectedFont.name}</div>
            <div>텍스트: {selectedTextOption?.name}</div>
            <div>패밀리: {selectedFont.fontFamily}</div>
            <div>스타일: {selectedFont.style} / 굵기: {selectedFont.weight}</div>
            <div>페이지 제한: {pageLimit}페이지</div>
            {pageLimit > 1 && (
              <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-100 rounded">
                💡 멀티페이지 모드: 텍스트가 여러 페이지에 자동으로 분배됩니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 오류 상태 표시 */}
      {fontState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">폰트 로딩 오류</h3>
              <p className="text-sm text-red-700 mt-1">
                선택된 폰트를 불러올 수 없습니다. 기본 폰트로 대체됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Roboto Mono CSS 클래스 반환 (고정)
function getFontClassName(): string {
  return 'font-roboto-mono';
}