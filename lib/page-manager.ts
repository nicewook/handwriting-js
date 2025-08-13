import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { 
  MultiPageLayoutConfig, 
  PageContent, 
  MultiPagePDFError 
} from './types/multi-page-pdf';
import { FontMetadata, FontSize } from './fonts';
import { 
  PAGE_NUMBER_CONFIG, 
  MULTI_PAGE_CONFIG, 
  GUIDELINE_STYLES, 
  PAGE_LAYOUT,
  FONT_SIZE_MAPPINGS 
} from './constants';

/**
 * PageManager 클래스
 * PDF 페이지 레이아웃, 페이지 번호, 페이지 제한 관리를 담당
 */
export class PageManager {
  private layoutConfig: MultiPageLayoutConfig;
  private font: FontMetadata;
  private fontSize: FontSize;
  private pageLimit: number;

  constructor(
    font: FontMetadata,
    fontSize: FontSize,
    pageLimit: number,
    customLayoutConfig?: Partial<MultiPageLayoutConfig>
  ) {
    this.font = font;
    this.fontSize = fontSize;
    this.pageLimit = this.validatePageLimit(pageLimit);
    
    // 기본 레이아웃 설정과 사용자 설정 병합
    this.layoutConfig = {
      pageNumberPosition: PAGE_NUMBER_CONFIG.POSITION,
      pageNumberMargin: PAGE_NUMBER_CONFIG.MARGIN_FROM_BOTTOM,
      pageNumberFontSize: PAGE_NUMBER_CONFIG.FONT_SIZE,
      firstPageNumbered: PAGE_NUMBER_CONFIG.INCLUDE_FIRST_PAGE,
      ...customLayoutConfig
    };
  }

  /**
   * PDF 문서에 페이지들을 생성하고 관리
   */
  public async createPages(
    doc: PDFDocument,
    pageContents: PageContent[],
    customFont: any // pdf-lib의 PDFFont 타입
  ): Promise<PDFPage[]> {
    const pages: PDFPage[] = [];
    const totalPages = Math.min(pageContents.length, this.pageLimit);

    for (let i = 0; i < totalPages; i++) {
      const pageContent = pageContents[i];
      const page = this.createSinglePage(doc, pageContent, totalPages, customFont);
      pages.push(page);
    }

    return pages;
  }

  /**
   * 단일 페이지 생성
   */
  private createSinglePage(
    doc: PDFDocument,
    pageContent: PageContent,
    totalPages: number,
    customFont: any
  ): PDFPage {
    const page = doc.addPage();
    const { width, height } = page.getSize();

    // 4-Zone 가이드라인 그리기
    this.drawPageGuidelines(page, pageContent, width, height);

    // 텍스트 렌더링
    this.renderPageText(page, pageContent, customFont, width, height);

    // 페이지 번호 추가
    if (this.shouldAddPageNumber(pageContent.pageNumber)) {
      this.addPageNumber(page, pageContent.pageNumber, totalPages, width, height);
    }

    return page;
  }

  /**
   * 페이지에 4-Zone 가이드라인 그리기
   */
  private drawPageGuidelines(
    page: PDFPage,
    pageContent: PageContent,
    pageWidth: number,
    pageHeight: number
  ): void {
    const sizeConfig = FONT_SIZE_MAPPINGS[this.fontSize.id as keyof typeof FONT_SIZE_MAPPINGS] 
      || FONT_SIZE_MAPPINGS.medium;
    
    const lineSpacing = sizeConfig.lineSpacing / 4;
    const totalLines = sizeConfig.totalLines;

    // 각 텍스트 라인에 대해 가이드라인 그리기
    for (let i = 0; i < Math.min(pageContent.lineCount, totalLines); i++) {
      this.drawSingleLineGuidelines(
        page,
        i,
        totalLines,
        lineSpacing,
        pageWidth,
        pageHeight
      );
    }

    // 빈 라인들에 대해서도 가이드라인 그리기 (연습용)
    for (let i = pageContent.lineCount; i < totalLines; i++) {
      this.drawSingleLineGuidelines(
        page,
        i,
        totalLines,
        lineSpacing,
        pageWidth,
        pageHeight
      );
    }
  }

