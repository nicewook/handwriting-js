'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontMetadata, AVAILABLE_FONTS } from '../fonts';
import { FontLoadingState, FontLoadResult, preloadAllFonts, isFontLoaded } from '../font-utils';

// 폰트 로딩 상태 관리 Hook
export function useFontLoader() {
  const [loadingStates, setLoadingStates] = useState<Record<string, FontLoadingState>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 개별 폰트 로딩 상태 업데이트
  const updateFontState = useCallback((fontId: string, state: FontLoadingState) => {
    setLoadingStates(prev => ({
      ...prev,
      [fontId]: state
    }));
  }, []);

  // 모든 폰트 미리 로딩
  const initializeFonts = useCallback(async () => {
    if (isInitialized) return;

    // 초기 상태를 loading으로 설정
    const initialStates: Record<string, FontLoadingState> = {};
    AVAILABLE_FONTS.forEach(font => {
      initialStates[font.id] = 'loading';
    });
    setLoadingStates(initialStates);

    try {
      const results = await preloadAllFonts();
      
      // 결과에 따라 상태 업데이트
      const newStates: Record<string, FontLoadingState> = {};
      results.forEach(result => {
        newStates[result.font.id] = result.state;
      });
      
      setLoadingStates(newStates);
      setIsInitialized(true);
    } catch (error) {
      console.error('Font initialization failed:', error);
      
      // 오류 시 모든 폰트를 error 상태로 설정
      const errorStates: Record<string, FontLoadingState> = {};
      AVAILABLE_FONTS.forEach(font => {
        errorStates[font.id] = 'error';
      });
      setLoadingStates(errorStates);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 컴포넌트 마운트 시 폰트 초기화
  useEffect(() => {
    initializeFonts();
  }, [initializeFonts]);

  // 특정 폰트의 로딩 상태 확인
  const getFontState = useCallback((fontId: string): FontLoadingState => {
    return loadingStates[fontId] || 'idle';
  }, [loadingStates]);

  // 특정 폰트가 로딩되었는지 확인
  const isFontReady = useCallback((fontId: string): boolean => {
    const font = AVAILABLE_FONTS.find(f => f.id === fontId);
    if (!font) return false;
    
    const state = getFontState(fontId);
    return state === 'loaded' && isFontLoaded(font.fontFamily);
  }, [getFontState]);

  // 모든 폰트가 로딩되었는지 확인
  const areAllFontsReady = useCallback((): boolean => {
    return AVAILABLE_FONTS.every(font => isFontReady(font.id));
  }, [isFontReady]);

  // 로딩 중인 폰트 개수
  const loadingCount = Object.values(loadingStates).filter(state => state === 'loading').length;
  
  // 오류 발생한 폰트 개수
  const errorCount = Object.values(loadingStates).filter(state => state === 'error').length;

  return {
    loadingStates,
    isInitialized,
    getFontState,
    isFontReady,
    areAllFontsReady,
    loadingCount,
    errorCount,
    initializeFonts
  };
}

// 특정 폰트 로딩 Hook
export function useFontState(fontId: string) {
  const { getFontState, isFontReady } = useFontLoader();
  
  const [isChecking, setIsChecking] = useState(false);
  
  const state = getFontState(fontId);
  const isReady = isFontReady(fontId);
  
  // 폰트 로딩 상태 재확인
  const recheckFont = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    // 브라우저의 font 로딩 상태 재확인
    const font = AVAILABLE_FONTS.find(f => f.id === fontId);
    if (font && typeof document !== 'undefined') {
      try {
        await document.fonts.load(`1em ${font.fontFamily}`);
      } catch (error) {
        console.warn(`Failed to recheck font ${fontId}:`, error);
      }
    }
    
    setIsChecking(false);
  }, [fontId, isChecking]);
  
  return {
    state,
    isReady,
    isChecking,
    recheckFont
  };
}