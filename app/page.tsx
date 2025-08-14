'use client';

import { useState } from 'react';
import SizeSelector from './components/SizeSelector';
import TextSelector from './components/TextSelector';
import PreviewSection from './components/PreviewSection';
import DownloadButton from './components/DownloadButton';
import PageLimitSelector from './components/PageLimitSelector';
import PageCountPreview from './components/PageCountPreview';
import { DEFAULT_TEXT_OPTION_ID, TextOptionId, MULTI_PAGE_CONFIG } from '@/lib/constants';
import { useHydrationSafe } from '@/lib/hooks/useHydrationSafe';

const DEFAULT_FONT_SIZE = 18;

export default function Home() {
  // 상태 관리 (폰트는 Roboto Mono로 고정)
  const [selectedSize, setSelectedSize] = useState(DEFAULT_FONT_SIZE);
  const [selectedTextId, setSelectedTextId] = useState<TextOptionId>(DEFAULT_TEXT_OPTION_ID);
  const [pageLimit, setPageLimit] = useState(MULTI_PAGE_CONFIG.DEFAULT_PAGE_LIMIT);
  
  // 하이드레이션 안전한 pageLimit 값 사용
  const { value: safePageLimit } = useHydrationSafe(MULTI_PAGE_CONFIG.DEFAULT_PAGE_LIMIT, pageLimit);
  
  // 고정된 폰트 ID
  const fontId = 'roboto-mono';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-12" suppressHydrationWarning>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            핸드라이팅 연습 시트 생성기
          </h1>
          <p className="text-lg text-gray-600">
            Roboto Mono 폰트로 나만의 핸드라이팅 연습 시트를 만들어보세요
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {safePageLimit > 1 ? `멀티페이지 모드 (최대 ${safePageLimit}페이지)` : '단일페이지 모드'}
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="xl:col-span-1 space-y-6 max-h-screen overflow-y-auto">
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

            {/* Page Limit Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <PageLimitSelector
                selectedLimit={pageLimit}
                onLimitChange={setPageLimit}
              />
            </div>

            {/* Page Count Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <PageCountPreview
                selectedTextId={selectedTextId}
                selectedSize={selectedSize}
                pageLimit={pageLimit}
              />
            </div>

            {/* Download Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <DownloadButton
                selectedFontId={fontId}
                selectedSize={selectedSize}
                selectedTextId={selectedTextId}
                pageLimit={pageLimit}
              />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <PreviewSection
                selectedFontId={fontId}
                selectedSizeId={selectedSize.toString()}
                selectedTextId={selectedTextId}
                pageLimit={pageLimit}
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
          <p className="text-xs text-gray-400 mt-2">
            💡 팁: 페이지 수를 늘려서 더 많은 연습 내용을 생성할 수 있습니다 (최대 50페이지)
          </p>
        </footer>
      </div>
    </div>
  );
}