  /**
   * 단일 라인의 4-Zone 가이드라인 그리기
   */
  private drawSingleLineGuidelines(
    page: PDFPage,
    lineIndex: number,
    totalLines: number,
    lineSpacing: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    // 페이지 내 라인 위치 계산
    const drawableHeight = pageHeight - PAGE_LAYOUT.TOP_MARGIN - PAGE_LAYOUT.BOTTOM_MARGIN;
    const slotHeight = drawableHeight / totalLines;
    
    const slotTopY = pageHeight - PAGE_LAYOUT.TOP_MARGIN - (lineIndex * slotHeight);
    const groupCenterY = slotTopY - slotHeight * 0.3;
    
    // 5개 가이드라인 Y 좌표 계산
    const descenderLineY = groupCenterY - (2 * lineSpacing);
    const baselineY = groupCenterY - lineSpacing;
    const xHeightMidY = groupCenterY;
    const xHeightTopY = groupCenterY + lineSpacing;
    const ascenderLineY = groupCenterY + (2 * lineSpacing);
    
    const lineStartX = PAGE_LAYOUT.LEFT_MARGIN;
    const lineEndX = pageWidth - PAGE_LAYOUT.RIGHT_MARGIN;
    
    // 1. 상단선 (Ascender line)
    page.drawLine({
      start: { x: lineStartX, y: ascenderLineY },
      end: { x: lineEndX, y: ascenderLineY },
      color: rgb(
        GUIDELINE_STYLES.ascender.color.r,
        GUIDELINE_STYLES.ascender.color.g,
        GUIDELINE_STYLES.ascender.color.b
      ),
      thickness: GUIDELINE_STYLES.ascender.thickness
    });
    
    // 2. 중간선 상단 (X-height top)
    page.drawLine({
      start: { x: lineStartX, y: xHeightTopY },
      end: { x: lineEndX, y: xHeightTopY },
      color: rgb(
        GUIDELINE_STYLES.xheight_area.color.r,
        GUIDELINE_STYLES.xheight_area.color.g,
        GUIDELINE_STYLES.xheight_area.color.b
      ),
      thickness: GUIDELINE_STYLES.xheight_area.thickness
    });
    
    // 3. 중간선 가운데 (X-height middle) - 점선
    page.drawLine({
      start: { x: lineStartX, y: xHeightMidY },
      end: { x: lineEndX, y: xHeightMidY },
      color: rgb(
        GUIDELINE_STYLES.xheight_mid.color.r,
        GUIDELINE_STYLES.xheight_mid.color.g,
        GUIDELINE_STYLES.xheight_mid.color.b
      ),
      thickness: GUIDELINE_STYLES.xheight_mid.thickness,
      dashArray: [...GUIDELINE_STYLES.xheight_mid.dashArray]
    });
    
    // 4. 중간선 하단 (Baseline)
    page.drawLine({
      start: { x: lineStartX, y: baselineY },
      end: { x: lineEndX, y: baselineY },
      color: rgb(
        GUIDELINE_STYLES.xheight_area.color.r,
        GUIDELINE_STYLES.xheight_area.color.g,
        GUIDELINE_STYLES.xheight_area.color.b
      ),
      thickness: GUIDELINE_STYLES.xheight_area.thickness
    });
    
    // 5. 하단선 (Descender line)
    page.drawLine({
      start: { x: lineStartX, y: descenderLineY },
      end: { x: lineEndX, y: descenderLineY },
      color: rgb(
        GUIDELINE_STYLES.descender.color.r,
        GUIDELINE_STYLES.descender.color.g,
        GUIDELINE_STYLES.descender.color.b
      ),
      thickness: GUIDELINE_STYLES.descender.thickness
    });
    
    // 소문자 영역 사각형 테두리 (좌우 세로선)
    page.drawLine({
      start: { x: lineStartX, y: xHeightTopY },
      end: { x: lineStartX, y: baselineY },
      color: rgb(
        GUIDELINE_STYLES.xheight_area.color.r,
        GUIDELINE_STYLES.xheight_area.color.g,
        GUIDELINE_STYLES.xheight_area.color.b
      ),
      thickness: GUIDELINE_STYLES.xheight_area.thickness
    });
    
    page.drawLine({
      start: { x: lineEndX, y: xHeightTopY },
      end: { x: lineEndX, y: baselineY },
      color: rgb(
        GUIDELINE_STYLES.xheight_area.color.r,
        GUIDELINE_STYLES.xheight_area.color.g,
        GUIDELINE_STYLES.xheight_area.color.b
      ),
      thickness: GUIDELINE_STYLES.xheight_area.thickness
    });
  }

