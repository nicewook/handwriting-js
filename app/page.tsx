export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">설정</h2>
            
            {/* Font Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                폰트 선택
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="roboto">Roboto Mono Extra Light Italic</option>
                {/* 추후 폰트 옵션들이 추가될 예정 */}
              </select>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이즈 선택
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" name="size" value="small" className="mr-2" />
                  <span>소</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="size" value="medium" className="mr-2" defaultChecked />
                  <span>중</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="size" value="large" className="mr-2" />
                  <span>대</span>
                </label>
              </div>
            </div>

            {/* Download Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors">
              PDF 다운로드
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">미리보기</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">소 (14px)</h3>
                <p className="text-sm" style={{ fontFamily: 'monospace' }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">중 (18px)</h3>
                <p className="text-lg" style={{ fontFamily: 'monospace' }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">대 (24px)</h3>
                <p className="text-xl" style={{ fontFamily: 'monospace' }}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
