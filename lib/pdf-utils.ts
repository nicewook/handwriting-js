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

// 폰트 파일 로딩 및 메트릭 추출 (Vercel 환경 최적화)
export async function loadFontMetrics(fontPath: string): Promise<FontMetrics> {
  console.log(`🔍 [loadFontMetrics] 시작: ${fontPath}`);
  console.log(`🌍 [loadFontMetrics] 환경:`, {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
    cwd: process.cwd()
  });
  
  try {
    // Vercel 환경을 위한 확장된 경로 전략
    const fileName = fontPath.split('/').pop() || '';
    console.log(`📄 [loadFontMetrics] 파일명: ${fileName}`);
    
    const pathStrategies = [
      // 기본 public 경로
      join(process.cwd(), 'public', fontPath),
      join(process.cwd(), 'public/fonts', fileName),
      fontPath.startsWith('/') ? join(process.cwd(), 'public', fontPath.slice(1)) : join(process.cwd(), 'public', fontPath),
      
      // Vercel 특화 서버리스 환경 경로 (Lambda)
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, 'public', fontPath) : null,
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, 'public/fonts', fileName) : null,
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, '.next/static/media', fileName) : null,
      
      // Vercel 빌드 환경용 경로
      join(process.cwd(), '.next/static/chunks/app', 'public', fontPath),
      join(process.cwd(), '.next/server/app', 'public', fontPath),
      join(process.cwd(), '.next/static/media', fileName),
      join(process.cwd(), '.next/standalone/public', fontPath),
      join(process.cwd(), '.next/standalone/public/fonts', fileName),
      
      // Vercel 프로덕션 환경 경로 (다양한 버전)
      join('/', 'var', 'task', 'public', fontPath),
      join('/', 'var', 'task', 'public/fonts', fileName),
      join('/', 'var', 'task', '.next/static/media', fileName),
      join('/', 'var', 'task', '.next/standalone/public', fontPath),
      join('/', 'var', 'task', '.next/standalone/public/fonts', fileName),
      
      // 추가 Vercel 경로 전략
      join(process.cwd(), 'dist/public', fontPath),
      join(process.cwd(), 'build/public', fontPath),
      join(process.cwd(), '.vercel/output/static', fontPath),
      join(process.cwd(), '.vercel/output/static/fonts', fileName),
      join(process.cwd(), '.vercel/output/functions/__nextjs.func', 'public', fontPath),
      join(process.cwd(), '.vercel/output/functions/__nextjs.func', 'public/fonts', fileName),
      
      // 상대 경로 전략
      join(__dirname, '../public', fontPath),
      join(__dirname, '../public/fonts', fileName),
      join(__dirname, '../../public', fontPath),
      join(__dirname, '../../public/fonts', fileName),
      
      // Next.js 정적 자산 경로
      join(process.cwd(), 'static', fontPath),
      join(process.cwd(), 'static/fonts', fileName),
      join('/tmp', 'public', fontPath),
      join('/tmp', 'public/fonts', fileName)
    ].filter(Boolean) as string[];

    let fontBuffer: Buffer | null = null;
    let resolvedPath: string = '';
    
    // 각 경로를 상세히 로깅하며 시도
    for (let i = 0; i < pathStrategies.length; i++) {
      const testPath = pathStrategies[i];
      try {
        fontBuffer = await readFile(testPath);
        resolvedPath = testPath;
        console.log(`✅ [loadFontMetrics] 파일 발견: ${resolvedPath} (크기: ${fontBuffer.length} bytes)`);
        break;
      } catch {
        // 상세 로깅은 생략하되 첫 몇 개 경로는 로깅
        if (i < 3) {
          console.log(`❌ [loadFontMetrics] 경로 ${i + 1} 실패: ${testPath}`);
        }
        continue;
      }
    }

    if (!fontBuffer) {
      console.error(`🚨 [loadFontMetrics] 모든 경로에서 폰트 파일을 찾을 수 없음: ${fontPath}`);
      throw new Error(`Font file not found: ${fontPath} (searched multiple paths)`);
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
    
    // 3. 폰트 임베딩 (Vercel 환경을 위한 확장된 경로 전략)
    console.log(`🔍 [generateHandwritingPDF] 폰트 임베딩 시작: ${options.font.filePath}`);
    console.log(`🌍 [generateHandwritingPDF] 환경:`, {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
      cwd: process.cwd()
    });
    
    const fileName = options.font.filePath.split('/').pop() || '';
    const pathStrategies = [
      // 기본 public 경로
      join(process.cwd(), 'public', options.font.filePath),
      join(process.cwd(), 'public/fonts', fileName),
      options.font.filePath.startsWith('/') ? join(process.cwd(), 'public', options.font.filePath.slice(1)) : join(process.cwd(), 'public', options.font.filePath),
      
      // Vercel 특화 서버리스 환경 경로 (Lambda)
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, 'public', options.font.filePath) : null,
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, 'public/fonts', fileName) : null,
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, '.next/static/media', fileName) : null,
      
      // Vercel 빌드 환경용 경로
      join(process.cwd(), '.next/static/chunks/app', 'public', options.font.filePath),
      join(process.cwd(), '.next/server/app', 'public', options.font.filePath),
      join(process.cwd(), '.next/static/media', fileName),
      join(process.cwd(), '.next/standalone/public', options.font.filePath),
      join(process.cwd(), '.next/standalone/public/fonts', fileName),
      
      // Vercel 프로덕션 환경 경로 (다양한 버전)
      join('/', 'var', 'task', 'public', options.font.filePath),
      join('/', 'var', 'task', 'public/fonts', fileName),
      join('/', 'var', 'task', '.next/static/media', fileName),
      join('/', 'var', 'task', '.next/standalone/public', options.font.filePath),
      join('/', 'var', 'task', '.next/standalone/public/fonts', fileName),
      
      // 추가 Vercel 경로 전략
      join(process.cwd(), 'dist/public', options.font.filePath),
      join(process.cwd(), 'build/public', options.font.filePath),
      join(process.cwd(), '.vercel/output/static', options.font.filePath),
      join(process.cwd(), '.vercel/output/static/fonts', fileName),
      join(process.cwd(), '.vercel/output/functions/__nextjs.func', 'public', options.font.filePath),
      join(process.cwd(), '.vercel/output/functions/__nextjs.func', 'public/fonts', fileName),
      
      // 상대 경로 전략
      join(__dirname, '../public', options.font.filePath),
      join(__dirname, '../public/fonts', fileName),
      join(__dirname, '../../public', options.font.filePath),
      join(__dirname, '../../public/fonts', fileName),
      
      // Next.js 정적 자산 경로
      join(process.cwd(), 'static', options.font.filePath),
      join(process.cwd(), 'static/fonts', fileName),
      join('/tmp', 'public', options.font.filePath),
      join('/tmp', 'public/fonts', fileName)
    ].filter(Boolean) as string[];

    let fontBytes: Buffer | null = null;
    let resolvedPath: string = '';
    
    for (let i = 0; i < pathStrategies.length; i++) {
      const testPath = pathStrategies[i];
      try {
        fontBytes = await readFile(testPath);
        resolvedPath = testPath;
        console.log(`✅ [generateHandwritingPDF] PDF 폰트 파일 로딩 성공: ${resolvedPath} (크기: ${fontBytes.length} bytes)`);
        break;
      } catch {
        // 처음 몇 개 경로만 로깅
        if (i < 3) {
          console.log(`❌ [generateHandwritingPDF] 경로 ${i + 1} 실패: ${testPath}`);
        }
        continue;
      }
    }

    if (!fontBytes) {
      console.error(`🚨 [generateHandwritingPDF] 모든 경로에서 폰트 파일을 찾을 수 없음: ${options.font.filePath}`);
      throw new Error(`Font file not found for PDF embedding: ${options.font.filePath}`);
    }

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

