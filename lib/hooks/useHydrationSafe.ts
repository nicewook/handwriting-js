'use client';

import { useState, useEffect } from 'react';

/**
 * 하이드레이션 상태를 나타내는 타입
 */
export type HydrationState = 'server' | 'hydrating' | 'hydrated';

/**
 * 하이드레이션 안전 상태 인터페이스
 */
export interface HydrationSafeState<T> {
  isHydrated: boolean;
  value: T;
  hydrationState: HydrationState;
}

/**
 * 서버와 클라이언트 간 일관된 초기 상태를 보장하는 훅
 * 하이드레이션 완료 후에만 클라이언트 전용 값을 사용
 */
export function useHydrationSafe<T>(
  serverValue: T,
  clientValue?: T
): HydrationSafeState<T> {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrationState, setHydrationState] = useState<HydrationState>('server');

  useEffect(() => {
    // 하이드레이션 시작
    setHydrationState('hydrating');
    
    // 다음 틱에서 하이드레이션 완료로 설정
    const timer = setTimeout(() => {
      setIsHydrated(true);
      setHydrationState('hydrated');
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 하이드레이션 완료 전에는 서버 값, 완료 후에는 클라이언트 값 사용
  const value = isHydrated && clientValue !== undefined ? clientValue : serverValue;

  return {
    isHydrated,
    value,
    hydrationState
  };
}

/**
 * 클라이언트 사이드에서만 실행되는 effect 훅
 * 하이드레이션 완료 후에만 실행됨
 */
export function useClientEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const { isHydrated } = useHydrationSafe(false, true);

  useEffect(() => {
    if (!isHydrated) return;
    
    return effect();
  }, [isHydrated, ...(deps || [])]);
}

/**
 * 브라우저 API 사용 가능 여부를 확인하는 훅
 */
export function useBrowserAPI(): boolean {
  const { isHydrated } = useHydrationSafe(false, true);
  
  return isHydrated && typeof window !== 'undefined';
}

/**
 * 하이드레이션 상태에 따른 조건부 렌더링을 위한 훅
 */
export function useHydrationConditional<T>(
  serverContent: T,
  clientContent: T
): T {
  const { value } = useHydrationSafe(serverContent, clientContent);
  return value;
}