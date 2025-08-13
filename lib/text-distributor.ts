import { 
  TextDistributionResult, 
  PageContent, 
  TextDistributionSettings, 
  TextMeasurement, 
  PageCapacity,
  MultiPagePDFError 
} from './types/multi-page-pdf';
import { FontMetadata, FontSize } from './fonts';
import { TEXT_DISTRIBUTION_CONFIG, FONT_SIZE_MAPPINGS } from './constants';
// Performance monitoring은 클라이언트 사이드에서 간단하게 구현
class SimplePerformanceMonitor {
  private startTime: number;
  private checkpoints: Array<{ name: string; time: number }> = [];
  
  constructor() {
    this.startTime = Date.now();
    this.addCheckpoint('start');
  }
  
  addCheckpoint(name: string): void {
    const currentTime = Date.now();
    this.checkpoints.push({ name, time: currentTime });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 체크포인트 [${name}]: ${currentTime - this.startTime}ms`);
    }
  }
  
  logReport(): void {
    if (process.env.NODE_ENV === 'development') {
      const totalTime = Date.now() - this.startTime;
      console.log(`\n📈 성능 리포트: 총 ${totalTime}ms`);
      this.checkpoints.forEach(cp => {
        console.log(`  ${cp.name}: ${cp.time - this.startTime}ms`);
      });
    }
  }
}

/**
 * TextDistributor 클래스
 * 텍스트를 여러 페이지에 지능적으로 분배하는 역할을 담당
 */
export class TextDistributor {
  private settings: TextDistributionSettings;
  private font: FontMetadata;
  private fontSize: FontSize;
  private pageCapacity: PageCapacity;
  
  // 성능 최적화를 위한 캐시
  private fontMetricsCache: Map<string, number> = new Map();
  private textMeasurementCache: Map<string, TextMeasurement> = new Map();
  private sentenceSplitCache: Map<string, string[]> = new Map();

  constructor(
    font: FontMetadata,
    fontSize: FontSize,
    customSettings?: Partial<TextDistributionSettings>
  ) {
    this.font = font;
    this.fontSize = fontSize;
    
    // 기본 설정과 사용자 설정 병합
    this.settings = {
      preserveSentences: TEXT_DISTRIBUTION_CONFIG.PRESERVE_SENTENCES,
      preserveParagraphs: TEXT_DISTRIBUTION_CONFIG.PRESERVE_PARAGRAPHS,
      minLinesPerPage: TEXT_DISTRIBUTION_CONFIG.MIN_LINES_PER_PAGE,
      maxLinesPerPage: this.calculateMaxLinesPerPage(),
      sentenceBreakPenalty: TEXT_DISTRIBUTION_CONFIG.SENTENCE_BREAK_PENALTY,
      paragraphBreakPenalty: TEXT_DISTRIBUTION_CONFIG.PARAGRAPH_BREAK_PENALTY,
      ...customSettings
    };

    this.pageCapacity = this.calculatePageCapacity();
  }

  /**
   * 텍스트를 여러 페이지에 분배 (성능 최적화 버전)
   */
  public distributeText(
    texts: string[], 
    pageLimit: number
  ): TextDistributionResult {
    const monitor = new SimplePerformanceMonitor();
    
    try {
      // 입력 텍스트 전처리
      const processedText = this.preprocessTextOptimized(texts);
      monitor.addCheckpoint('preprocessing');
      
      // 문장 단위로 분할 (캐시 사용)
      const sentences = this.splitIntoSentencesOptimized(processedText);
      monitor.addCheckpoint('sentence-splitting');
      
      // 페이지별로 텍스트 분배 (최적화된 알고리즘)
      const pages = this.distributeToPages(sentences, pageLimit);
      monitor.addCheckpoint('page-distribution');
      
      // 통계 계산
      const stats = this.calculateDistributionStats(pages);
      monitor.addCheckpoint('stats-calculation');
      
      // 성능 리포트 로깅 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        monitor.logReport();
      }
      
      // 캐시 정리
      this.cleanupCaches();
      
      return {
        pages,
        totalPages: pages.length,
        truncatedContent: pages.length >= pageLimit && sentences.length > this.getTotalSentenceCount(pages),
        distributionStats: stats
      };
    } catch (error) {
      monitor.addCheckpoint('error');
      throw new Error(`Text distribution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 페이지 수 추정
   */
  public estimatePageCount(texts: string[]): number {
    const processedText = this.preprocessText(texts);
    const totalCharacters = processedText.length;
    const estimatedPages = Math.ceil(totalCharacters / this.pageCapacity.maxCharacters);
    
    // 최소 1페이지는 보장
    return Math.max(1, estimatedPages);
  }

  /**
   * 텍스트 측정
   */
  public measureText(text: string): TextMeasurement {
    const lines = text.split('\n');
    const characterCount = text.length;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      width: this.estimateTextWidth(text),
      height: lines.length * this.pageCapacity.lineHeight,
      lineCount: lines.length,
      characterCount,
      wordCount
    };
  }

