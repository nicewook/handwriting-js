'use client';

import { FONT_SIZES } from '@/lib/fonts';

interface SizeSelectorProps {
  selectedSizeId: string;
  onSizeChange: (id: string) => void;
  className?: string;
}

export default function SizeSelector({ 
  selectedSizeId, 
  onSizeChange, 
  className = '' 
}: SizeSelectorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">사이즈 선택</h3>
      <div className="space-y-3">
        {FONT_SIZES.map((size) => (
          <div
            key={size.id}
            onClick={() => onSizeChange(size.id)}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all duration-200
              ${selectedSizeId === size.id
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-900">{size.label}</div>
                <div className="text-sm text-gray-500 ml-2">({size.size}px)</div>
              </div>
              {selectedSizeId === size.id && (
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{size.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
