// PDF 생성 관련 상수들 (기존 main.js에서 가져옴)

// 페이지 레이아웃 설정 (mm to points 변환)
export const PAGE_LAYOUT = {
  LEFT_MARGIN: 25 * (1 / 25.4) * 72,
  RIGHT_MARGIN: 25 * (1 / 25.4) * 72,
  TOP_MARGIN: 20 * (1 / 25.4) * 72,
  BOTTOM_MARGIN: 20 * (1 / 25.4) * 72,
} as const;

// 가이드라인 설정
export const LINE_SETTINGS = {
  TOTAL_LINES: 22,
  LINE_GROUP_HEIGHT: 5.5 * (1 / 25.4) * 72,
} as const;

// 4-Zone 가이드라인 색상 및 스타일 설정
export const GUIDELINE_STYLES = {
  // 상단선 (Ascender line) - 대문자 상단
  ascender: {
    color: { r: 0.2, g: 0.2, b: 0.2 },
    thickness: 0.5,
    style: 'solid' as const
  },
  // 중간선 영역 (X-height area) - 소문자 영역 사각형
  xheight_area: {
    color: { r: 0.0, g: 0.6, b: 0.0 },
    thickness: 0.5,
    style: 'solid' as const
  },
  // 중간 보조선 (X-height middle) - 소문자 중간 (흐릿하게)
  xheight_mid: {
    color: { r: 0.7, g: 0.85, b: 0.7 },
    thickness: 0.5,
    style: 'dashed' as const,
    dashArray: [2, 3]
  },
  // 하단선 (Descender line) - 하향 문자 하단
  descender: {
    color: { r: 0.8, g: 0.2, b: 0.2 },
    thickness: 0.5,
    style: 'solid' as const
  },
  // 텍스트 스타일
  text: {
    color: { r: 0.1, g: 0.1, b: 0.1 },
    leftMargin: 5 // 사각형 테두리 안쪽 여백
  }
} as const;

// 연습 문장들
export const PRACTICE_TEXTS = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  [
    "The quick brown fox jumps over the lazy dog.",
    "Go placidly amid the noise and haste, and remember what peace there may be in silence.",
    "As far as possible, without surrender, be on good terms with all persons.",
    "Speak your truth quietly and clearly; and listen to others, even to the dull and the ignorant; they too have their story.",
    "Pack my box with five dozen liquor jugs.",
    "Sphinx of black quartz, judge my vow.",
    "You are a child of the universe, no less than the trees and the stars; you have a right to be here.",
    "And whether or not it is clear to you, no doubt the universe is unfolding as it should."
  ].join(" ")
] as const;

// 폰트 사이즈에 따른 PDF 사이즈 매핑
export const FONT_SIZE_MAPPINGS = {
  small: {
    baseFontSize: 12,
    lineSpacing: 4.5 * (1 / 25.4) * 72,
    totalLines: 26
  },
  medium: {
    baseFontSize: 16,
    lineSpacing: 5.5 * (1 / 25.4) * 72,
    totalLines: 22
  },
  large: {
    baseFontSize: 20,
    lineSpacing: 6.5 * (1 / 25.4) * 72,
    totalLines: 18
  }
} as const;

// 파일 출력 설정
export const OUTPUT_SETTINGS = {
  DEFAULT_FILENAME: 'handwriting_practice_sheet.pdf',
  CONTENT_TYPE: 'application/pdf'
} as const;