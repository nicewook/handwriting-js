# 멀티페이지 PDF 생성 기능

핸드라이팅 연습 시트 생성기에 멀티페이지 PDF 생성 기능이 추가되었습니다. 이제 최대 50페이지까지의 연습 시트를 생성할 수 있습니다.

## 🚀 새로운 기능

### 멀티페이지 PDF 생성
- **페이지 제한**: 1-50페이지까지 설정 가능
- **지능적 텍스트 분배**: 문장과 단락을 보존하며 텍스트를 여러 페이지에 분배
- **자동 페이지 번호**: "Page X of Y" 형식으로 페이지 번호 자동 추가
- **일관된 가이드라인**: 모든 페이지에 동일한 4-Zone 가이드라인 적용

### 사용자 인터페이스 개선
- **페이지 제한 선택기**: 슬라이더와 입력 필드로 페이지 수 조정
- **페이지 수 미리보기**: 실시간으로 예상 페이지 수 표시
- **향상된 다운로드 버튼**: 멀티페이지 생성 진행 상황 표시
- **오류 처리**: 자동 재시도 및 설정 조정 제안

### 성능 최적화
- **메모리 관리**: 대용량 문서 처리를 위한 자동 메모리 최적화
- **캐싱 시스템**: 텍스트 처리 속도 향상을 위한 지능적 캐싱
- **진행 상황 표시**: 사용자에게 생성 진행 상황 실시간 피드백

## 📖 사용 방법

### 1. 기본 사용법

1. **텍스트 선택**: 원하는 연습 텍스트를 선택합니다
2. **폰트 크기 조정**: 14px, 18px, 24px 중 선택합니다
3. **페이지 수 설정**: 1-50페이지 중 원하는 페이지 수를 설정합니다
4. **미리보기 확인**: 예상 페이지 수와 설정을 확인합니다
5. **PDF 다운로드**: 다운로드 버튼을 클릭하여 PDF를 생성합니다

### 2. 페이지 제한 설정

```typescript
// 페이지 제한 범위
const PAGE_LIMITS = {
  MIN: 1,      // 최소 1페이지
  MAX: 50,     // 최대 50페이지
  DEFAULT: 10  // 기본 10페이지
};
```

### 3. 텍스트 옵션

- **클래식 연습 문장**: 기본 영어 연습 문장
- **모비딕**: 허먼 멜빌의 대표작 발췌
- **안나 카레니나**: 레프 톨스토이의 걸작 발췌
- **두 도시 이야기**: 찰스 디킨스의 명작 발췌

## 🛠️ 기술적 세부사항

### 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Controls   │───▶│  PDF Generator   │───▶│   Multi-Page    │
│                 │    │                  │    │   PDF Output    │
│ - Page Limit    │    │ - Text Splitter  │    │                 │
│ - Text Options  │    │ - Page Manager   │    │ - Page Numbers  │
│ - Size Options  │    │ - Layout Engine  │    │ - Consistent    │
│                 │    │                  │    │   Guidelines    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 핵심 컴포넌트

#### 1. TextDistributor
텍스트를 여러 페이지에 지능적으로 분배하는 클래스입니다.

```typescript
const distributor = new TextDistributor(font, fontSize);
const result = distributor.distributeText(texts, pageLimit);
```

**주요 기능:**
- 문장 단위 분할 및 보존
- 페이지 용량 계산
- 텍스트 측정 및 줄바꿈
- 성능 최적화를 위한 캐싱

#### 2. PageManager
PDF 페이지 레이아웃과 페이지 번호를 관리하는 클래스입니다.

```typescript
const pageManager = new PageManager(font, fontSize, pageLimit);
const pages = await pageManager.createPages(doc, pageContents, customFont);
```

**주요 기능:**
- 4-Zone 가이드라인 그리기
- 페이지 번호 추가
- 일관된 레이아웃 유지
- 텍스트 렌더링

#### 3. UI 컴포넌트

**PageLimitSelector**: 페이지 수 선택 컴포넌트
```typescript
<PageLimitSelector
  selectedLimit={pageLimit}
  onLimitChange={setPageLimit}
/>
```

**PageCountPreview**: 페이지 수 미리보기 컴포넌트
```typescript
<PageCountPreview
  selectedTextId={selectedTextId}
  selectedSize={selectedSize}
  pageLimit={pageLimit}
/>
```

