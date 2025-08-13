'use server';

import { 
  generateHandwritingPDF, 
  generateMultiPageHandwritingPDF,
  validateFontFile, 
  logPDFGenerationInfo,
  logMultiPagePDFGenerationInfo,
  calculateFontSize,
  loadFontMetrics
} from '@/lib/pdf-server-utils';
import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import { 
  getFontSizeById, 
  ROBOTO_MONO_FONT,
  FONT_SIZES,
  FontMetadata,
  FontSize
} from '@/lib/fonts';
import { OUTPUT_SETTINGS, TEXT_OPTIONS, MULTI_PAGE_CONFIG } from '@/lib/constants';
import { EnhancedPDFGenerationResult } from '@/lib/types/multi-page-pdf';

// Server Action 결과 타입 (기존 호환성 유지)
export interface PDFGenerationResult {
  success: boolean;
  data?: string; // Base64 인코딩된 PDF 데이터
  error?: string;
  filename?: string;
  contentType?: string;
  // 멀티페이지 관련 필드 추가
  pageCount?: number;
  truncatedContent?: boolean;
  generationStats?: {
    totalPages: number;
    totalCharacters: number;
    averageCharsPerPage: number;
    generationTimeMs: number;
  };
}

// PDF 생성 매개변수 검증 (Roboto Mono 고정)
function validatePDFParams(fontId: string, sizeId: string): {
  isValid: boolean;
  font?: FontMetadata;
  fontSize?: FontSize;
  error?: string;
} {
  // Roboto Mono 폰트 사용 (fontId 무시)
  const font = ROBOTO_MONO_FONT;
  
  // 폰트 사이즈 ID 검증
  const fontSize = getFontSizeById(sizeId);
  if (!fontSize) {
    return {
      isValid: false,
      error: `Invalid size ID: ${sizeId}. Available sizes: ${FONT_SIZES.map(s => s.id).join(', ')}`
    };
  }
  
  return {
    isValid: true,
    font,
    fontSize
  };
}

