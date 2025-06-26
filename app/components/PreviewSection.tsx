'use client';

import { PREVIEW_TEXT, getFontById } from '@/lib/fonts';
import { useFontState } from '@/lib/hooks/useFontLoader';

interface PreviewSectionProps {
  selectedFontId: string;
  selectedSizeId: string; // This prop is now unused but kept for compatibility
  className?: string;
}

const previewSizes = [
  { name: '소 (Small)', size: 14 },
  { name: '중 (Medium)', size: 18 },
  { name: '대 (Large)', size: 22 },
];

export default function PreviewSection({ 
  selectedFontId, 
  selectedSizeId, // This prop is now unused but kept for compatibility
  className = '' 
}: PreviewSectionProps) {
  const { isReady: isFontReady, state: fontState } = useFontState(selectedFontId);
  const selectedFont = getFontById(selectedFontId);

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
              className={`font-preview p-4 bg-gray-50 rounded border-2 border-dashed border-gray-200 ${getFontClassName(selectedFontId)} ${!isFontReady && fontState === 'loading' ? 'loading' : ''}`}
              style={{ 
                fontSize: `${size}px`,
                fontWeight: 200,
                fontStyle: 'italic',
                lineHeight: 1.5
              }}
            >
              {PREVIEW_TEXT}
            </div>
          </div>
        ))}
      </div>


      {/* 폰트 정보 */}
      {selectedFont && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">폰트 정보</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>이름: {selectedFont.name}</div>
            <div>설명: {selectedFont.description}</div>
            <div>패밀리: {selectedFont.fontFamily}</div>
            <div>스타일: {selectedFont.style} / 굵기: {selectedFont.weight}</div>
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

// 폰트 ID에 따른 CSS 클래스 반환
function getFontClassName(fontId: string): string {
  const classMap: Record<string, string> = {
    'roboto-mono': 'font-roboto-mono',
    'jetbrains-mono': 'font-jetbrains-mono',
    'source-code-pro': 'font-source-code-pro'
  };
  
  return classMap[fontId] || 'font-roboto-mono';
}