# Design Document

## Overview

현재 PDF 생성 시스템에서 원문의 줄바꿈이 그대로 반영되어 손글씨 연습에 적합하지 않은 문제를 해결하기 위한 설계입니다. 텍스트 전처리 단계에서 줄바꿈을 제거하고 연속적인 텍스트 흐름을 만들어 자연스러운 손글씨 연습 환경을 제공합니다.

## Architecture

### 현재 시스템 분석

현재 시스템은 다음과 같은 구조로 텍스트를 처리합니다:

1. **텍스트 입력** → `app/actions/pdf-generator.ts`
2. **텍스트 전처리** → `lib/text-distributor.ts`의 `preprocessTextOptimized()` 메서드
3. **문장 분할** → `splitIntoSentencesOptimized()` 메서드
4. **페이지 분배** → `distributeToPages()` 메서드
5. **PDF 생성** → `lib/pdf-server-utils.ts`

### 수정이 필요한 지점

현재 `preprocessTextOptimized()` 메서드는 단순히 연속된 공백을 하나로 합치는 정도의 처리만 하고 있습니다:

```typescript
return nonEmptyTexts
  .join(' ')
  .replace(/\s+/g, ' ') // 연속된 공백을 하나로
  .trim();
```

이 부분을 개선하여 줄바꿈을 적절히 처리해야 합니다.

## Components and Interfaces

### 1. 텍스트 전처리 개선

**위치**: `lib/text-distributor.ts`의 `preprocessTextOptimized()` 메서드

**기능**:
- 단일 줄바꿈(`\n`)을 공백으로 변환
- 문단 구분(연속된 줄바꿈 `\n\n`)은 유지
- 연속된 공백 정규화

### 2. 새로운 텍스트 정규화 유틸리티

**위치**: `lib/text-distributor.ts` 내부 메서드

**인터페이스**:
```typescript
private normalizeLineBreaks(text: string): string {
  // 문단 구분 보존하면서 줄바꿈 처리
}

private preserveParagraphStructure(text: string): string {
  // 문단 구조 유지 로직
}
```

### 3. 설정 옵션 추가

**위치**: `lib/constants.ts`의 `TEXT_DISTRIBUTION_CONFIG`

**새로운 설정**:
```typescript
export const TEXT_DISTRIBUTION_CONFIG = {
  // 기존 설정들...
  IGNORE_SINGLE_LINE_BREAKS: true,
  PRESERVE_PARAGRAPH_BREAKS: true,
  PARAGRAPH_BREAK_PATTERN: /\n\s*\n/g,
  SINGLE_LINE_BREAK_PATTERN: /(?<!\n)\n(?!\n)/g
};
```

## Data Models

### TextNormalizationOptions

```typescript
interface TextNormalizationOptions {
  ignoreSingleLineBreaks: boolean;
  preserveParagraphBreaks: boolean;
  normalizeWhitespace: boolean;
  paragraphSeparator: string;
}
```

### ProcessedTextResult

```typescript
interface ProcessedTextResult {
  normalizedText: string;
  paragraphCount: number;
  originalLineBreaks: number;
  removedLineBreaks: number;
}
```

## Error Handling

### 1. 입력 검증

- 빈 텍스트 배열 처리
- null/undefined 텍스트 필터링
- 매우 긴 텍스트에 대한 메모리 보호

### 2. 정규식 오류 처리

- 정규식 실행 실패 시 원본 텍스트 반환
- 무한 루프 방지를 위한 실행 횟수 제한

### 3. 성능 모니터링

- 텍스트 정규화 시간 측정
- 메모리 사용량 모니터링
- 캐시 효율성 추적

## Testing Strategy

### 1. 단위 테스트

**테스트 파일**: `lib/__tests__/text-distributor.test.ts` 확장

**테스트 케이스**:
- 단일 줄바꿈 제거 테스트
- 문단 구분 보존 테스트
- 연속된 공백 정규화 테스트
- 빈 텍스트 처리 테스트
- 매우 긴 텍스트 처리 테스트

### 2. 통합 테스트

**테스트 시나리오**:
- 실제 PDF 생성 과정에서 텍스트 정규화 확인
- 다양한 텍스트 형태(시, 소설, 기술 문서 등)에 대한 처리 검증
- 성능 벤치마크 테스트

### 3. 시각적 검증

- 생성된 PDF에서 텍스트 흐름 확인
- 문단 구분이 적절히 유지되는지 확인
- 손글씨 연습에 적합한 레이아웃인지 확인

## Implementation Details

### 1. 정규식 패턴

```typescript
// 문단 구분 패턴 (두 개 이상의 연속된 줄바꿈)
const PARAGRAPH_BREAK_PATTERN = /\n\s*\n/g;

// 단일 줄바꿈 패턴 (앞뒤로 줄바꿈이 없는 단일 \n)
const SINGLE_LINE_BREAK_PATTERN = /(?<!\n)\n(?!\n)/g;

// 연속된 공백 정규화
const WHITESPACE_PATTERN = /\s+/g;
```

### 2. 처리 순서

1. 문단 구분 마커로 임시 치환 (`\n\n` → `__PARAGRAPH_BREAK__`)
2. 단일 줄바꿈을 공백으로 치환 (`\n` → ` `)
3. 연속된 공백 정규화 (`\s+` → ` `)
4. 문단 구분 마커 복원 (`__PARAGRAPH_BREAK__` → `\n\n`)
5. 최종 정리 (trim, 빈 줄 정리)

### 3. 성능 최적화

- 정규식 컴파일 캐싱
- 텍스트 길이별 처리 방식 최적화
- 메모리 사용량 모니터링

### 4. 호환성 보장

- 기존 API 인터페이스 유지
- 기존 설정 옵션과의 호환성
- 점진적 적용 가능한 구조

## Migration Strategy

### Phase 1: 기본 구현
- `preprocessTextOptimized()` 메서드 수정
- 기본적인 줄바꿈 처리 로직 구현

### Phase 2: 고급 기능
- 문단 구분 보존 로직 추가
- 설정 옵션을 통한 동작 제어

### Phase 3: 최적화
- 성능 튜닝
- 캐싱 메커니즘 개선
- 메모리 사용량 최적화

## Backward Compatibility

- 기존 `TextDistributor` 클래스 인터페이스 유지
- 새로운 기능은 기본값으로 활성화
- 필요시 기존 동작으로 되돌릴 수 있는 설정 제공