# Design Document

## Overview

The hydration error occurs because components have different initial states between server-side rendering (SSR) and client-side hydration. The main issues are:

1. Font loading state starts as 'idle' on server but immediately changes to 'loading' on client
2. Page count estimation triggers useEffect only on client, causing content differences
3. Browser API dependencies (document, FontFace) are not available during SSR

The solution involves implementing consistent initial states, proper client-side checks, and deferred hydration for dynamic content.

## Architecture

### Hydration-Safe State Management

```
Server Render → Client Hydration → Dynamic Updates
     ↓               ↓                    ↓
Same Initial    Same Initial      Different States OK
   State          State           (after hydration)
```

### Component Rendering Strategy

1. **Static First Render**: Components render with static, predictable content initially
2. **Post-Hydration Updates**: Dynamic content loads after React hydration completes
3. **Progressive Enhancement**: Features gracefully upgrade from static to dynamic

## Components and Interfaces

### 1. Hydration-Safe Hook Pattern

```typescript
interface HydrationSafeState<T> {
  isHydrated: boolean;
  value: T;
}

function useHydrationSafeState<T>(
  initialValue: T,
  clientValue?: T
): HydrationSafeState<T>
```

### 2. Font Loading State Management

**Current Issues:**
- `useFontLoader` starts with 'idle' then immediately goes to 'loading'
- Font face loading uses browser APIs not available during SSR

**Solution:**
```typescript
interface FontState {
  status: 'hydrating' | 'loading' | 'loaded' | 'error';
  isHydrated: boolean;
}
```

### 3. Page Count Estimation

**Current Issues:**
- `useEffect` runs only on client, causing content mismatch
- Calculations happen immediately on mount

**Solution:**
- Render placeholder content during SSR
- Defer calculations until after hydration
- Use consistent loading states

### 4. Preview Section Rendering

**Current Issues:**
- Font state affects rendered content immediately
- Dynamic styling based on loading state

**Solution:**
- Static preview content during initial render
- Progressive enhancement after hydration

## Data Models

### HydrationState

```typescript
type HydrationState = 'server' | 'hydrating' | 'hydrated';

interface ComponentState {
  hydrationState: HydrationState;
  isReady: boolean;
}
```

### FontLoadingState (Updated)

```typescript
interface FontLoadingState {
  status: 'hydrating' | 'loading' | 'loaded' | 'error';
  isHydrated: boolean;
  font?: FontInfo;
}
```

## Error Handling

### Hydration Mismatch Prevention

1. **Consistent Initial States**: All components start with same state on server and client
2. **Deferred Dynamic Content**: Complex calculations happen after hydration
3. **Fallback Rendering**: Graceful degradation when browser APIs unavailable

### Font Loading Errors

1. **Graceful Fallback**: Use system fonts when custom fonts fail
2. **Error Boundaries**: Prevent font loading errors from crashing the app
3. **Retry Mechanism**: Attempt font loading recovery

## Testing Strategy

### Hydration Testing

1. **SSR/Client Consistency Tests**: Verify identical initial renders
2. **Hydration Simulation**: Test server render → client hydration flow
3. **State Transition Tests**: Verify proper state changes after hydration

### Font Loading Tests

1. **Loading State Tests**: Verify consistent font loading states
2. **Error Handling Tests**: Test font loading failure scenarios
3. **Performance Tests**: Ensure font loading doesn't block rendering

### Integration Tests

1. **Full Page Hydration**: Test complete page hydration flow
2. **Component Interaction**: Verify components work together after hydration
3. **Browser Compatibility**: Test across different browsers and environments

## Implementation Approach

### Phase 1: Core Hydration Fixes
- Implement `useHydrationSafe` hook
- Fix font loading state management
- Update preview section rendering

### Phase 2: Component Updates
- Update `PageCountPreview` for hydration safety
- Fix dynamic content rendering
- Add proper client-side checks

### Phase 3: Testing and Validation
- Add hydration tests
- Verify fix across all components
- Performance optimization

## Key Design Decisions

1. **Hydration-First Approach**: Design components to be hydration-safe from the start
2. **Progressive Enhancement**: Start with static content, enhance with dynamic features
3. **Consistent State Management**: Use patterns that ensure server/client state consistency
4. **Graceful Degradation**: Ensure functionality works even when dynamic features fail