  /**
   * 텍스트 전처리 (최적화 버전)
   */
  private preprocessTextOptimized(texts: string[]): string {
    // 빈 텍스트 필터링
    const nonEmptyTexts = texts.filter(text => text && text.trim().length > 0);
    
    if (nonEmptyTexts.length === 0) {
      return '';
    }
    
    // 단일 텍스트인 경우 최적화
    if (nonEmptyTexts.length === 1) {
      return nonEmptyTexts[0].replace(/\s+/g, ' ').trim();
    }
    
    // 여러 텍스트를 효율적으로 결합
    return nonEmptyTexts
      .join(' ')
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .trim();
  }
  
  /**
   * 텍스트 전처리 (기존 호환성)
   */
  private preprocessText(texts: string[]): string {
    return this.preprocessTextOptimized(texts);
  }

  /**
   * 문장 단위로 분할 (캐시 사용 최적화 버전)
   */
  private splitIntoSentencesOptimized(text: string): string[] {
    // 캐시 확인
    const cacheKey = text.length > 1000 ? 
      text.substring(0, 500) + '...' + text.substring(text.length - 500) : 
      text;
    
    if (this.sentenceSplitCache.has(cacheKey)) {
      return this.sentenceSplitCache.get(cacheKey)!;
    }
    
    // 빈 텍스트 처리
    if (!text || text.trim().length === 0) {
      return [];
    }
    
    // 문장 끝 패턴 (마침표, 느낌표, 물음표 + 공백 또는 끝)
    const sentencePattern = /[.!?]+(?:\s+|$)/g;
    const sentences: string[] = [];
    let lastIndex = 0;
    let match;

    // 정규식 실행 최적화
    while ((match = sentencePattern.exec(text)) !== null) {
      const sentence = text.slice(lastIndex, match.index + match[0].length).trim();
      if (sentence.length > 0) {
        sentences.push(sentence);
      }
      lastIndex = match.index + match[0].length;
      
      // 너무 많은 문장이 있으면 중단 (메모리 보호)
      if (sentences.length > 10000) {
        console.warn('⚠️ 문장 수가 너무 많습니다. 처리를 중단합니다.');
        break;
      }
    }

    // 마지막 부분 처리
    if (lastIndex < text.length) {
      const lastSentence = text.slice(lastIndex).trim();
      if (lastSentence.length > 0) {
        sentences.push(lastSentence);
      }
    }

    const result = sentences.filter(sentence => sentence.length > 0);
    
    // 결과 캐시 저장 (메모리 제한)
    if (this.sentenceSplitCache.size < 100) {
      this.sentenceSplitCache.set(cacheKey, result);
    }
    
    return result;
  }
  
  /**
   * 문장 단위로 분할 (기존 호환성)
   */
  private splitIntoSentences(text: string): string[] {
    return this.splitIntoSentencesOptimized(text);
  }

