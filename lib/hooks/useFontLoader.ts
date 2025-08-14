'use client';

import { useState, useEffect, useCallback } from 'react';
import { ROBOTO_MONO_FONT } from '../fonts';
import { FontLoadingState, isFontLoaded } from '../font-utils';
import { useHydrationSafe, useClientEffect, useBrowserAPI } from './useHydrationSafe';

// 단일 폰트(Roboto Mono) 로딩 상태 관리 Hook
export function useFontLoader() {
  // 하이드레이션 안전한 초기 상태 사용
  const { value: fontState, isHydrated } = useHydrationSafe<FontLoadingState>('idle', 'idle');
  const [currentFontState, setCurrentFontState] = useState<FontLoadingState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const isBrowserReady = useBrowserAPI();

  // Roboto Mono 폰트 로딩 (하이드레이션 후에만 실행)
  const initializeFont = useCallback(async () => {
    if (isInitialized || !isBrowserReady) return;

    setCurrentFontState('loading');

    try {
      // 브라우저 API 사용 가능 확인
      if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
        const fontFace = new FontFace(
          ROBOTO_MONO_FONT.fontFamily,
          `url('${ROBOTO_MONO_FONT.webFilePath}')`,
          {
            weight: ROBOTO_MONO_FONT.weight,
            style: ROBOTO_MONO_FONT.style,
            display: 'swap'
          }
        );

        await fontFace.load();
        document.fonts.add(fontFace);
        
        // 로딩 확인
        await document.fonts.load(`1em ${ROBOTO_MONO_FONT.fontFamily}`);
      }
      
      setCurrentFontState('loaded');
      setIsInitialized(true);
    } catch (error) {
      console.error('Roboto Mono font loading failed:', error);
      setCurrentFontState('error');
      setIsInitialized(true);
    }
  }, [isInitialized, isBrowserReady]);

  // 하이드레이션 완료 후 폰트 초기화
  useClientEffect(() => {
    initializeFont();
  }, [initializeFont]);

  // 폰트가 로딩되었는지 확인 (하이드레이션 후에만)
  const isFontReady = useCallback((): boolean => {
    if (!isHydrated || !isBrowserReady) return false;
    return currentFontState === 'loaded' && isFontLoaded(ROBOTO_MONO_FONT.fontFamily);
  }, [currentFontState, isHydrated, isBrowserReady]);

  // 현재 폰트 상태 (하이드레이션 전에는 'idle' 유지)
  const effectiveFontState = isHydrated ? currentFontState : 'idle';

  // 로딩 중인 폰트 개수 (호환성용)
  const loadingCount = effectiveFontState === 'loading' ? 1 : 0;
  
  // 오류 발생한 폰트 개수 (호환성용)
  const errorCount = effectiveFontState === 'error' ? 1 : 0;

  return {
    fontState: effectiveFontState,
    isInitialized: isHydrated ? isInitialized : false,
    isFontReady,
    loadingCount,
    errorCount,
    initializeFont
  };
}

// Roboto Mono 폰트 상태 Hook (하이드레이션 안전 버전)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useFontState(_fontId?: string) {
  const { fontState, isFontReady } = useFontLoader();
  const isBrowserReady = useBrowserAPI();
  
  const [isChecking, setIsChecking] = useState(false);
  
  // fontId는 무시하고 항상 Roboto Mono 상태 반환
  const state = fontState;
  const isReady = isFontReady();
  
  // 폰트 로딩 상태 재확인 (하이드레이션 후에만)
  const recheckFont = useCallback(async () => {
    if (isChecking || !isBrowserReady) return;
    
    setIsChecking(true);
    
    // Roboto Mono 폰트 상태 재확인
    if (typeof document !== 'undefined') {
      try {
        await document.fonts.load(`1em ${ROBOTO_MONO_FONT.fontFamily}`);
      } catch (error) {
        console.warn('Failed to recheck Roboto Mono font:', error);
      }
    }
    
    setIsChecking(false);
  }, [isChecking, isBrowserReady]);
  
  return {
    state,
    isReady,
    isChecking,
    recheckFont
  };
}