// 폰트 파일 유효성 검증 (Vercel 환경 최적화)
export async function validateFontFile(fontPath: string): Promise<boolean> {
  console.log(`🔍 [validateFontFile] 시작: ${fontPath}`);
  console.log(`📁 [validateFontFile] 작업 디렉토리: ${process.cwd()}`);
  console.log(`🌍 [validateFontFile] 환경 변수:`, {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
    __dirname: __dirname
  });
  
  try {
    // Vercel 환경을 위한 확장된 경로 전략
    const fileName = fontPath.split('/').pop() || '';
    console.log(`📄 [validateFontFile] 파일명: ${fileName}`);
    
    const pathStrategies = [
      // 기본 public 경로
      join(process.cwd(), 'public', fontPath),
      join(process.cwd(), 'public/fonts', fileName),
      fontPath.startsWith('/') ? join(process.cwd(), 'public', fontPath.slice(1)) : join(process.cwd(), 'public', fontPath),
      
      // Vercel 특화 서버리스 환경 경로 (Lambda)
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, 'public', fontPath) : null,
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, 'public/fonts', fileName) : null,
      process.env.LAMBDA_TASK_ROOT ? join(process.env.LAMBDA_TASK_ROOT, '.next/static/media', fileName) : null,
      
      // Vercel 빌드 환경용 경로
      join(process.cwd(), '.next/static/chunks/app', 'public', fontPath),
      join(process.cwd(), '.next/server/app', 'public', fontPath),
      join(process.cwd(), '.next/static/media', fileName),
      join(process.cwd(), '.next/standalone/public', fontPath),
      join(process.cwd(), '.next/standalone/public/fonts', fileName),
      
      // Vercel 프로덕션 환경 경로 (다양한 버전)
      join('/', 'var', 'task', 'public', fontPath),
      join('/', 'var', 'task', 'public/fonts', fileName),
      join('/', 'var', 'task', '.next/static/media', fileName),
      join('/', 'var', 'task', '.next/standalone/public', fontPath),
      join('/', 'var', 'task', '.next/standalone/public/fonts', fileName),
      
      // 추가 Vercel 경로 전략
      join(process.cwd(), 'dist/public', fontPath),
      join(process.cwd(), 'build/public', fontPath),
      join(process.cwd(), '.vercel/output/static', fontPath),
      join(process.cwd(), '.vercel/output/static/fonts', fileName),
      join(process.cwd(), '.vercel/output/functions/__nextjs.func', 'public', fontPath),
      join(process.cwd(), '.vercel/output/functions/__nextjs.func', 'public/fonts', fileName),
      
      // 상대 경로 전략
      join(__dirname, '../public', fontPath),
      join(__dirname, '../public/fonts', fileName),
      join(__dirname, '../../public', fontPath),
      join(__dirname, '../../public/fonts', fileName),
      
      // Next.js 정적 자산 경로
      join(process.cwd(), 'static', fontPath),
      join(process.cwd(), 'static/fonts', fileName),
      join('/tmp', 'public', fontPath),
      join('/tmp', 'public/fonts', fileName)
    ].filter(Boolean) as string[];

    console.log(`🔍 [validateFontFile] 시도할 경로 수: ${pathStrategies.length}`);

    let fontBuffer: Buffer | null = null;
    let resolvedPath: string = '';
    
    // 각 경로를 상세히 로깅하며 시도
    for (let i = 0; i < pathStrategies.length; i++) {
      const testPath = pathStrategies[i];
      console.log(`📂 [validateFontFile] 경로 ${i + 1}: ${testPath}`);
      
      try {
        fontBuffer = await readFile(testPath);
        resolvedPath = testPath;
        console.log(`✅ [validateFontFile] 파일 발견: ${resolvedPath} (크기: ${fontBuffer.length} bytes)`);
        break;
      } catch (error) {
        console.log(`❌ [validateFontFile] 경로 ${i + 1} 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
        continue;
      }
    }

    if (!fontBuffer) {
      console.error(`🚨 [validateFontFile] 모든 경로에서 폰트 파일을 찾을 수 없음: ${fontPath}`);
      
      // 포괄적인 디렉토리 구조 디버깅
      try {
        const { readdirSync, existsSync } = await import('fs');
        
        // 기본 경로들 탐색
        const baseDirectories = [
          process.cwd(),
          '/',
          '/var/task',
          process.env.LAMBDA_TASK_ROOT,
          __dirname,
          join(__dirname, '..'),
          join(__dirname, '../..')
        ].filter((dir): dir is string => Boolean(dir));
        
        for (const baseDir of baseDirectories) {
          if (existsSync(baseDir)) {
            console.log(`\n📁 [validateFontFile] 베이스 디렉토리 탐색: ${baseDir}`);
            try {
              const contents = readdirSync(baseDir, { withFileTypes: true }) as import('fs').Dirent[];
              console.log(`   내용: ${contents.slice(0, 10).map(d => `${d.name}${d.isDirectory() ? '/' : ''}`).join(', ')}${contents.length > 10 ? '...' : ''}`);
              
              // public 디렉토리 찾기
              if (contents.some(d => d.name === 'public' && d.isDirectory())) {
                const publicDir = join(baseDir, 'public');
                console.log(`   📂 public 디렉토리 발견: ${publicDir}`);
                try {
                  const publicContents = readdirSync(publicDir, { withFileTypes: true }) as import('fs').Dirent[];
                  console.log(`      내용: ${publicContents.map(d => `${d.name}${d.isDirectory() ? '/' : ''}`).join(', ')}`);
                  
                  // fonts 디렉토리 확인
                  if (publicContents.some(d => d.name === 'fonts' && d.isDirectory())) {
                    const fontsDir = join(publicDir, 'fonts');
                    console.log(`      📂 fonts 디렉토리 발견: ${fontsDir}`);
                    try {
                      const fontFiles = readdirSync(fontsDir);
                      console.log(`         폰트 파일들: ${fontFiles.join(', ')}`);
                      
                      // 원하는 폰트 파일이 있는지 확인
                      if (fontFiles.includes(fileName)) {
                        console.log(`         ✅ 대상 폰트 파일 발견: ${fileName}`);
                        const foundPath = join(fontsDir, fileName);
                        console.log(`         📍 실제 경로: ${foundPath}`);
                        
                        // 직접 읽기 시도
                        try {
                          const directBuffer = await readFile(foundPath);
                          console.log(`         ✅ 직접 읽기 성공: ${directBuffer.length} bytes`);
                          fontBuffer = directBuffer;
                          resolvedPath = foundPath;
                        } catch (directError) {
                          console.log(`         ❌ 직접 읽기 실패:`, directError instanceof Error ? directError.message : 'Unknown error');
                        }
                      }
                    } catch (fontsError) {
                      console.log(`      ❌ fonts 디렉토리 읽기 실패:`, fontsError instanceof Error ? fontsError.message : 'Unknown error');
                    }
                  }
                } catch (publicError) {
                  console.log(`   ❌ public 디렉토리 읽기 실패:`, publicError instanceof Error ? publicError.message : 'Unknown error');
                }
              }
              
              // .next 디렉토리 찾기
              if (contents.some(d => d.name === '.next' && d.isDirectory())) {
                const nextDir = join(baseDir, '.next');
                console.log(`   📂 .next 디렉토리 발견: ${nextDir}`);
                try {
                  const nextContents = readdirSync(nextDir, { withFileTypes: true }) as import('fs').Dirent[];
                  console.log(`      내용: ${nextContents.slice(0, 5).map(d => `${d.name}${d.isDirectory() ? '/' : ''}`).join(', ')}${nextContents.length > 5 ? '...' : ''}`);
                } catch (nextError) {
                  console.log(`   ❌ .next 디렉토리 읽기 실패:`, nextError instanceof Error ? nextError.message : 'Unknown error');
                }
              }
            } catch (baseError) {
              console.log(`❌ 베이스 디렉토리 읽기 실패:`, baseError instanceof Error ? baseError.message : 'Unknown error');
            }
          } else {
            console.log(`❌ 베이스 디렉토리 없음: ${baseDir}`);
          }
        }
      } catch (dirError) {
        console.error(`🚨 [validateFontFile] 디렉토리 탐색 오류:`, dirError);
      }
      
      if (!fontBuffer) {
        return false;
      }
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