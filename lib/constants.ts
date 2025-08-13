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

// 텍스트 선택 옵션들
export const TEXT_OPTIONS = [
  {
    id: 'classic',
    name: '클래식 연습 문장',
    description: '기본 연습 문장',
    texts: [
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
    ]
  },
  {
    id: 'moby-dick',
    name: '모비딕 (Moby Dick)',
    description: '허먼 멜빌의 대표작',
    texts: [
      [
        "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
        "It is a way I have of driving off the spleen and regulating the circulation.",
        "Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet;",
        "and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.",
        "This is my substitute for pistol and ball.",
        "With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship.",
        "There is nothing surprising in this.",
        "If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me."
      ].join(" ")
    ]
  },
  {
    id: 'anna-karenina',
    name: '안나 카레니나 (Anna Karenina)',
    description: '레프 톨스토이의 걸작',
    texts: [
      [
        "Happy families are all alike; every unhappy family is unhappy in its own way.",
        "Everything was in confusion in the Oblonskys' house.",
        "The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.",
        "This position of affairs had now lasted three days, and not only the husband and wife themselves, but all the members of their family and household, were painfully conscious of it.",
        "Every person in the house felt that there was no sense in their living together, and that the stray people brought together by chance in any inn had more in common with one another than they, the members of the family and household of the Oblonskys.",
        "The wife did not leave her own room, the husband had not been at home for three days.",
        "The children ran wild all over the house; the English governess quarreled with the housekeeper, and wrote to a friend asking her to look out for a new situation for her;",
        "the man-cook had walked off the day before just at dinner time; the kitchen-maid, and the coachman had given warning."
      ].join(" ")
    ]
  },
  {
    id: 'tale-of-two-cities',
    name: '두 도시 이야기 (A Tale of Two Cities)',
    description: '찰스 디킨스의 명작',
    texts: [
      [
        "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness,",
        "it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness,",
        "it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us,",
        "we were all going direct to Heaven, we were all going direct the other way--",
        "in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received,",
        "for good or for evil, in the superlative degree of comparison only."
      ].join(" ")
    ]
  }
] as const;

export type TextOptionId = typeof TEXT_OPTIONS[number]['id'];

// 기본 선택 옵션
export const DEFAULT_TEXT_OPTION_ID: TextOptionId = 'classic';

// 하위 호환성을 위한 기존 상수 (deprecated)
export const PRACTICE_TEXTS = TEXT_OPTIONS[0].texts;

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

// 멀티페이지 PDF 설정
export const MULTI_PAGE_CONFIG = {
  MIN_PAGES: 1,
  MAX_PAGES: 50,
  DEFAULT_PAGE_LIMIT: 10,
  PAGE_LIMIT_STEP: 1
} as const;

// 페이지 번호 설정
export const PAGE_NUMBER_CONFIG = {
  POSITION: 'bottom-center' as const,
  MARGIN_FROM_BOTTOM: 15, // points
  FONT_SIZE: 10,
  FORMAT: 'detailed' as const, // 'simple' | 'detailed'
  INCLUDE_FIRST_PAGE: true
} as const;

// 텍스트 분배 설정
export const TEXT_DISTRIBUTION_CONFIG = {
  PRESERVE_SENTENCES: true,
  PRESERVE_PARAGRAPHS: true,
  MIN_LINES_PER_PAGE: 5,
  SENTENCE_BREAK_PENALTY: 100, // 문장 분리 비용
  PARAGRAPH_BREAK_PENALTY: 200, // 단락 분리 비용
  MIN_CHARS_PER_LINE: 10,
  MAX_CHARS_PER_LINE: 120
} as const;