  /**
   * 페이지에 텍스트 렌더링
   */
  private renderPageText(
    page: PDFPage,
    pageContent: PageContent,
    customFont: any,
    pageWidth: number,
    pageHeight: number
  ): void {
    const sizeConfig = FONT_SIZE_MAPPINGS[this.fontSize.id as keyof typeof FONT_SIZE_MAPPINGS] 
      || FONT_SIZE_MAPPINGS.medium;
    
    const lineSpacing = sizeConfig.lineSpacing / 4;
    const totalLines = sizeConfig.totalLines;
    const drawableHeight = pageHeight - PAGE_LAYOUT.TOP_MARGIN - PAGE_LAYOUT.BOTTOM_MARGIN;
    const slotHeight = drawableHeight / totalLines;

    // 계산된 폰트 크기 (간단한 추정)
    const calculatedFontSize = this.fontSize.size * 0.8; // 대략적인 조정

    // 각 텍스트 라인 렌더링 (짝수 라인에만 예시 텍스트)
    for (let i = 0; i < Math.min(pageContent.textLines.length, totalLines); i += 2) {
      const textLine = pageContent.textLines[Math.floor(i / 2)];
      if (!textLine) continue;

      const slotTopY = pageHeight - PAGE_LAYOUT.TOP_MARGIN - (i * slotHeight);
      const groupCenterY = slotTopY - slotHeight * 0.3;
      const baselineY = groupCenterY - lineSpacing;

      try {
        page.drawText(textLine, {
          x: PAGE_LAYOUT.LEFT_MARGIN + GUIDELINE_STYLES.text.leftMargin,
          y: baselineY,
          font: customFont,
          size: calculatedFontSize,
          color: rgb(
            GUIDELINE_STYLES.text.color.r,
            GUIDELINE_STYLES.text.color.g,
            GUIDELINE_STYLES.text.color.b
          )
        });
      } catch (textError) {
        console.warn(`⚠️ 텍스트 렌더링 실패 (페이지 ${pageContent.pageNumber}, 라인 ${i}):`, textError);
        
        // 폴백 텍스트
        try {
          page.drawText("Handwriting practice line", {
            x: PAGE_LAYOUT.LEFT_MARGIN + GUIDELINE_STYLES.text.leftMargin,
            y: baselineY,
            font: customFont,
            size: calculatedFontSize,
            color: rgb(0.7, 0.7, 0.7)
          });
        } catch (fallbackError) {
          console.error(`❌ 폴백 텍스트 렌더링도 실패:`, fallbackError);
        }
      }
    }
  }

