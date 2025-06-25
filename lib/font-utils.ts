import { FontMetadata, AVAILABLE_FONTS } from './fonts';

// 폰트 로딩 상태 타입
export type FontLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// 폰트 로딩 결과 타입
export interface FontLoadResult {
  font: FontMetadata;
  state: FontLoadingState;
  error?: string;
}

// 폰트 파일 유효성 검사
export function validateFontFile(font: FontMetadata): boolean {
  try {
    // 파일 경로가 올바른지 확인
    if (!font.filePath || !font.fileName) {
      return false;
    }
    
    // TTF 파일인지 확인
    if (!font.fileName.toLowerCase().endsWith('.ttf')) {
      return false;
    }
    
    // 필수 메타데이터가 있는지 확인
    if (!font.fontFamily || !font.name || !font.id) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Font validation error for ${font.name}:`, error);
    return false;
  }
}

// 웹 폰트 로딩 함수
export async function loadWebFont(font: FontMetadata): Promise<FontLoadResult> {
  try {
    // 폰트 유효성 검사
    if (!validateFontFile(font)) {
      throw new Error(`Invalid font configuration: ${font.name}`);
    }

    // FontFace API를 사용한 폰트 로딩
    const fontFace = new FontFace(
      font.fontFamily,
      `url(${font.filePath})`,
      {
        weight: font.weight,
        style: font.style,
        display: 'swap'
      }
    );

    // 폰트 로딩
    const loadedFont = await fontFace.load();
    
    // 문서에 폰트 추가
    if (typeof document !== 'undefined') {
      document.fonts.add(loadedFont);
    }

    return {
      font,
      state: 'loaded'
    };
  } catch (error) {
    console.error(`Failed to load font ${font.name}:`, error);
    return {
      font,
      state: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// 모든 폰트 미리 로딩
export async function preloadAllFonts(): Promise<FontLoadResult[]> {
  const validFonts = AVAILABLE_FONTS.filter(validateFontFile);
  
  const loadPromises = validFonts.map(font => loadWebFont(font));
  
  try {
    const results = await Promise.allSettled(loadPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          font: validFonts[index],
          state: 'error' as const,
          error: result.reason?.message || 'Failed to load font'
        };
      }
    });
  } catch (error) {
    console.error('Error preloading fonts:', error);
    return validFonts.map(font => ({
      font,
      state: 'error' as const,
      error: 'Preload failed'
    }));
  }
}

// 폰트가 로딩되었는지 확인
export function isFontLoaded(fontFamily: string): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  
  return document.fonts.check(`1em ${fontFamily}`);
}

// 폰트 로딩 대기
export async function waitForFontLoad(
  fontFamily: string, 
  timeout: number = 5000
): Promise<boolean> {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    await document.fonts.load(`1em ${fontFamily}`);
    
    // 타임아웃과 함께 폰트 로딩 대기
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), timeout);
    });
    
    const fontReadyPromise = document.fonts.ready.then(() => {
      return isFontLoaded(fontFamily);
    });
    
    return await Promise.race([fontReadyPromise, timeoutPromise]);
  } catch (error) {
    console.error(`Font loading timeout for ${fontFamily}:`, error);
    return false;
  }
}

// CSS 문자열에서 폰트 패밀리 추출
export function extractFontFamily(cssString: string): string | null {
  const match = cssString.match(/font-family:\s*['"]?([^'";]+)['"]?/i);
  return match ? match[1].trim() : null;
}

// 폰트 스타일 문자열 생성
export function createFontStyleString(font: FontMetadata): string {
  return `${font.weight} ${font.style} 1em '${font.fontFamily}', monospace`;
}

// 안전한 폰트 스타일 적용 (fallback 포함)
export function getSafeFontStyle(
  fontId: string, 
  sizeId: string, 
  fallbackFamily: string = 'monospace'
): React.CSSProperties {
  try {
    const font = AVAILABLE_FONTS.find(f => f.id === fontId);
    
    if (!font) {
      return {
        fontFamily: fallbackFamily,
        fontSize: '16px'
      };
    }

    const fontFamily = isFontLoaded(font.fontFamily) 
      ? `'${font.fontFamily}', ${fallbackFamily}`
      : fallbackFamily;

    return {
      fontFamily,
      fontSize: getSizeValue(sizeId),
      fontWeight: font.weight,
      fontStyle: font.style,
      lineHeight: 1.5
    };
  } catch (error) {
    console.error('Error creating font style:', error);
    return {
      fontFamily: fallbackFamily,
      fontSize: '16px'
    };
  }
}

// 사이즈 ID에서 픽셀 값 가져오기
function getSizeValue(sizeId: string): string {
  const sizeMap: Record<string, string> = {
    small: '14px',
    medium: '18px',
    large: '24px'
  };
  
  return sizeMap[sizeId] || '18px';
}