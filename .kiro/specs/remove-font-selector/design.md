# Design Document

## Overview

이 설계는 핸드라이팅 연습 시트 생성기에서 폰트 선택 기능을 제거하고 Roboto Mono 폰트를 기본값으로 고정하는 기능을 구현합니다. 현재 시스템은 여러 폰트(Roboto Mono, JetBrains Mono, Source Code Pro) 중에서 선택할 수 있도록 되어 있지만, 사용자 경험을 단순화하기 위해 Roboto Mono만 사용하도록 변경합니다.

## Architecture

### 현재 아키텍처 분석

현재 시스템은 다음과 같은 구조로 되어 있습니다:

1. **폰트 관리 계층**
   - `lib/fonts.ts`: 폰트 메타데이터 및 설정 관리
   - `AVAILABLE_FONTS` 배열에 3개 폰트 정의
   - `DEFAULT_FONT_ID`로 기본 폰트 설정

2. **UI 계층**
   - `app/components/FontSelector.tsx`: 폰트 선택 컴포넌트
   - `app/page.tsx`: 메인 페이지에서 FontSelector 사용

3. **폰트 로딩 계층**
   - `lib/hooks/useFontLoader.ts`: 폰트 로딩 상태 관리
   - 모든 폰트를 미리 로딩하는 로직

4. **PDF 생성 계층**
   - `app/actions/pdf-generator.ts`: 서버 액션
   - `lib/pdf-utils.ts`: PDF 생성 유틸리티

### 목표 아키텍처

변경 후 시스템은 다음과 같이 단순화됩니다:

1. **폰트 관리 계층**
   - Roboto Mono만 지원하도록 설정 단순화
   - 폰트 선택 관련 로직 제거

2. **UI 계층**
   - FontSelector 컴포넌트 제거
   - 메인 페이지에서 폰트 선택 섹션 제거

3. **폰트 로딩 계층**
   - Roboto Mono만 로딩하도록 최적화
   - 불필요한 폰트 로딩 로직 제거

4. **PDF 생성 계층**
   - 폰트 ID 매개변수 제거 또는 고정값 사용
   - Roboto Mono 폰트만 사용하도록 최적화

## Components and Interfaces

### 1. 폰트 설정 모듈 (`lib/fonts.ts`)

**변경 사항:**
- `AVAILABLE_FONTS` 배열을 Roboto Mono 하나만 포함하도록 수정
- 폰트 선택 관련 유틸리티 함수들 단순화
- 다중 폰트 지원 코드 제거

**새로운 인터페이스:**
```typescript
// 단일 폰트 설정
export const ROBOTO_MONO_FONT: FontMetadata = {
  id: 'roboto-mono',
  name: 'Roboto Mono',
  description: '',
  fileName: 'RobotoMono-ExtraLightItalic.ttf',
  fontFamily: 'RobotoMono',
  weight: '200',
  style: 'italic',
  filePath: 'assets/fonts/RobotoMono-ExtraLightItalic.ttf',
  webFilePath: '/fonts/RobotoMono-ExtraLightItalic.ttf'
};

// 단순화된 폰트 가져오기 함수
export function getDefaultFont(): FontMetadata {
  return ROBOTO_MONO_FONT;
}
```

### 2. 메인 페이지 컴포넌트 (`app/page.tsx`)

**변경 사항:**
- FontSelector 컴포넌트 import 및 사용 제거
- `selectedFontId` 상태 제거
- 폰트 선택 섹션 UI 제거
- 고정된 폰트 ID를 다른 컴포넌트에 전달

**새로운 구조:**
```typescript
export default function Home() {
  // 폰트 관련 상태 제거
  const [selectedSize, setSelectedSize] = useState(DEFAULT_FONT_SIZE);
  const [selectedTextId, setSelectedTextId] = useState<TextOptionId>(DEFAULT_TEXT_OPTION_ID);
  
  // 고정된 폰트 ID 사용
  const fontId = 'roboto-mono';
  
  return (
    // FontSelector 섹션 제거된 UI
  );
}
```

### 3. 폰트 로딩 훅 (`lib/hooks/useFontLoader.ts`)

**변경 사항:**
- 단일 폰트만 로딩하도록 최적화
- 폰트 배열 순회 로직을 단일 폰트 로직으로 변경
- 불필요한 상태 관리 로직 제거

**새로운 구조:**
```typescript
export function useFontLoader() {
  const [fontState, setFontState] = useState<FontLoadingState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeFont = useCallback(async () => {
    // Roboto Mono만 로딩
  }, []);

  return {
    fontState,
    isInitialized,
    isFontReady: () => fontState === 'loaded',
    loadingCount: fontState === 'loading' ? 1 : 0,
    errorCount: fontState === 'error' ? 1 : 0
  };
}
```

### 4. PDF 생성 액션 (`app/actions/pdf-generator.ts`)

**변경 사항:**
- `fontId` 매개변수를 선택적으로 만들거나 제거
- 항상 Roboto Mono 폰트 사용하도록 로직 수정
- 폰트 검증 로직 단순화

**새로운 인터페이스:**
```typescript
export async function generatePDF(formData: FormData): Promise<PDFGenerationResult> {
  // fontId를 formData에서 가져오지 않고 고정값 사용
  const fontId = 'roboto-mono';
  const font = getDefaultFont();
  
  // 나머지 로직은 동일
}
```

