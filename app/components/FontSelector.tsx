'use client';

import { AVAILABLE_FONTS } from '@/lib/fonts';
import { useFontLoader } from '@/lib/hooks/useFontLoader';

interface FontSelectorProps {
  selectedFontId: string;
  onFontChange: (fontId: string) => void;
  className?: string;
}

export default function FontSelector({ 
  selectedFontId, 
  onFontChange, 
  className = '' 
}: FontSelectorProps) {
  const { getFontState, isFontReady, loadingCount } = useFontLoader();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between relative">
        <label className="block text-sm font-medium text-gray-700">
          폰트 선택
        </label>
        {loadingCount > 0 && (
          <span className="text-xs text-blue-600 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            폰트 로딩 중 ({loadingCount}개)
          </span>
        )}
      </div>

      <div className="space-y-2">
        {AVAILABLE_FONTS.map((font) => {
          const fontState = getFontState(font.id);
          const isReady = isFontReady(font.id);
          const isSelected = selectedFontId === font.id;

          return (
            <div
              key={font.id}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${fontState === 'error' ? 'opacity-50' : ''}
              `}
              onClick={() => onFontChange(font.id)}
            >
              {/* 폰트 정보 */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {font.name}
                    </h3>
                  </div>
                  
                </div>
                
                {/* 선택 라디오 버튼 (숨김) */}
                <input
                  type="radio"
                  name="font-selection"
                  checked={isSelected}
                  onChange={() => onFontChange(font.id)}
                  className="sr-only"
                />
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* 폰트 미리보기 (폰트가 로딩된 경우에만) */}
              {isReady && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div
                    className={`text-sm font-preview ${getFontClassName(font.id)}`}
                    style={{ 
                      fontWeight: font.weight,
                      fontStyle: font.style 
                    }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </div>
                </div>
              )}

              {/* 로딩 중일 때 placeholder */}
              {fontState === 'loading' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}

              {/* 오류 상태 */}
              {fontState === 'error' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    폰트 로딩 실패
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 모든 폰트 로딩 완료 - 우하단 */}
      {loadingCount === 0 && (
        <div className="flex justify-end mt-2">
          <span className="text-xs text-green-600">
            모든 폰트 로딩 완료
          </span>
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
  
  return classMap[fontId] || '';
}