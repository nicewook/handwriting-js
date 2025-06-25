'use client';

import { FONT_SIZES, PREVIEW_TEXT, getFontById, getFontSizeById } from '@/lib/fonts';
import { useFontState } from '@/lib/hooks/useFontLoader';
import { getSafeFontStyle } from '@/lib/font-utils';

interface PreviewSectionProps {
  selectedFontId: string;
  selectedSizeId: string;
  className?: string;
}

export default function PreviewSection({ 
  selectedFontId, 
  selectedSizeId, 
  className = '' 
}: PreviewSectionProps) {
  const { isReady: isFontReady, state: fontState } = useFontState(selectedFontId);
  const selectedFont = getFontById(selectedFontId);
  const selectedSize = getFontSizeById(selectedSizeId);

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

      {/* 선택된 사이즈 미리보기 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedSize?.label || '보통 글씨'} ({selectedSize?.size || 18}px)
            </h3>
            {!isFontReady && fontState === 'loading' && (
              <div className="flex items-center text-sm text-blue-600">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                폰트 로딩 중
              </div>
            )}
          </div>
          
          <div
            className={`font-preview p-4 bg-gray-50 rounded border-2 border-dashed border-gray-200 ${!isFontReady && fontState === 'loading' ? 'loading' : ''}`}
            style={getSafeFontStyle(selectedFontId, selectedSizeId)}
          >
            {PREVIEW_TEXT}
          </div>
        </div>
      </div>

      {/* 모든 사이즈 비교 미리보기 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          모든 사이즈 비교
        </h3>
        
        <div className="space-y-6">
          {FONT_SIZES.map((size) => {
            const isCurrentSize = size.id === selectedSizeId;
            
            return (
              <div 
                key={size.id}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${isCurrentSize 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      {size.label}
                    </h4>
                    <span className="text-xs text-gray-500">
                      ({size.size}px)
                    </span>
                    {isCurrentSize && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        선택됨
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {size.description}
                  </div>
                </div>
                
                <div
                  className={`font-preview ${!isFontReady && fontState === 'loading' ? 'loading' : ''}`}
                  style={getSafeFontStyle(selectedFontId, size.id)}
                >
                  {PREVIEW_TEXT}
                </div>
              </div>
            );
          })}
        </div>
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