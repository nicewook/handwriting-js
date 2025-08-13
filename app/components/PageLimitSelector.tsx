'use client';

import { useState } from 'react';
import { MULTI_PAGE_CONFIG } from '@/lib/constants';

interface PageLimitSelectorProps {
  selectedLimit: number;
  onLimitChange: (limit: number) => void;
  maxLimit?: number;
  disabled?: boolean;
  className?: string;
}

export default function PageLimitSelector({
  selectedLimit,
  onLimitChange,
  maxLimit = MULTI_PAGE_CONFIG.MAX_PAGES,
  disabled = false,
  className = ''
}: PageLimitSelectorProps) {
  const [inputValue, setInputValue] = useState(selectedLimit.toString());

  const minLimit = MULTI_PAGE_CONFIG.MIN_PAGES;
  const effectiveMaxLimit = Math.min(maxLimit, MULTI_PAGE_CONFIG.MAX_PAGES);

  // 슬라이더 값 변경 처리
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setInputValue(newValue.toString());
    onLimitChange(newValue);
  };

  // 입력 필드 값 변경 처리
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= minLimit && numValue <= effectiveMaxLimit) {
      onLimitChange(numValue);
    }
  };

  // 입력 필드 포커스 해제 시 값 검증
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < minLimit || numValue > effectiveMaxLimit) {
      setInputValue(selectedLimit.toString());
    }
  };

  // 미리 정의된 값들
  const presetValues = [1, 5, 10, 20, 30, 50].filter(value => value <= effectiveMaxLimit);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">페이지 수 제한</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={minLimit}
            max={effectiveMaxLimit}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            className={`
              w-16 px-2 py-1 text-sm border border-gray-300 rounded-md text-center
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
          />
          <span className="text-sm text-gray-500">페이지</span>
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="space-y-2">
        <input
          type="range"
          min={minLimit}
          max={effectiveMaxLimit}
          step={MULTI_PAGE_CONFIG.PAGE_LIMIT_STEP}
          value={selectedLimit}
          onChange={handleSliderChange}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            slider
          `}
        />
        
        {/* 슬라이더 눈금 */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>{minLimit}</span>
          <span>{Math.floor(effectiveMaxLimit / 2)}</span>
          <span>{effectiveMaxLimit}</span>
        </div>
      </div>

      {/* 미리 정의된 값 버튼들 */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600">빠른 선택:</p>
        <div className="flex flex-wrap gap-2">
          {presetValues.map((value) => (
            <button
              key={value}
              onClick={() => {
                setInputValue(value.toString());
                onLimitChange(value);
              }}
              disabled={disabled}
              className={`
                px-3 py-1 text-sm rounded-md border transition-colors duration-200
                ${selectedLimit === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {value}페이지
            </button>
          ))}
        </div>
      </div>

      {/* 설명 및 경고 */}
      <div className="space-y-2">
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="font-medium text-gray-900 mb-1">📄 페이지 제한 안내</div>
          <ul className="space-y-1 text-gray-700">
            <li>• 최소 {minLimit}페이지, 최대 {effectiveMaxLimit}페이지까지 생성 가능</li>
            <li>• 텍스트 내용이 페이지 제한보다 많으면 자동으로 잘립니다</li>
            <li>• 페이지 수가 많을수록 생성 시간이 오래 걸립니다</li>
          </ul>
        </div>

        {selectedLimit >= 30 && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">주의:</span>
            </div>
            <p className="mt-1">
              {selectedLimit}페이지는 많은 양입니다. 생성 시간이 오래 걸리고 파일 크기가 클 수 있습니다.
            </p>
          </div>
        )}

        {selectedLimit >= 45 && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">경고:</span>
            </div>
            <p className="mt-1">
              매우 많은 페이지입니다. 브라우저 성능에 영향을 줄 수 있으니 주의하세요.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .slider:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}