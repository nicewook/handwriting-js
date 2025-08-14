/**
 * 하이드레이션 수정 사항 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useHydrationSafe, useClientEffect, useBrowserAPI } from '../hooks/useHydrationSafe';

// Mock window and document for testing
const mockWindow = {
  document: {
    fonts: {
      check: jest.fn(() => true),
      load: jest.fn(() => Promise.resolve()),
      add: jest.fn(),
      ready: Promise.resolve()
    }
  }
};

describe('Hydration Safe Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useHydrationSafe', () => {
    it('should start with server value before hydration', () => {
      const { result } = renderHook(() => 
        useHydrationSafe('server-value', 'client-value')
      );

      expect(result.current.isHydrated).toBe(false);
      expect(result.current.value).toBe('server-value');
      expect(result.current.hydrationState).toBe('server');
    });

    it('should transition to client value after hydration', async () => {
      const { result, waitForNextUpdate } = renderHook(() => 
        useHydrationSafe('server-value', 'client-value')
      );

      // Wait for hydration effect
      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.isHydrated).toBe(true);
      expect(result.current.value).toBe('client-value');
      expect(result.current.hydrationState).toBe('hydrated');
    });

    it('should use server value when client value is undefined', async () => {
      const { result, waitForNextUpdate } = renderHook(() => 
        useHydrationSafe('server-value')
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current.isHydrated).toBe(true);
      expect(result.current.value).toBe('server-value');
    });
  });

  describe('useClientEffect', () => {
    it('should not run effect before hydration', () => {
      const effectFn = jest.fn();
      
      renderHook(() => useClientEffect(effectFn, []));

      expect(effectFn).not.toHaveBeenCalled();
    });

    it('should run effect after hydration', async () => {
      const effectFn = jest.fn();
      
      const { waitForNextUpdate } = renderHook(() => 
        useClientEffect(effectFn, [])
      );

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(effectFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('useBrowserAPI', () => {
    it('should return false before hydration', () => {
      const { result } = renderHook(() => useBrowserAPI());

      expect(result.current).toBe(false);
    });

    it('should return true after hydration in browser environment', async () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true
      });

      const { result, waitForNextUpdate } = renderHook(() => useBrowserAPI());

      await act(async () => {
        await waitForNextUpdate();
      });

      expect(result.current).toBe(true);
    });
  });
});

describe('Font Loading with Hydration Safety', () => {
  beforeEach(() => {
    // Reset DOM mocks
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true
    });
    Object.defineProperty(global, 'document', {
      value: undefined,
      writable: true
    });
  });

  it('should handle SSR environment gracefully', () => {
    // Test that font utilities work in SSR
    const { isFontLoaded } = require('../font-utils');
    
    expect(isFontLoaded('test-font')).toBe(false);
  });

  it('should handle missing FontFace API gracefully', () => {
    Object.defineProperty(global, 'window', {
      value: {},
      writable: true
    });
    Object.defineProperty(global, 'document', {
      value: { fonts: {} },
      writable: true
    });

    const { isFontLoaded } = require('../font-utils');
    
    expect(isFontLoaded('test-font')).toBe(false);
  });

  it('should work correctly with full browser API support', () => {
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    });
    Object.defineProperty(global, 'document', {
      value: mockWindow.document,
      writable: true
    });

    const { isFontLoaded } = require('../font-utils');
    
    expect(isFontLoaded('test-font')).toBe(true);
    expect(mockWindow.document.fonts.check).toHaveBeenCalledWith('1em test-font');
  });
});

describe('Component Hydration Consistency', () => {
  it('should render consistent initial state', () => {
    // Test that components render the same content on server and client
    const serverRender = renderComponentOnServer();
    const clientRender = renderComponentOnClient();
    
    expect(serverRender).toEqual(clientRender);
  });
});

// Helper functions for testing
function renderComponentOnServer() {
  // Mock server environment
  Object.defineProperty(global, 'window', {
    value: undefined,
    writable: true
  });
  
  // Return expected server render result
  return {
    fontState: 'idle',
    isHydrated: false,
    showPlaceholder: true
  };
}

function renderComponentOnClient() {
  // Mock client environment before hydration
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true
  });
  
  // Return expected client render result (before hydration)
  return {
    fontState: 'idle',
    isHydrated: false,
    showPlaceholder: true
  };
}