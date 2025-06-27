'use client';

import { TEXT_OPTIONS, TextOptionId } from '@/lib/constants';

interface TextSelectorProps {
  selectedTextId: TextOptionId;
  onTextChange: (textId: TextOptionId) => void;
  className?: string;
}

export default function TextSelector({ 
  selectedTextId, 
  onTextChange, 
  className = '' 
}: TextSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        연습 텍스트 선택
      </label>
      
      <div className="space-y-2">
        {TEXT_OPTIONS.map((option) => {
          const isSelected = selectedTextId === option.id;
          
          return (
            <div
              key={option.id}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => onTextChange(option.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {option.name}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
                
                {/* 라디오 버튼 */}
                <input
                  type="radio"
                  name="text-selection"
                  checked={isSelected}
                  onChange={() => onTextChange(option.id)}
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

              {/* 텍스트 미리보기 (첫 번째 텍스트만) */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600 font-mono line-clamp-2">
                  {option.texts[0].substring(0, 100)}
                  {option.texts[0].length > 100 && '...'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}