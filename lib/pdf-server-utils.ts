/**
 * 서버 사이드 전용 PDF 유틸리티
 * Node.js 환경에서만 사용 가능한 함수들
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import opentype from 'opentype.js';
import { FontMetadata, FontSize } from './fonts';
import { FONT_SIZE_MAPPINGS } from './constants';

export interface FontMetrics {
  upem: number;
  xHeight: number;
  calculatedFontSize: number;
  lineSpacing: number;
}

// 폰트 파일 로딩 및 메트릭 추출 (assets/ 디렉토리 사용)
export async function loadFontMetrics(fontPath: string): Promise<FontMetrics> {
  console.log(`🔍 [loadFontMetrics] 시작: ${fontPath}`);
  
  try {
    // 단순화된 경로 전략 - assets 디렉토리에서 로딩
    const resolvedPath = join(process.cwd(), fontPath);
    console.log(`📄 [loadFontMetrics] 파일 경로: ${resolvedPath}`);
    
    const fontBuffer = await readFile(resolvedPath);
    console.log(`✅ [loadFontMetrics] 파일 발견: ${resolvedPath} (크기: ${fontBuffer.length} bytes)`);

    if (!fontBuffer || fontBuffer.length === 0) {
      throw new Error(`Font file is empty: ${fontPath}`);
    }

    // 다중 파싱 전략으로 OpenType 파싱 시도
    const parseStrategies = [
      () => opentype.parse(fontBuffer!.buffer),
      () => opentype.parse(fontBuffer!.buffer.slice(fontBuffer!.byteOffset, fontBuffer!.byteOffset + fontBuffer!.byteLength)),
      () => opentype.parse(new Uint8Array(fontBuffer!).buffer)
    ];

    let font: opentype.Font | null = null;
    for (let i = 0; i < parseStrategies.length; i++) {
      try {
        font = parseStrategies[i]();
        console.log(`✅ 폰트 파싱 성공 (방법 ${i + 1})`);
        break;
      } catch (parseError) {
        console.warn(`⚠️ 파싱 방법 ${i + 1} 실패:`, parseError);
        continue;
      }
    }

    if (!font) {
      throw new Error(`Failed to parse font file: ${fontPath}`);
    }
    
    const upem = font.unitsPerEm;
    const xHeight = font.tables.os2?.sxHeight || upem * 0.5; // fallback
    
    if (!upem || upem <= 0) {
      throw new Error(`Invalid unitsPerEm: ${upem}`);
    }
    
    if (!xHeight || xHeight <= 0) {
      throw new Error(`Invalid xHeight: ${xHeight}`);
    }

    console.log(`📊 폰트 메트릭: upem=${upem}, xHeight=${xHeight}`);
    
    return {
      upem,
      xHeight,
      calculatedFontSize: 0, // 후에 계산됨
      lineSpacing: 0         // 후에 계산됨
    };
  } catch (error) {
    console.error('Font loading error:', error);
    throw new Error(`Failed to load font: ${fontPath} - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// 폰트 파일 유효성 검증 (assets 디렉토리 사용)
export async function validateFontFile(fontPath: string): Promise<boolean> {
  console.log(`🔍 [validateFontFile] 시작: ${fontPath}`);
  
  try {
    // 단순화된 경로 - assets 디렉토리에서 로딩
    const resolvedPath = join(process.cwd(), fontPath);
    console.log(`📄 [validateFontFile] 파일 경로: ${resolvedPath}`);
    
    const fontBuffer = await readFile(resolvedPath);
    console.log(`✅ [validateFontFile] 파일 발견: ${resolvedPath} (크기: ${fontBuffer.length} bytes)`);

    if (!fontBuffer || fontBuffer.length === 0) {
      console.warn(`⚠️ [validateFontFile] 폰트 파일이 비어있음: ${fontPath}`);
      return false;
    }

    console.log(`🔄 [validateFontFile] OpenType 파싱 시작...`);

    // 다중 파싱 전략으로 OpenType 파싱 시도
    const parseStrategies = [
      () => opentype.parse(fontBuffer!.buffer),
      () => opentype.parse(fontBuffer!.buffer.slice(fontBuffer!.byteOffset, fontBuffer!.byteOffset + fontBuffer!.byteLength)),
      () => opentype.parse(new Uint8Array(fontBuffer!).buffer)
    ];

    let font: opentype.Font | null = null;
    for (let i = 0; i < parseStrategies.length; i++) {
      console.log(`🔄 [validateFontFile] 파싱 방법 ${i + 1} 시도...`);
      try {
        font = parseStrategies[i]();
        console.log(`✅ [validateFontFile] 파싱 성공 (방법 ${i + 1})`);
        break;
      } catch (parseError) {
        console.log(`❌ [validateFontFile] 파싱 방법 ${i + 1} 실패:`, parseError instanceof Error ? parseError.message : 'Unknown parse error');
        continue;
      }
    }

    if (!font) {
      console.error(`🚨 [validateFontFile] 모든 파싱 방법 실패: ${fontPath}`);
      return false;
    }

    console.log(`📊 [validateFontFile] 폰트 정보:`, {
      familyName: font.names?.fontFamily?.en || font.names?.fontFamily || 'Unknown',
      unitsPerEm: font.unitsPerEm,
      hasOS2Table: !!font.tables.os2,
      sxHeight: font.tables.os2?.sxHeight
    });

    // 메트릭 검증 (fallback 포함)
    const hasValidUnitsPerEm = font.unitsPerEm > 0;
    const hasValidXHeight = (font.tables.os2?.sxHeight ?? 0) > 0;
    
    // sxHeight가 없는 경우 대체값 사용 (일반적인 비율)
    const calculatedXHeight = hasValidXHeight ? font.tables.os2.sxHeight : (font.unitsPerEm * 0.5);
    
    const isValid = hasValidUnitsPerEm && calculatedXHeight > 0;
    
    console.log(`📏 [validateFontFile] 메트릭 검증:`, {
      hasValidUnitsPerEm,
      hasValidXHeight,
      calculatedXHeight,
      isValid
    });
    
    if (!isValid) {
      console.warn(`⚠️ [validateFontFile] 메트릭 검증 실패: ${fontPath}`, {
        unitsPerEm: font.unitsPerEm,
        sxHeight: font.tables.os2?.sxHeight,
        hasOS2Table: !!font.tables.os2,
        calculatedXHeight
      });
    } else {
      console.log(`✅ [validateFontFile] 검증 완료: ${fontPath}`);
    }

    return isValid;
  } catch (error) {
    console.error(`🚨 [validateFontFile] 예상치 못한 오류 for ${fontPath}:`, error);
    console.error(`🚨 [validateFontFile] 스택 트레이스:`, error instanceof Error ? error.stack : 'No stack trace');
    return false;
  }
}

// 폰트 파일 읽기 (서버 사이드 전용)
export async function readFontFile(fontPath: string): Promise<Uint8Array> {
  const resolvedPath = join(process.cwd(), fontPath);
  const fontBuffer = await readFile(resolvedPath);
  return fontBuffer;
}

// 폰트 크기 동적 계산
export function calculateFontSize(
  metrics: FontMetrics, 
  sizeId: string
): FontMetrics {
  // 사이즈별 설정 가져오기
  const sizeConfig = FONT_SIZE_MAPPINGS[sizeId as keyof typeof FONT_SIZE_MAPPINGS] 
    || FONT_SIZE_MAPPINGS.medium;
  
  // 4-Zone 시스템: 5개 선을 동일 간격으로 배치
  const lineSpacing = sizeConfig.lineSpacing / 4;
  
  // 소문자 영역 높이 (2개 간격)
  const xHeightInPdf = lineSpacing * 2;
  
  // 실제 PDF 폰트 크기 계산
  const calculatedFontSize = (xHeightInPdf / metrics.xHeight) * metrics.upem;
  
  return {
    ...metrics,
    calculatedFontSize,
    lineSpacing
  };
}

// PDF 생성 상태 로깅
export function logPDFGenerationInfo(
  font: FontMetadata, 
  fontSize: FontSize, 
  metrics: FontMetrics
) {
  console.log(`\n=== PDF 생성 정보 ===`);
  console.log(`폰트: ${font.name} (${font.fileName})`);
  console.log(`사이즈: ${fontSize.label} (${fontSize.size}px)`);
  console.log(`계산된 폰트 크기: ${metrics.calculatedFontSize.toFixed(2)}pt`);
  console.log(`라인 간격: ${metrics.lineSpacing.toFixed(2)}pt`);
  console.log(`폰트 메트릭: upem=${metrics.upem}, xHeight=${metrics.xHeight}`);
  console.log(`===================\n`);
}

// 서버 사이드 PDF 생성 함수들
import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { GUIDELINE_STYLES, PAGE_LAYOUT, PRACTICE_TEXTS, MULTI_PAGE_CONFIG } from './constants';
import { MultiPagePDFOptions, PageEstimate, TextDistributionResult } from './types/multi-page-pdf';

// PDF 생성을 위한 타입 정의
export interface PDFGenerationOptions {
  font: FontMetadata;
  fontSize: FontSize;
  customTexts?: string[];
}

// 텍스트 자동 줄바꿈 처리
export function wrapText(
  texts: string[], 
  font: { widthOfTextAtSize: (text: string, size: number) => number }, 
  fontSize: number, 
  maxWidth: number
): string[] {
  const wrappedLines: string[] = [];
  
  for (const block of texts) {
    const words = block.split(' ');
    if (words.length === 0) continue;
    
    let currentLine = "";
    
    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
        continue;
      }
      
      const testLine = currentLine + " " + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }
  
  return wrappedLines;
}

// 4-Zone 가이드라인 그리기
export function draw4ZoneGuidelines(
  page: { 
    drawLine: (options: {
      start: { x: number; y: number };
      end: { x: number; y: number };
      color: ReturnType<typeof rgb>;
      thickness: number;
      dashArray?: number[];
    }) => void;
  },
  lineIndex: number,
  totalLines: number,
  lineSpacing: number,
  pageWidth: number,
  pageHeight: number
) {
  // 페이지 내 라인 위치 계산
  const drawableHeight = pageHeight - PAGE_LAYOUT.TOP_MARGIN - PAGE_LAYOUT.BOTTOM_MARGIN;
  const slotHeight = drawableHeight / totalLines;
  
  const slotTopY = pageHeight - PAGE_LAYOUT.TOP_MARGIN - (lineIndex * slotHeight);
  const groupCenterY = slotTopY - slotHeight * 0.3;
  
  // 5개 가이드라인 Y 좌표 계산 (아래에서 위로)
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
  
  // 소문자 영역 사각형 테두리
  // 좌측 세로선
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
  
  // 우측 세로선
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
  
  return { baselineY, xHeightTopY, xHeightMidY, descenderLineY, ascenderLineY };
}

// 메인 PDF 생성 함수
export async function generateHandwritingPDF(options: PDFGenerationOptions): Promise<Uint8Array> {
  try {
    // 1. 폰트 메트릭 로딩
    const fontMetrics = await loadFontMetrics(options.font.filePath);
    const calculatedMetrics = calculateFontSize(fontMetrics, options.fontSize.id);
    
    // 2. PDF 문서 초기화
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    
    const page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    // 3. 폰트 임베딩
    const fontBytes = await readFontFile(options.font.filePath);
    const customFont = await doc.embedFont(fontBytes, {
      subset: true,
    });
    
    // 4. 텍스트 처리
    const textsToUse = options.customTexts || [...PRACTICE_TEXTS];
    const drawableWidth = width - PAGE_LAYOUT.LEFT_MARGIN - PAGE_LAYOUT.RIGHT_MARGIN;
    const wrappedLines = wrapText(
      textsToUse, 
      customFont, 
      calculatedMetrics.calculatedFontSize, 
      drawableWidth
    );
    
    // 5. 사이즈별 설정 가져오기
    const sizeConfig = FONT_SIZE_MAPPINGS[options.fontSize.id as keyof typeof FONT_SIZE_MAPPINGS] 
      || FONT_SIZE_MAPPINGS.medium;
    
    // 6. 가이드라인 및 텍스트 그리기
    for (let i = 0; i < sizeConfig.totalLines; i++) {
      // 가이드라인 그리기
      const guidelines = draw4ZoneGuidelines(
        page,
        i,
        sizeConfig.totalLines,
        calculatedMetrics.lineSpacing,
        width,
        height
      );
      
      // 짝수 라인에만 예시 텍스트 배치
      if (i % 2 === 0) {
        const textIndex = Math.floor(i / 2);
        if (textIndex < wrappedLines.length) {
          const text = wrappedLines[textIndex];
          
          try {
            page.drawText(text, {
              x: PAGE_LAYOUT.LEFT_MARGIN + GUIDELINE_STYLES.text.leftMargin,
              y: guidelines.baselineY,
              font: customFont,
              size: calculatedMetrics.calculatedFontSize,
              color: rgb(
                GUIDELINE_STYLES.text.color.r,
                GUIDELINE_STYLES.text.color.g,
                GUIDELINE_STYLES.text.color.b
              )
            });
          } catch (textError) {
            console.warn(`⚠️ 텍스트 렌더링 실패 (라인 ${i}): ${textError instanceof Error ? textError.message : 'Unknown error'}`);
            
            // 폴백 텍스트
            const fallbackText = "Handwriting practice line";
            try {
              page.drawText(fallbackText, {
                x: PAGE_LAYOUT.LEFT_MARGIN + GUIDELINE_STYLES.text.leftMargin,
                y: guidelines.baselineY,
                font: customFont,
                size: calculatedMetrics.calculatedFontSize,
                color: rgb(0.7, 0.7, 0.7)
              });
            } catch (fallbackError) {
              console.error(`❌ 폴백 텍스트 렌더링도 실패: ${fallbackError}`);
            }
          }
        }
      }
    }
    
    // 7. PDF 바이너리 반환
    const pdfBytes = await doc.save();
    return pdfBytes;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate PDF'
    );
  }
}

// 멀티페이지 PDF 생성 함수 (동적 import 사용)
export async function generateMultiPageHandwritingPDF(options: MultiPagePDFOptions): Promise<Uint8Array> {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 멀티페이지 PDF 생성 시작 (최대 ${options.pageLimit}페이지)`);
    
    // 동적 import로 클라이언트 사이드 의존성 방지
    const { TextDistributor } = await import('./text-distributor');
    const { PageManager } = await import('./page-manager');
    
    // 1. 폰트 메트릭 로딩
    const fontMetrics = await loadFontMetrics(options.font.filePath);
    const calculatedMetrics = calculateFontSize(fontMetrics, options.fontSize.id);
    
    // 2. 텍스트 분배기 초기화
    const textDistributor = new TextDistributor(options.font, options.fontSize);
    
    // 3. 페이지 관리자 초기화
    const pageManager = new PageManager(options.font, options.fontSize, options.pageLimit);
    
    // 4. 텍스트 분배
    const textsToUse = options.customTexts || [...PRACTICE_TEXTS];
    console.log(`📝 텍스트 분배 시작: ${textsToUse.length}개 블록`);
    
    const distributionResult = textDistributor.distributeText(textsToUse, options.pageLimit);
    console.log(`📊 분배 결과: ${distributionResult.totalPages}페이지, 잘림: ${distributionResult.truncatedContent}`);
    
    // 5. PDF 문서 초기화
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    
    // 6. 폰트 임베딩
    console.log(`🔍 폰트 임베딩 시작: ${options.font.filePath}`);
    const fontBytes = await readFontFile(options.font.filePath);
    const customFont = await doc.embedFont(fontBytes, {
      subset: true,
    });
    
    // 7. 페이지 생성
    console.log(`🎨 ${distributionResult.totalPages}개 페이지 생성 중...`);
    const pages = await pageManager.createPages(doc, distributionResult.pages, customFont);
    
    console.log(`✅ 페이지 생성 완료: ${pages.length}개`);
    
    // 8. PDF 바이너리 생성
    const pdfBytes = await doc.save();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 멀티페이지 PDF 생성 완료! (${duration}ms)`);
    console.log(`📊 최종 통계:`);
    console.log(`  - 총 페이지: ${distributionResult.totalPages}`);
    console.log(`  - 총 문자: ${distributionResult.distributionStats.totalCharacters}`);
    console.log(`  - 페이지당 평균 문자: ${distributionResult.distributionStats.averageCharsPerPage}`);
    console.log(`  - 페이지당 평균 라인: ${distributionResult.distributionStats.linesPerPage}`);
    console.log(`  - 파일 크기: ${(pdfBytes.length / 1024).toFixed(1)}KB`);
    console.log(`  - 내용 잘림: ${distributionResult.truncatedContent ? '예' : '아니오'}`);
    
    return pdfBytes;
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`💥 멀티페이지 PDF 생성 실패 (${duration}ms):`, error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate multi-page PDF'
    );
  }
}

// 페이지 수 추정 함수
export async function estimatePageCount(
  font: FontMetadata,
  fontSize: FontSize,
  texts: string[]
): Promise<PageEstimate> {
  try {
    console.log(`📊 페이지 수 추정 시작`);
    
    // 동적 import로 클라이언트 사이드 의존성 방지
    const { TextDistributor } = await import('./text-distributor');
    
    // 텍스트 분배기로 추정
    const textDistributor = new TextDistributor(font, fontSize);
    const estimatedPages = textDistributor.estimatePageCount(texts);
    
    // 텍스트 측정
    const combinedText = texts.join(' ');
    const textMeasurement = textDistributor.measureText(combinedText);
    
    // 신뢰도 계산 (간단한 휴리스틱)
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (textMeasurement.characterCount < 1000) {
      confidence = 'high';
    } else if (textMeasurement.characterCount > 10000) {
      confidence = 'low';
    }
    
    const result: PageEstimate = {
      estimatedPages,
      exceedsLimit: estimatedPages > MULTI_PAGE_CONFIG.MAX_PAGES,
      totalCharacters: textMeasurement.characterCount,
      averageCharsPerPage: estimatedPages > 0 ? Math.round(textMeasurement.characterCount / estimatedPages) : 0,
      confidence
    };
    
    console.log(`📊 추정 결과:`, result);
    return result;
    
  } catch (error) {
    console.error(`💥 페이지 수 추정 실패:`, error);
    
    // 폴백 추정
    const combinedText = texts.join(' ');
    const fallbackPages = Math.max(1, Math.ceil(combinedText.length / 2000));
    
    return {
      estimatedPages: fallbackPages,
      exceedsLimit: fallbackPages > MULTI_PAGE_CONFIG.MAX_PAGES,
      totalCharacters: combinedText.length,
      averageCharsPerPage: Math.round(combinedText.length / fallbackPages),
      confidence: 'low'
    };
  }
}

// 멀티페이지 PDF 생성 정보 로깅
export function logMultiPagePDFGenerationInfo(
  font: FontMetadata,
  fontSize: FontSize,
  pageLimit: number,
  distributionResult: TextDistributionResult
) {
  console.log(`\n=== 멀티페이지 PDF 생성 정보 ===`);
  console.log(`폰트: ${font.name} (${font.fileName})`);
  console.log(`사이즈: ${fontSize.label} (${fontSize.size}px)`);
  console.log(`페이지 제한: ${pageLimit}`);
  console.log(`실제 페이지: ${distributionResult.totalPages}`);
  console.log(`총 문자: ${distributionResult.distributionStats.totalCharacters}`);
  console.log(`페이지당 평균 문자: ${distributionResult.distributionStats.averageCharsPerPage}`);
  console.log(`페이지당 평균 라인: ${distributionResult.distributionStats.linesPerPage}`);
  console.log(`내용 잘림: ${distributionResult.truncatedContent ? '예' : '아니오'}`);
  console.log(`===============================\n`);
}