## Data Models

### FontMetadata (수정됨)

기존 인터페이스는 유지하되, 실제 사용되는 데이터는 Roboto Mono 하나만:

```typescript
export interface FontMetadata {
  id: string;           // 'roboto-mono' 고정
  name: string;         // 'Roboto Mono' 고정
  description: string;
  fileName: string;
  fontFamily: string;
  weight: string;
  style: string;
  filePath: string;
  webFilePath: string;
}
```

### 상태 관리 모델 (단순화됨)

```typescript
// 메인 페이지 상태 (폰트 관련 상태 제거)
interface MainPageState {
  selectedSize: number;           // 유지
  selectedTextId: TextOptionId;   // 유지
  // selectedFontId 제거
}

// 폰트 로딩 상태 (단순화됨)
interface FontLoaderState {
  fontState: FontLoadingState;    // 단일 상태
  isInitialized: boolean;
  // 배열 기반 상태들 제거
}
```

## Error Handling

### 1. 폰트 로딩 실패 처리

**현재:** 여러 폰트 중 일부가 실패해도 다른 폰트 사용 가능
**변경 후:** Roboto Mono 로딩 실패 시 명확한 오류 메시지 및 폴백 처리

```typescript
// 폰트 로딩 실패 시 처리
if (fontState === 'error') {
  // 사용자에게 명확한 오류 메시지 표시
  // 시스템 폰트로 폴백 또는 재시도 옵션 제공
}
```

### 2. PDF 생성 오류 처리

**변경 사항:**
- 폰트 검증 로직 단순화 (하나의 폰트만 검증)
- 오류 메시지에서 폰트 선택 관련 안내 제거
- Roboto Mono 관련 구체적인 오류 메시지 제공

### 3. 호환성 오류 처리

**고려사항:**
- 기존 URL 매개변수나 저장된 설정에서 다른 폰트 ID가 전달될 경우
- 항상 Roboto Mono로 폴백하도록 처리

## Testing Strategy

### 1. 단위 테스트

**폰트 설정 테스트:**
- `getDefaultFont()` 함수가 항상 Roboto Mono 반환하는지 확인
- 폰트 메타데이터 구조 검증

**폰트 로딩 훅 테스트:**
- Roboto Mono 로딩 상태 변화 확인
- 로딩 실패 시 오류 상태 처리 확인

### 2. 통합 테스트

**UI 통합 테스트:**
- 메인 페이지에서 FontSelector 컴포넌트가 렌더링되지 않는지 확인
- 사이즈 선택과 텍스트 선택 기능이 정상 작동하는지 확인

**PDF 생성 테스트:**
- 다양한 사이즈와 텍스트 조합으로 PDF 생성 확인
- 생성된 PDF에서 Roboto Mono 폰트 사용 확인

### 3. E2E 테스트

**사용자 워크플로우 테스트:**
- 페이지 로드 → 사이즈 선택 → 텍스트 선택 → PDF 다운로드
- 폰트 선택 단계 없이 원활한 사용자 경험 확인

**성능 테스트:**
- 단일 폰트 로딩으로 인한 초기 로딩 시간 개선 확인
- PDF 생성 시간 변화 측정

### 4. 회귀 테스트

**기존 기능 보존:**
- 사이즈 선택 기능 정상 작동 확인
- 텍스트 선택 기능 정상 작동 확인
- PDF 품질 및 레이아웃 유지 확인

**호환성 테스트:**
- 기존 북마크나 링크에서 폰트 매개변수가 있어도 정상 작동 확인
- 브라우저별 폰트 렌더링 일관성 확인

## Implementation Considerations

### 1. 점진적 마이그레이션

**1단계:** 폰트 설정 단순화
- `lib/fonts.ts`에서 Roboto Mono만 남기기
- 기존 인터페이스 유지하여 호환성 보장

**2단계:** UI 컴포넌트 제거
- FontSelector 컴포넌트 사용 중단
- 메인 페이지에서 폰트 선택 섹션 제거

**3단계:** 로직 최적화
- 폰트 로딩 훅 단순화
- PDF 생성 로직 최적화

### 2. 성능 최적화

**폰트 로딩 최적화:**
- 단일 폰트만 로딩하므로 초기 로딩 시간 단축
- 불필요한 폰트 파일 제거 고려

**번들 크기 최적화:**
- 사용하지 않는 폰트 관련 코드 제거
- FontSelector 컴포넌트 및 관련 의존성 제거

### 3. 사용자 경험 개선

**UI 단순화:**
- 폰트 선택 단계 제거로 사용자 결정 피로 감소
- 더 직관적인 워크플로우 제공

**일관성 보장:**
- 모든 사용자가 동일한 폰트로 연습 시트 생성
- 브랜딩 및 디자인 일관성 향상

### 4. 유지보수성 향상

**코드 복잡성 감소:**
- 폰트 선택 관련 상태 관리 로직 제거
- 조건부 렌더링 및 폰트별 처리 로직 단순화

**테스트 복잡성 감소:**
- 폰트 조합별 테스트 케이스 감소
- 더 예측 가능한 동작으로 테스트 안정성 향상