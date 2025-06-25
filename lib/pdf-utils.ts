import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import opentype from 'opentype.js';
import { GUIDELINE_STYLES, PAGE_LAYOUT, PRACTICE_TEXTS, FONT_SIZE_MAPPINGS } from './constants';
import { FontMetadata, FontSize } from './fonts';

// PDF 생성을 위한 타입 정의
export interface PDFGenerationOptions {
  font: FontMetadata;
  fontSize: FontSize;
  customTexts?: string[];
}

export interface FontMetrics {
  upem: number;
  xHeight: number;
  calculatedFontSize: number;
  lineSpacing: number;
}

// 폰트 파일 로딩 및 메트릭 추출
export async function loadFontMetrics(fontPath: string): Promise<FontMetrics> {
  try {
    // Node.js 환경에서 폰트 파일 읽기
    const fullPath = join(process.cwd(), 'public', fontPath);
    const fontBuffer = await readFile(fullPath);
    
    // OpenType.js로 폰트 분석
    const font = opentype.parse(fontBuffer.buffer);
    
    const upem = font.unitsPerEm;
    const xHeight = font.tables.os2?.sxHeight || upem * 0.5; // fallback
    
    if (!upem || !xHeight) {
      throw new Error('Invalid font metrics');
    }
    
    return {
      upem,
      xHeight,
      calculatedFontSize: 0, // 후에 계산됨
      lineSpacing: 0         // 후에 계산됨
    };
  } catch (error) {
    console.error('Font loading error:', error);
    throw new Error(`Failed to load font: ${fontPath}`);
  }
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
    const fontPath = join(process.cwd(), 'public', options.font.filePath);
    const fontBytes = await readFile(fontPath);
    const customFont = await doc.embedFont(fontBytes);
    
    // 4. 텍스트 처리
    const textsToUse = options.customTexts || [...PRACTICE_TEXTS]; // readonly 배열을 mutable로 변환
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

// 폰트 파일 유효성 검증
export async function validateFontFile(fontPath: string): Promise<boolean> {
  try {
    const fullPath = join(process.cwd(), 'public', fontPath);
    const fontBuffer = await readFile(fullPath);
    const font = opentype.parse(fontBuffer.buffer);
    
    // 필수 메트릭 확인
    return !!(font.unitsPerEm && font.tables.os2?.sxHeight);
  } catch {
    return false;
  }
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