  /**
   * 페이지 번호 추가
   */
  private addPageNumber(
    page: PDFPage,
    currentPage: number,
    totalPages: number,
    pageWidth: number,
    pageHeight: number
  ): void {
    const pageNumberText = this.formatPageNumber(currentPage, totalPages);
    const fontSize = this.layoutConfig.pageNumberFontSize;
    
    // 페이지 번호 위치 계산
    const position = this.calculatePageNumberPosition(
      pageWidth,
      pageHeight,
      pageNumberText,
      fontSize
    );

    try {
      page.drawText(pageNumberText, {
        x: position.x,
        y: position.y,
        size: fontSize,
        color: rgb(0.4, 0.4, 0.4) // 회색
      });
    } catch (error) {
      console.warn(`⚠️ 페이지 번호 렌더링 실패 (페이지 ${currentPage}):`, error);
    }
  }

  /**
   * 페이지 번호 포맷팅
   */
  private formatPageNumber(currentPage: number, totalPages: number): string {
    if (PAGE_NUMBER_CONFIG.FORMAT === 'detailed') {
      return `Page ${currentPage} of ${totalPages}`;
    } else {
      return currentPage.toString();
    }
  }

  /**
   * 페이지 번호 위치 계산
   */
  private calculatePageNumberPosition(
    pageWidth: number,
    pageHeight: number,
    text: string,
    fontSize: number
  ): { x: number; y: number } {
    const textWidth = text.length * fontSize * 0.6; // 대략적인 텍스트 너비
    
    switch (this.layoutConfig.pageNumberPosition) {
      case 'bottom-center':
        return {
          x: (pageWidth - textWidth) / 2,
          y: this.layoutConfig.pageNumberMargin
        };
      case 'bottom-right':
        return {
          x: pageWidth - textWidth - PAGE_LAYOUT.RIGHT_MARGIN,
          y: this.layoutConfig.pageNumberMargin
        };
      case 'top-center':
        return {
          x: (pageWidth - textWidth) / 2,
          y: pageHeight - this.layoutConfig.pageNumberMargin - fontSize
        };
      default:
        return {
          x: (pageWidth - textWidth) / 2,
          y: this.layoutConfig.pageNumberMargin
        };
    }
  }

  /**
   * 페이지 번호를 추가해야 하는지 확인
   */
  private shouldAddPageNumber(pageNumber: number): boolean {
    if (!this.layoutConfig.firstPageNumbered && pageNumber === 1) {
      return false;
    }
    return true;
  }

  /**
   * 페이지 제한 검증
   */
  private validatePageLimit(pageLimit: number): number {
    if (pageLimit < MULTI_PAGE_CONFIG.MIN_PAGES) {
      console.warn(`페이지 제한이 최소값보다 작습니다. ${MULTI_PAGE_CONFIG.MIN_PAGES}로 설정합니다.`);
      return MULTI_PAGE_CONFIG.MIN_PAGES;
    }
    
    if (pageLimit > MULTI_PAGE_CONFIG.MAX_PAGES) {
      console.warn(`페이지 제한이 최대값보다 큽니다. ${MULTI_PAGE_CONFIG.MAX_PAGES}로 설정합니다.`);
      return MULTI_PAGE_CONFIG.MAX_PAGES;
    }
    
    return pageLimit;
  }

  /**
   * 페이지 제한 강제 적용
   */
  public enforcePageLimit(pageContents: PageContent[]): PageContent[] {
    if (pageContents.length <= this.pageLimit) {
      return pageContents;
    }

    console.warn(`페이지 수가 제한을 초과합니다. ${pageContents.length} -> ${this.pageLimit}`);
    return pageContents.slice(0, this.pageLimit);
  }

  /**
   * 페이지 레이아웃 정보 반환
   */
  public getLayoutInfo() {
    const sizeConfig = FONT_SIZE_MAPPINGS[this.fontSize.id as keyof typeof FONT_SIZE_MAPPINGS] 
      || FONT_SIZE_MAPPINGS.medium;

    return {
      pageLimit: this.pageLimit,
      maxLinesPerPage: sizeConfig.totalLines,
      lineSpacing: sizeConfig.lineSpacing,
      layoutConfig: this.layoutConfig,
      font: this.font,
      fontSize: this.fontSize
    };
  }
}