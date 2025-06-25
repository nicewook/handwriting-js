'use client';

import { FONT_SIZES } from '@/lib/fonts';

interface SizeSelectorProps {
  selectedSizeId: string;
  onSizeChange: (sizeId: string) => void;
  className?: string;
}

export default function SizeSelector({ 
  selectedSizeId, 
  onSizeChange, 
  className = '' 
}: SizeSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        사이즈 선택
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        {FONT_SIZES.map((size) => {
          const isSelected = selectedSizeId === size.id;
          
          return (
            <div
              key={size.id}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all duration-200 text-center
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => onSizeChange(size.id)}
            >
              {/* 라디오 버튼 (숨김) */}
              <input
                type="radio"
                name="size-selection"
                value={size.id}
                checked={isSelected}
                onChange={() => onSizeChange(size.id)}
                className="sr-only"
              />
              
              {/* 사이즈 표시 */}
              <div className="space-y-2">
                {/* 큰 글자로 사이즈명 */}
                <div className="text-2xl font-bold text-gray-900">
                  {size.name}
                </div>
                
                {/* 픽셀 크기 */}
                <div className="text-sm text-gray-600">
                  {size.size}px
                </div>
                
                {/* 설명 */}
                <div className="text-xs text-gray-500">
                  {size.description}
                </div>
              </div>
              
              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 선택된 사이즈 정보 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          선택된 사이즈: <span className="font-medium text-gray-900">
            {FONT_SIZES.find(s => s.id === selectedSizeId)?.label || '보통 글씨'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {FONT_SIZES.find(s => s.id === selectedSizeId)?.description || '일반적인 연습에 적합'}
        </div>
      </div>
    </div>
  );
}