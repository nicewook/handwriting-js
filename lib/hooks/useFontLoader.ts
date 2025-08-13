'use client';

import { useState, useEffect, useCallback } from 'react';
import { ROBOTO_MONO_FONT } from '../fonts';
import { FontLoadingState, isFontLoaded } from '../font-utils';

// 단일 폰트(Roboto Mono) 로딩 상태 관리 Hook
export function useFontLoader() {
  const [fontState, setFontState] = useState<FontLoadingState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);

  // Roboto Mono 폰트 로딩
  const initializeFont = useCallback(async () => {
    if (isInitialized) return;

    setFontState('loading');

    try {
      // 웹폰트 로딩
      if (typeof document !== 'undefined') {
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
      
      setFontState('loaded');
      setIsInitialized(true);
    } catch (error) {
      console.error('Roboto Mono font loading failed:', error);
      setFontState('error');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 컴포넌트 마운트 시 폰트 초기화
  useEffect(() => {
    initializeFont();
  }, [initializeFont]);

  // 폰트가 로딩되었는지 확인
  const isFontReady = useCallback((): boolean => {
    return fontState === 'loaded' && isFontLoaded(ROBOTO_MONO_FONT.fontFamily);
  }, [fontState]);

  // 로딩 중인 폰트 개수 (호환성용)
  const loadingCount = fontState === 'loading' ? 1 : 0;
  
  // 오류 발생한 폰트 개수 (호환성용)
  const errorCount = fontState === 'error' ? 1 : 0;

  return {
    fontState,
    isInitialized,
    isFontReady,
    loadingCount,
    errorCount,
    initializeFont
  };
}

// Roboto Mono 폰트 상태 Hook (단순화된 버전)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useFontState(_fontId?: string) {
  const { fontState, isFontReady } = useFontLoader();
  
  const [isChecking, setIsChecking] = useState(false);
  
  // fontId는 무시하고 항상 Roboto Mono 상태 반환
  const state = fontState;
  const isReady = isFontReady();
  
  // 폰트 로딩 상태 재확인
  const recheckFont = useCallback(async () => {
    if (isChecking) return;
    
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
  }, [isChecking]);
  
  return {
    state,
    isReady,
    isChecking,
    recheckFont
  };
}