### 성능 최적화

#### 메모리 관리
```typescript
import { getCurrentMemoryUsage, autoAdjustPageLimit } from './performance-utils';

// 메모리 상황에 따른 자동 페이지 조정
const { adjustedPages, reason } = autoAdjustPageLimit(requestedPages, textLength);
```

#### 캐싱 시스템
- **폰트 메트릭 캐시**: 폰트 측정 결과 캐싱
- **텍스트 측정 캐시**: 텍스트 크기 계산 결과 캐싱
- **문장 분할 캐시**: 문장 분할 결과 캐싱

## 🔧 설정 옵션

### 멀티페이지 설정

```typescript
// lib/constants.ts
export const MULTI_PAGE_CONFIG = {
  MIN_PAGES: 1,
  MAX_PAGES: 50,
  DEFAULT_PAGE_LIMIT: 10,
  PAGE_LIMIT_STEP: 1
};

export const PAGE_NUMBER_CONFIG = {
  POSITION: 'bottom-center',
  MARGIN_FROM_BOTTOM: 15,
  FONT_SIZE: 10,
  FORMAT: 'detailed', // 'simple' | 'detailed'
  INCLUDE_FIRST_PAGE: true
};
```

### 텍스트 분배 설정

```typescript
export const TEXT_DISTRIBUTION_CONFIG = {
  PRESERVE_SENTENCES: true,
  PRESERVE_PARAGRAPHS: true,
  MIN_LINES_PER_PAGE: 5,
  SENTENCE_BREAK_PENALTY: 100,
  PARAGRAPH_BREAK_PENALTY: 200,
  MIN_CHARS_PER_LINE: 10,
  MAX_CHARS_PER_LINE: 120
};
```

## 🚨 오류 처리

### 자동 복구 기능
- **메모리 부족**: 자동으로 페이지 수 조정
- **생성 시간 초과**: 재시도 또는 단일 페이지로 폴백
- **텍스트 분배 실패**: 대체 알고리즘 사용

### 사용자 피드백
- **재시도 버튼**: 최대 3회까지 자동 재시도
- **최적화된 설정**: 메모리 상황에 맞는 설정 제안
- **단일 페이지 폴백**: 멀티페이지 실패 시 단일 페이지로 생성

## 📊 성능 지표

### 권장 사양
- **메모리**: 최소 2GB RAM
- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+
- **페이지 수**: 일반적으로 20페이지 이하 권장

### 성능 벤치마크
- **1-10페이지**: 1-3초
- **11-25페이지**: 3-8초
- **26-50페이지**: 8-15초

## 🧪 테스트

### 단위 테스트
```typescript
import { runAllTests } from './lib/__tests__/text-distributor.test';
runAllTests();
```

### 통합 테스트
```typescript
import { runIntegrationTests } from './lib/integration-test';
runIntegrationTests();
```

## 🔮 향후 계획

### 예정된 기능
- [ ] 커스텀 텍스트 입력 지원
- [ ] 다양한 페이지 번호 스타일
- [ ] PDF 품질 설정 옵션
- [ ] 배치 생성 기능
- [ ] 템플릿 저장/불러오기

### 성능 개선
- [ ] 웹 워커를 이용한 백그라운드 처리
- [ ] 스트리밍 PDF 생성
- [ ] 더 정확한 텍스트 측정
- [ ] 폰트 서브셋 최적화

## 📞 지원

문제가 발생하거나 제안사항이 있으시면 이슈를 등록해주세요.

### 일반적인 문제 해결

**Q: PDF 생성이 너무 오래 걸려요**
A: 페이지 수를 줄이거나 더 짧은 텍스트를 선택해보세요. 브라우저의 메모리 상황도 확인해주세요.

**Q: 일부 텍스트가 잘려서 나와요**
A: 페이지 제한을 늘리거나 더 작은 폰트 크기를 선택해보세요.

**Q: 페이지 번호가 표시되지 않아요**
A: 단일 페이지 모드에서는 페이지 번호가 표시되지 않습니다. 2페이지 이상으로 설정해주세요.

---

**버전**: 1.0.0  
**최종 업데이트**: 2024년 12월