'use client';

import { useState } from 'react';
import FontSelector from './components/FontSelector';
import SizeSelector from './components/SizeSelector';
import TextSelector from './components/TextSelector';
import PreviewSection from './components/PreviewSection';
import DownloadButton from './components/DownloadButton';
import { DEFAULT_FONT_ID } from '@/lib/fonts';
import { DEFAULT_TEXT_OPTION_ID, TextOptionId } from '@/lib/constants';

const DEFAULT_FONT_SIZE = 18;

export default function Home() {
  // 상태 관리
  const [selectedFontId, setSelectedFontId] = useState(DEFAULT_FONT_ID);
  const [selectedSize, setSelectedSize] = useState(DEFAULT_FONT_SIZE);
  const [selectedTextId, setSelectedTextId] = useState<TextOptionId>(DEFAULT_TEXT_OPTION_ID);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            핸드라이팅 연습 시트 생성기
          </h1>
          <p className="text-lg text-gray-600">
            다양한 폰트와 사이즈로 나만의 핸드라이팅 연습 시트를 만들어보세요
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="xl:col-span-1 space-y-6">
            {/* Font Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <FontSelector
                selectedFontId={selectedFontId}
                onFontChange={setSelectedFontId}
              />
            </div>

            {/* Size Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <SizeSelector
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
              />
            </div>

            {/* Text Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <TextSelector
                selectedTextId={selectedTextId}
                onTextChange={setSelectedTextId}
              />
            </div>

            {/* Download Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <DownloadButton
                selectedFontId={selectedFontId}
                selectedSize={selectedSize}
                selectedTextId={selectedTextId}
              />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <PreviewSection
                selectedFontId={selectedFontId}
                selectedSizeId={selectedSize.toString()}
                selectedTextId={selectedTextId}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            만든 연습 시트로 아름다운 핸드라이팅을 연습해보세요! 
            <span className="inline-block ml-2">✍️</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
