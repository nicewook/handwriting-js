// 멀티페이지 PDF 생성을 위한 타입 정의

import { FontMetadata, FontSize } from '../fonts';

// 페이지 제한 설정
export interface PageLimitConfig {
  min: number;
  max: number;
  default: number;
  step: number;
}

// 페이지 내용
export interface PageContent {
  pageNumber: number;
  textLines: string[];
  lineCount: number;
  characterCount: number;
}

// 텍스트 분배 결과
export interface TextDistributionResult {
  pages: PageContent[];
  totalPages: number;
  truncatedContent: boolean;
  distributionStats: {
    totalCharacters: number;
    averageCharsPerPage: number;
    linesPerPage: number;
  };
}

// 텍스트 분배 설정
export interface TextDistributionSettings {
  preserveSentences: boolean;
  preserveParagraphs: boolean;
  minLinesPerPage: number;
  maxLinesPerPage: number;
  sentenceBreakPenalty: number;
  paragraphBreakPenalty: number;
}

// 페이지 레이아웃 설정
export interface MultiPageLayoutConfig {
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-center';
  pageNumberMargin: number;
  pageNumberFontSize: number;
  firstPageNumbered: boolean;
}

// 멀티페이지 PDF 옵션
export interface MultiPagePDFOptions {
  font: FontMetadata;
  fontSize: FontSize;
  customTexts?: string[];
  pageLimit: number;
  includePageNumbers: boolean;
  pageNumberFormat: 'simple' | 'detailed'; // "1" vs "Page 1 of 10"
}

// 페이지 수 추정 결과
export interface PageEstimate {
  estimatedPages: number;
  exceedsLimit: boolean;
  totalCharacters: number;
  averageCharsPerPage: number;
  confidence: 'high' | 'medium' | 'low'; // 추정 신뢰도
}

// 향상된 PDF 생성 결과
export interface EnhancedPDFGenerationResult {
  success: boolean;
  data?: string; // Base64 인코딩된 PDF 데이터
  error?: string;
  filename?: string;
  contentType?: string;
  // 멀티페이지 관련 필드
  pageCount?: number;
  truncatedContent?: boolean;
  generationStats?: {
    totalPages: number;
    totalCharacters: number;
    averageCharsPerPage: number;
    generationTimeMs: number;
  };
}

// 멀티페이지 PDF 오류 타입
export enum MultiPagePDFError {
  CONTENT_TOO_LARGE = 'CONTENT_TOO_LARGE',
  PAGE_LIMIT_EXCEEDED = 'PAGE_LIMIT_EXCEEDED',
  TEXT_DISTRIBUTION_FAILED = 'TEXT_DISTRIBUTION_FAILED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  GENERATION_TIMEOUT = 'GENERATION_TIMEOUT',
  INVALID_PAGE_LIMIT = 'INVALID_PAGE_LIMIT'
}

// 멀티페이지 PDF 오류 정보
export interface MultiPagePDFErrorInfo {
  type: MultiPagePDFError;
  message: string;
  details?: Record<string, any>;
  suggestedAction?: string;
}

// 진행 상황 정보
export interface GenerationProgress {
  stage: 'preparing' | 'distributing' | 'generating' | 'finalizing';
  currentPage: number;
  totalPages: number;
  percentage: number;
  message: string;
}

// 텍스트 측정 결과
export interface TextMeasurement {
  width: number;
  height: number;
  lineCount: number;
  characterCount: number;
  wordCount: number;
}

// 페이지 용량 정보
export interface PageCapacity {
  maxLines: number;
  maxCharacters: number;
  availableWidth: number;
  availableHeight: number;
  lineHeight: number;
}