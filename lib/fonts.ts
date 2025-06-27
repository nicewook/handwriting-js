// 폰트 메타데이터 타입 정의
export interface FontMetadata {
  id: string;
  name: string;
  description: string;
  fileName: string;
  fontFamily: string;
  weight: string;
  style: string;
  filePath: string;
}

// 사용 가능한 폰트 목록
export const AVAILABLE_FONTS: FontMetadata[] = [
  {
    id: 'roboto-mono',
    name: 'Roboto Mono',
    description: '',
    fileName: 'RobotoMono-ExtraLightItalic.ttf',
    fontFamily: 'RobotoMono',
    weight: '200',
    style: 'italic',
    filePath: '/fonts/RobotoMono-ExtraLightItalic.ttf'
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    description: '',
    fileName: 'JetBrainsMono-ExtraLightItalic.ttf',
    fontFamily: 'JetBrainsMono',
    weight: '200',
    style: 'italic',
    filePath: '/fonts/JetBrainsMono-ExtraLightItalic.ttf'
  },
  {
    id: 'source-code-pro',
    name: 'Source Code Pro',
    description: '',
    fileName: 'SourceCodePro-ExtraLightItalic.ttf',
    fontFamily: 'SourceCodePro',
    weight: '200',
    style: 'italic',
    filePath: '/fonts/SourceCodePro-ExtraLightItalic.ttf'
  }
];

// 기본 폰트 설정
export const DEFAULT_FONT_ID = 'roboto-mono';

// 폰트 사이즈 설정
export interface FontSize {
  id: string;
  name: string;
  label: string;
  size: number;
  description: string;
}

export const FONT_SIZES: FontSize[] = [
  {
    id: 'small',
    name: '소',
    label: '작은 글씨',
    size: 14,
    description: '세밀한 연습에 적합'
  },
  {
    id: 'medium',
    name: '중',
    label: '보통 글씨',
    size: 18,
    description: '일반적인 연습에 적합'
  },
  {
    id: 'large',
    name: '대',
    label: '큰 글씨',
    size: 24,
    description: '초보자 연습에 적합'
  }
];

// export const DEFAULT_FONT_SIZE_ID = 'medium';

// 미리보기 텍스트
export const PREVIEW_TEXT = "The quick brown fox jumps over the lazy dog.";

// 폰트 유틸리티 함수들
export function getFontById(id: string): FontMetadata | undefined {
  return AVAILABLE_FONTS.find(font => font.id === id);
}

export function getFontSizeById(id: string): FontSize | undefined {
  return FONT_SIZES.find(size => size.id === id);
}

export function getDefaultFont(): FontMetadata {
  return getFontById(DEFAULT_FONT_ID) || AVAILABLE_FONTS[0];
}

export function getDefaultFontSize(): FontSize {
  return getFontSizeById(DEFAULT_FONT_SIZE_ID) || FONT_SIZES[1];
}

// 웹폰트 CSS 생성 함수
export function generateFontFaceCSS(font: FontMetadata): string {
  return `
    @font-face {
      font-family: '${font.fontFamily}';
      src: url('${font.filePath}') format('truetype');
      font-weight: ${font.weight};
      font-style: ${font.style};
      font-display: swap;
    }
  `;
}

// 모든 폰트의 CSS 생성
export function generateAllFontFacesCSS(): string {
  return AVAILABLE_FONTS.map(font => generateFontFaceCSS(font)).join('\n');
}

// 폰트 스타일 객체 생성
export function getFontStyle(fontId: string, sizeId: string): React.CSSProperties {
  const font = getFontById(fontId);
  const size = getFontSizeById(sizeId);
  
  if (!font || !size) {
    return {};
  }
  
  return {
    fontFamily: `'${font.fontFamily}', monospace`,
    fontSize: `${size.size}px`,
    fontWeight: font.weight,
    fontStyle: font.style,
    lineHeight: 1.5
  };
}