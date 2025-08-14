'use client';

interface SizeSelectorProps {
  selectedSize: number;
  onSizeChange: (size: number) => void;
  className?: string;
}

export default function SizeSelector({ 
  selectedSize,
  onSizeChange,
  className = '' 
}: SizeSelectorProps) {
  const sizes = [14, 15, 16, 17, 18, 19, 20];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">사이즈 선택</h3>
        <span className="text-sm font-medium text-gray-600">px</span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${selectedSize === size
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