// 메인 PDF 생성 Server Action
export async function generatePDF(formData: FormData): Promise<PDFGenerationResult> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 PDF 생성 요청 받음...');
    
    // 1. FormData에서 매개변수 추출 (fontId는 Roboto Mono로 고정)
    const fontId = 'roboto-mono';  // 항상 Roboto Mono 사용
    const sizeId = formData.get('sizeId') as string;
    const textId = formData.get('textId') as string;
    const customTexts = formData.get('customTexts') as string;
    const pageLimitStr = formData.get('pageLimit') as string;
    
    // 페이지 제한 파싱 및 검증
    const pageLimit = pageLimitStr ? parseInt(pageLimitStr, 10) : 1;
    const validatedPageLimit = Math.max(
      MULTI_PAGE_CONFIG.MIN_PAGES, 
      Math.min(pageLimit, MULTI_PAGE_CONFIG.MAX_PAGES)
    );
    
    console.log(`📝 요청 매개변수: fontId=${fontId} (고정), sizeId=${sizeId}, textId=${textId}, pageLimit=${validatedPageLimit}`);
    
    // 2. 매개변수 검증
    const validation = validatePDFParams(fontId, sizeId);
    if (!validation.isValid) {
      console.error('❌ 매개변수 검증 실패:', validation.error);
      return {
        success: false,
        error: validation.error
      };
    }
    
    const { font, fontSize } = validation;
    
    // 타입 안전성 확보 (validation에서 이미 확인됨)
    if (!font || !fontSize) {
      throw new Error('Font or fontSize validation failed');
    }
    
    // 3. 폰트 파일 유효성 검증 (상세 로깅 포함)
    console.log(`🔍 폰트 파일 검증 중: ${font.filePath}`);
    console.log(`📁 현재 작업 디렉토리: ${process.cwd()}`);
    console.log(`🌍 실행 환경: ${process.env.VERCEL ? 'Vercel' : 'Local'}`);
    
    const isFontValid = await validateFontFile(font.filePath);
    if (!isFontValid) {
      const error = `Font file validation failed: ${font.filePath}`;
      console.error('❌', error);
      
      // 디버깅을 위한 추가 정보
      console.error('🔍 디버깅 정보:');
      console.error(`  - 폰트 ID: ${font.id}`);
      console.error(`  - 폰트 이름: ${font.name}`);
      console.error(`  - 파일명: ${font.fileName}`);
      console.error(`  - 파일 경로: ${font.filePath}`);
      console.error(`  - Node.js 버전: ${process.version}`);
      console.error(`  - 플랫폼: ${process.platform}`);
      
      return {
        success: false,
        error: `${error} (폰트: ${font.name})`
      };
    }
    
    // 4. 폰트 메트릭 로딩 및 계산
    console.log('📐 폰트 메트릭 계산 중...');
    const fontMetrics = await loadFontMetrics(font.filePath);
    const calculatedMetrics = calculateFontSize(fontMetrics, sizeId);
    
    // 5. PDF 생성 정보 로깅
    logPDFGenerationInfo(font, fontSize, calculatedMetrics);
    
    // 6. 텍스트 옵션 처리
    let textsToUse: string[] | undefined;
    
    // 선택된 텍스트 ID로 텍스트 찾기
    if (textId) {
      const selectedTextOption = TEXT_OPTIONS.find(option => option.id === textId);
      if (selectedTextOption) {
        textsToUse = [...selectedTextOption.texts];
        console.log(`📝 선택된 텍스트 옵션 사용: ${selectedTextOption.name} (${textsToUse.length}개 블록)`);
      }
    }
    
    // 커스텀 텍스트가 있으면 우선 사용
    if (customTexts) {
      try {
        textsToUse = JSON.parse(customTexts);
        console.log('📝 커스텀 텍스트 사용:', textsToUse?.length, '개 블록');
      } catch (error) {
        console.warn('⚠️  커스텀 텍스트 파싱 실패, 선택된 텍스트 옵션 사용:', error);
      }
    }
    
    // 7. PDF 생성 (멀티페이지 또는 단일페이지)
    console.log(`🎨 PDF 생성 중... (${validatedPageLimit > 1 ? '멀티페이지' : '단일페이지'})`);
    
    let pdfBytes: Uint8Array;
    let generationStats: PDFGenerationResult['generationStats'] | undefined;
    
    try {
      if (validatedPageLimit > 1) {
        // 멀티페이지 PDF 생성
        pdfBytes = await generateMultiPageHandwritingPDF({
          font,
          fontSize,
          customTexts: textsToUse,
          pageLimit: validatedPageLimit,
          includePageNumbers: true,
          pageNumberFormat: 'detailed'
        });
        
        // 통계 정보는 실제 구현에서 반환받아야 함 (현재는 추정값)
        const totalCharacters = textsToUse ? textsToUse.join(' ').length : 0;
        generationStats = {
          totalPages: validatedPageLimit,
          totalCharacters,
          averageCharsPerPage: validatedPageLimit > 0 ? Math.round(totalCharacters / validatedPageLimit) : 0,
          generationTimeMs: Date.now() - startTime
        };
        
        console.log('✅ 멀티페이지 PDF 생성 함수 성공');
      } else {
        // 기존 단일페이지 PDF 생성
        pdfBytes = await generateHandwritingPDF({
          font,
          fontSize,
          customTexts: textsToUse
        });
        console.log('✅ 단일페이지 PDF 생성 함수 성공');
      }
    } catch (error) {
      console.warn('⚠️ 원본 PDF 생성 실패, 간단한 PDF로 대체:', error);
      
      // 폴백: 간단한 PDF 생성
      const doc = await PDFDocument.create();
      const page = doc.addPage(PageSizes.A4);
      const { width, height } = page.getSize();
      
      // 기본 폰트로 텍스트 그리기
      page.drawText('Handwriting Practice Sheet', {
        x: 50,
        y: height - 50,
        size: 24,
        color: rgb(0, 0, 0)
      });
      
      page.drawText(`Font: ${font.name} (using fallback font due to error)`, {
        x: 50,
        y: height - 100,
        size: 16,
        color: rgb(0.7, 0, 0)
      });
      
      page.drawText(`Size: ${fontSize.label}`, {
        x: 50,
        y: height - 130,
        size: 16,
        color: rgb(0, 0, 0)
      });
      
      // 간단한 가이드라인
      for (let i = 0; i < 15; i++) {
        const y = height - 200 - (i * 35);
        if (y > 50) {
          page.drawLine({
            start: { x: 50, y },
            end: { x: width - 50, y },
            color: rgb(0.8, 0.8, 0.8),
            thickness: 1
          });
        }
      }
      
      pdfBytes = await doc.save();
    }
    
    // 8. 파일명 생성
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const pageInfo = validatedPageLimit > 1 ? `_${validatedPageLimit}pages` : '';
    const filename = `handwriting_${font.id}_${fontSize.id}${pageInfo}_${timestamp}.pdf`;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ PDF 생성 완료! (${duration}ms)`);
    console.log(`📁 파일명: ${filename}`);
    console.log(`📊 크기: ${(pdfBytes.length / 1024).toFixed(1)}KB`);
    
    // Base64로 인코딩
    const base64Data = Buffer.from(pdfBytes).toString('base64');
    
    return {
      success: true,
      data: base64Data,
      filename,
      contentType: OUTPUT_SETTINGS.CONTENT_TYPE,
      pageCount: validatedPageLimit,
      truncatedContent: false, // 실제 구현에서는 TextDistributor 결과에서 가져와야 함
      generationStats
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error(`💥 PDF 생성 실패 (${duration}ms):`, error);
    
    let errorMessage = 'PDF 생성 중 알 수 없는 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 특정 오류 타입별 사용자 친화적 메시지
      if (error.message.includes('Failed to load font')) {
        errorMessage = '폰트 파일을 불러올 수 없습니다. 다른 폰트를 선택해주세요.';
      } else if (error.message.includes('Invalid font metrics')) {
        errorMessage = '선택된 폰트가 손상되었거나 지원되지 않습니다.';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = '폰트 파일을 찾을 수 없습니다.';
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// PDF 생성 상태 확인 Server Action (Roboto Mono만 확인)
export async function checkPDFGenerationStatus(): Promise<{
  availableFonts: number;
  validFonts: number;
  systemReady: boolean;
}> {
  try {
    console.log('🔍 PDF 생성 시스템 상태 확인 중... (Roboto Mono)');
    
    // Roboto Mono 폰트 파일 검증
    const isValid = await validateFontFile(ROBOTO_MONO_FONT.filePath);
    const validFonts = isValid ? 1 : 0;
    
    if (!isValid) {
      console.warn(`⚠️  폰트 파일 문제: ${ROBOTO_MONO_FONT.name} (${ROBOTO_MONO_FONT.filePath})`);
    }
    
    const systemReady = isValid;
    
    console.log(`📊 시스템 상태: Roboto Mono 폰트 ${isValid ? '사용 가능' : '사용 불가'}`);
    
    return {
      availableFonts: 1,
      validFonts,
      systemReady
    };
    
  } catch (error) {
    console.error('💥 시스템 상태 확인 실패:', error);
    
    return {
      availableFonts: 1,
      validFonts: 0,
      systemReady: false
    };
  }
}

// 페이지 수 추정 Server Action
export async function estimatePageCount(formData: FormData): Promise<{
  success: boolean;
  estimate?: {
    estimatedPages: number;
    exceedsLimit: boolean;
    totalCharacters: number;
    averageCharsPerPage: number;
    confidence: 'high' | 'medium' | 'low';
  };
  error?: string;
}> {
  try {
    console.log('📊 페이지 수 추정 요청 받음...');
    
    // FormData에서 매개변수 추출
    const sizeId = formData.get('sizeId') as string;
    const textId = formData.get('textId') as string;
    const pageLimitStr = formData.get('pageLimit') as string;
    
    const pageLimit = pageLimitStr ? parseInt(pageLimitStr, 10) : MULTI_PAGE_CONFIG.DEFAULT_PAGE_LIMIT;
    
    // 매개변수 검증
    const validation = validatePDFParams('roboto-mono', sizeId);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }
    
    const { font, fontSize } = validation;
    if (!font || !fontSize) {
      throw new Error('Font or fontSize validation failed');
    }
    
    // 텍스트 옵션 찾기
    let textsToUse: string[] = [];
    if (textId) {
      const selectedTextOption = TEXT_OPTIONS.find(option => option.id === textId);
      if (selectedTextOption) {
        textsToUse = [...selectedTextOption.texts];
      }
    }
    
    if (textsToUse.length === 0) {
      return {
        success: false,
        error: 'No text content found for estimation'
      };
    }
    
    // 페이지 수 추정 (pdf-server-utils의 estimatePageCount 함수 사용)
    const { estimatePageCount: estimatePageCountUtil } = await import('@/lib/pdf-server-utils');
    const estimate = await estimatePageCountUtil(font, fontSize, textsToUse);
    
    console.log('📊 추정 완료:', estimate);
    
    return {
      success: true,
      estimate: {
        estimatedPages: estimate.estimatedPages,
        exceedsLimit: estimate.estimatedPages > pageLimit,
        totalCharacters: estimate.totalCharacters,
        averageCharsPerPage: estimate.averageCharsPerPage,
        confidence: estimate.confidence
      }
    };
    
  } catch (error) {
    console.error('💥 페이지 수 추정 실패:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Page count estimation failed'
    };
  }
}

// 개발/디버깅용 폰트 정보 확인 Server Action (Roboto Mono 고정)
export async function getFontDebugInfo(): Promise<{
  success: boolean;
  fontInfo?: {
    id: string;
    name: string;
    filePath: string;
    fileExists: boolean;
    isValid: boolean;
  };
  metrics?: {
    upem: number;
    xHeight: number;
    calculatedFontSize: number;
    lineSpacing: number;
  };
  error?: string;
}> {
  try {
    // fontId는 무시하고 항상 Roboto Mono 사용
    const font = ROBOTO_MONO_FONT;
    
    const isValid = await validateFontFile(font.filePath);
    if (!isValid) {
      return {
        success: false,
        error: `Font file validation failed: ${font.filePath}`
      };
    }
    
    const metrics = await loadFontMetrics(font.filePath);
    
    return {
      success: true,
      fontInfo: {
        ...font,
        fileExists: true,
        isValid: true
      },
      metrics
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}