  /**
   * 페이지별로 텍스트 분배
   */
  private distributeToPages(sentences: string[], pageLimit: number): PageContent[] {
    const pages: PageContent[] = [];
    let currentPage: PageContent = this.createEmptyPage(1);
    let sentenceIndex = 0;

    while (sentenceIndex < sentences.length && pages.length < pageLimit) {
      const sentence = sentences[sentenceIndex];
      
      // 현재 페이지에 문장을 추가할 수 있는지 확인
      if (this.canAddSentenceToPage(currentPage, sentence)) {
        this.addSentenceToPage(currentPage, sentence);
        sentenceIndex++;
      } else {
        // 현재 페이지가 비어있지 않으면 페이지 완료
        if (currentPage.textLines.length > 0) {
          pages.push(currentPage);
          currentPage = this.createEmptyPage(pages.length + 1);
        } else {
          // 페이지가 비어있는데 문장을 추가할 수 없다면 문장을 강제로 분할
          const splitSentence = this.forceSplitSentence(sentence, this.pageCapacity.maxCharacters);
          this.addSentenceToPage(currentPage, splitSentence[0]);
          
          // 나머지 부분을 다음 문장으로 처리
          if (splitSentence[1]) {
            sentences[sentenceIndex] = splitSentence[1];
          } else {
            sentenceIndex++;
          }
          
          pages.push(currentPage);
          currentPage = this.createEmptyPage(pages.length + 1);
        }
      }
    }

    // 마지막 페이지 추가
    if (currentPage.textLines.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  /**
   * 빈 페이지 생성
   */
  private createEmptyPage(pageNumber: number): PageContent {
    return {
      pageNumber,
      textLines: [],
      lineCount: 0,
      characterCount: 0
    };
  }

  /**
   * 페이지에 문장을 추가할 수 있는지 확인
   */
  private canAddSentenceToPage(page: PageContent, sentence: string): boolean {
    const estimatedLines = this.estimateRequiredLines(sentence);
    const newLineCount = page.lineCount + estimatedLines;
    const newCharCount = page.characterCount + sentence.length;

    return (
      newLineCount <= this.settings.maxLinesPerPage &&
      newCharCount <= this.pageCapacity.maxCharacters
    );
  }

  /**
   * 페이지에 문장 추가
   */
  private addSentenceToPage(page: PageContent, sentence: string): void {
    // 문장을 라인에 맞게 분할
    const lines = this.wrapTextToLines(sentence);
    
    page.textLines.push(...lines);
    page.lineCount += lines.length;
    page.characterCount += sentence.length;
  }

  /**
   * 문장을 강제로 분할
   */
  private forceSplitSentence(sentence: string, maxChars: number): [string, string | null] {
    if (sentence.length <= maxChars) {
      return [sentence, null];
    }

    // 단어 경계에서 분할 시도
    const words = sentence.split(' ');
    let firstPart = '';
    let remainingWords = [...words];

    for (let i = 0; i < words.length; i++) {
      const testPart = words.slice(0, i + 1).join(' ');
      if (testPart.length <= maxChars) {
        firstPart = testPart;
        remainingWords = words.slice(i + 1);
      } else {
        break;
      }
    }

    if (firstPart.length === 0) {
      // 단어 하나도 들어가지 않으면 문자 단위로 분할
      firstPart = sentence.slice(0, maxChars);
      return [firstPart, sentence.slice(maxChars)];
    }

    const secondPart = remainingWords.length > 0 ? remainingWords.join(' ') : null;
    return [firstPart, secondPart];
  }

  /**
   * 텍스트를 라인에 맞게 분할
   */
  private wrapTextToLines(text: string): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (this.estimateTextWidth(testLine) <= this.pageCapacity.availableWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // 단어가 너무 길면 강제로 분할
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 필요한 라인 수 추정
   */
  private estimateRequiredLines(text: string): number {
    const lines = this.wrapTextToLines(text);
    return lines.length;
  }

  /**
   * 텍스트 너비 추정 (캐시 사용 최적화)
   */
  private estimateTextWidth(text: string): number {
    // 캐시 키 생성 (텍스트 길이와 폰트 크기 기반)
    const cacheKey = `${text.length}_${this.fontSize.size}`;
    
    if (this.fontMetricsCache.has(cacheKey)) {
      return this.fontMetricsCache.get(cacheKey)!;
    }
    
    // 간단한 추정: 문자당 평균 너비 (모노스페이스 폰트 기준)
    const avgCharWidth = this.fontSize.size * 0.6; // 대략적인 비율
    const width = text.length * avgCharWidth;
    
    // 캐시 저장 (메모리 제한)
    if (this.fontMetricsCache.size < 1000) {
      this.fontMetricsCache.set(cacheKey, width);
    }
    
    return width;
  }

  /**
   * 페이지당 최대 라인 수 계산
   */
  private calculateMaxLinesPerPage(): number {
    const sizeConfig = FONT_SIZE_MAPPINGS[this.fontSize.id as keyof typeof FONT_SIZE_MAPPINGS] 
      || FONT_SIZE_MAPPINGS.medium;
    return sizeConfig.totalLines;
  }

  /**
   * 페이지 용량 계산
   */
  private calculatePageCapacity(): PageCapacity {
    const sizeConfig = FONT_SIZE_MAPPINGS[this.fontSize.id as keyof typeof FONT_SIZE_MAPPINGS] 
      || FONT_SIZE_MAPPINGS.medium;
    
    const maxLines = sizeConfig.totalLines;
    const lineHeight = sizeConfig.lineSpacing;
    const avgCharsPerLine = TEXT_DISTRIBUTION_CONFIG.MAX_CHARS_PER_LINE;
    const maxCharacters = maxLines * avgCharsPerLine;

    return {
      maxLines,
      maxCharacters,
      availableWidth: 500, // 대략적인 사용 가능 너비 (points)
      availableHeight: maxLines * lineHeight,
      lineHeight
    };
  }

  /**
   * 분배 통계 계산
   */
  private calculateDistributionStats(pages: PageContent[]) {
    const totalCharacters = pages.reduce((sum, page) => sum + page.characterCount, 0);
    const totalLines = pages.reduce((sum, page) => sum + page.lineCount, 0);
    const averageCharsPerPage = pages.length > 0 ? totalCharacters / pages.length : 0;
    const linesPerPage = pages.length > 0 ? totalLines / pages.length : 0;

    return {
      totalCharacters,
      averageCharsPerPage: Math.round(averageCharsPerPage),
      linesPerPage: Math.round(linesPerPage)
    };
  }

  /**
   * 총 문장 수 계산
   */
  private getTotalSentenceCount(pages: PageContent[]): number {
    return pages.reduce((sum, page) => {
      // 각 페이지의 텍스트를 합쳐서 문장 수 계산
      const pageText = page.textLines.join(' ');
      const sentences = this.splitIntoSentences(pageText);
      return sum + sentences.length;
    }, 0);
  }
  
  /**
   * 캐시 정리 (메모리 최적화)
   */
  private cleanupCaches(): void {
    // 캐시 크기 제한
    if (this.fontMetricsCache.size > 500) {
      this.fontMetricsCache.clear();
    }
    
    if (this.textMeasurementCache.size > 100) {
      this.textMeasurementCache.clear();
    }
    
    if (this.sentenceSplitCache.size > 50) {
      this.sentenceSplitCache.clear();
    }
  }
  
  /**
   * 전체 캐시 초기화
   */
  public clearAllCaches(): void {
    this.fontMetricsCache.clear();
    this.textMeasurementCache.clear();
    this.sentenceSplitCache.clear();
    console.log('🧹 TextDistributor 캐시 정리 완료');
  }
  
  /**
   * 캐시 통계 정보
   */
  public getCacheStats(): {
    fontMetrics: number;
    textMeasurement: number;
    sentenceSplit: number;
    totalMemoryEstimate: number;
  } {
    const fontMetricsSize = this.fontMetricsCache.size;
    const textMeasurementSize = this.textMeasurementCache.size;
    const sentenceSplitSize = this.sentenceSplitCache.size;
    
    // 대략적인 메모리 사용량 추정 (바이트)
    const totalMemoryEstimate = 
      (fontMetricsSize * 50) + // 각 항목당 약 50바이트
      (textMeasurementSize * 200) + // 각 항목당 약 200바이트
      (sentenceSplitSize * 1000); // 각 항목당 약 1KB
    
    return {
      fontMetrics: fontMetricsSize,
      textMeasurement: textMeasurementSize,
      sentenceSplit: sentenceSplitSize,
      totalMemoryEstimate
    };
  }
}