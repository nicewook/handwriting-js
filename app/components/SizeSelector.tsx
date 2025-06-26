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
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSizeChange(parseInt(e.target.value, 10));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 14 && value <= 24) {
      onSizeChange(value);
    } else if (e.target.value === '') {
      // Allow clearing the input, maybe default to a value or handle it
    } else {
      // Clamp the value if it goes out of bounds
      const clampedValue = Math.max(14, Math.min(24, value));
      onSizeChange(clampedValue);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">사이즈 선택</h3>
        <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <input
            type="number"
            min="14"
            max="24"
            value={selectedSize}
            onChange={handleInputChange}
            className="w-14 text-center font-semibold text-lg text-blue-600 bg-transparent focus:outline-none"
          />
          <span className="text-lg font-medium text-gray-800">px</span>
        </div>
      </div>
      
      <div className="space-y-2 pt-2">
        <input
          type="range"
          min="14"
          max="24"
          value={selectedSize}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="relative w-full h-4">
          <span className="absolute left-0 text-xs text-gray-500">소</span>
          <span className="absolute left-[40%] -translate-x-1/2 text-xs text-gray-500">중</span>
          <span className="absolute left-full -translate-x-full text-xs text-gray-500">대</span>
        </div>
      </div>
    </div>
  );
}
