# 핸드라이팅 연습 시트 PDF 생성 가이드

## 개요

이 문서는 핸드라이팅 연습 시트의 PDF 생성 시스템에 대한 핵심 로직과 구현 원리를 설명합니다. 

## 핵심 아키텍처

### 1. 폰트 분석 및 크기 계산

#### 폰트 메트릭 추출
```javascript
// OpenType.js를 사용하여 폰트 파일에서 메트릭 추출
const font = await opentype.load(fontPath);
const upem = font.unitsPerEm;              // 폰트의 기본 단위 (일반적으로 1000 또는 2048)
const x_height = font.tables.os2.sxHeight; // 소문자 x의 높이 (em 단위)
```

#### 동적 폰트 크기 계산
```javascript
// 4-Zone 시스템에서 5개 선을 동일 간격으로 배치
const line_spacing = LINE_GROUP_HEIGHT / 4; // 4개 간격 = 5개 선

// 소문자 영역 높이 (x-height 구역)
const x_height_in_pdf = line_spacing * 2; // 2개 간격

// 실제 PDF에서 사용할 폰트 크기 계산
const FONT_SIZE = (x_height_in_pdf / x_height) * upem;
```

**핵심 원리**: 폰트의 실제 x-height 메트릭을 기반으로 PDF 내 가이드라인에 정확히 맞는 폰트 크기를 역산합니다.

### 2. 4-Zone 가이드라인 시스템

#### 가이드라인 구조
```
  ┌─────────────────────────────┐ ← Ascender Line (상단선)
  │                             │   대문자와 ascender 상단
  ├─────────────────────────────┤ ← X-height Top (중간선 상단)
  │ ░░░░░░ 소문자 영역 ░░░░░░░ │   
  ├─────────────────────────────┤ ← X-height Middle (중간선 가운데) [점선]
  │ ░░░░░░ 소문자 영역 ░░░░░░░ │   
  ├─────────────────────────────┤ ← Baseline (기준선)
  │                             │   descender 영역
  └─────────────────────────────┘ ← Descender Line (하단선)
```

#### 좌표 계산 로직
```javascript
// 각 라인의 중심점을 기준으로 5개 가이드라인 배치
const group_center_y = slot_top_y - slot_height * 0.3;

// 5개 가이드라인 Y 좌표 (아래에서 위로)
const descender_line_y = group_center_y - (2 * line_spacing);  // 하단선
const baseline_y = group_center_y - line_spacing;              // 기준선
const x_height_mid_y = group_center_y;                         // 중간선 가운데
const x_height_top_y = group_center_y + line_spacing;          // 중간선 상단  
const ascender_line_y = group_center_y + (2 * line_spacing);   // 상단선
```

#### 스타일링 세부사항
- **상단선**: 검정색, 굵기 0.8pt
- **소문자 영역**: 녹색, 굵기 0.6pt + 사각형 테두리
- **중간 보조선**: 연녹색 점선, 굵기 0.3pt
- **하단선**: 빨간색, 굵기 0.6pt

### 3. 텍스트 처리 및 자동 줄바꿈

#### 지능형 줄바꿈 알고리즘
```javascript
for (const word of words) {
    const test_line = current_line + " " + word;
    const text_width = customFont.widthOfTextAtSize(test_line, FONT_SIZE);
    
    if (text_width <= drawable_width) {
        current_line = test_line;  // 현재 라인에 추가
    } else {
        wrapped_lines.push(current_line);  // 라인 완성
        current_line = word;               // 새 라인 시작
    }
}
```

**핵심 특징**:
- 단어 단위로 줄바꿈 (단어 중간 절단 방지)
- 폰트와 크기에 따른 정확한 텍스트 폭 계산
- 여백을 고려한 실제 그리기 영역 활용

#### 텍스트 배치 전략
- **짝수 라인**: 예시 텍스트 표시
- **홀수 라인**: 연습용 빈 공간
- **베이스라인 정렬**: 모든 텍스트가 기준선에 정확히 정렬

### 4. 좌표계 및 단위 변환

#### mm → PDF Points 변환
```javascript
const points = mm * (1 / 25.4) * 72;
```

**변환 공식 설명**:
- 1 인치 = 25.4mm
- 1 인치 = 72 points (PDF 표준)
- 따라서: points = mm × (1/25.4) × 72

#### 페이지 레이아웃
```javascript
// A4 페이지 마진 설정
const LEFT_MARGIN = 25mm → 70.87 points
const RIGHT_MARGIN = 25mm → 70.87 points  
const TOP_MARGIN = 20mm → 56.69 points
const BOTTOM_MARGIN = 20mm → 56.69 points

// 라인 그룹 높이
const LINE_GROUP_HEIGHT = 5.5mm → 15.59 points
```

### 5. PDF 생성 프로세스

#### 단계별 프로세스
1. **폰트 로딩**: OpenType.js로 폰트 파일 분석
2. **크기 계산**: 폰트 메트릭 기반 적정 크기 산출
3. **PDF 초기화**: pdf-lib으로 A4 문서 생성
4. **폰트 임베딩**: 커스텀 폰트를 PDF에 포함
5. **텍스트 처리**: 자동 줄바꿈으로 텍스트 분할
6. **가이드라인 그리기**: 22개 라인의 4-Zone 시스템 생성
7. **텍스트 배치**: 짝수 라인에 예시 텍스트 삽입
8. **PDF 완성**: 바이너리 데이터로 저장

## 구현 고려사항

### 폰트 호환성
- TTF 폰트 파일만 지원
- OpenType 메트릭 테이블 필수 (os2.sxHeight)
- 모노스페이스 폰트 권장 (일정한 글자 간격)

### 성능 최적화
- 폰트 파일 미리 로딩
- 텍스트 폭 계산 캐싱
- PDF 생성 비동기 처리

### 확장성 고려
- 폰트별 개별 설정 지원
- 사이즈별 라인 높이 조정
- 다국어 텍스트 지원 가능

## Server Actions 구현 시 주의사항

### 1. 파일 시스템 접근
- `public/fonts/` 경로의 폰트 파일 읽기
- Node.js 환경에서 파일 시스템 API 사용

### 2. 메모리 관리
- 대용량 폰트 파일 처리
- PDF 바이너리 데이터 효율적 전송

### 3. 오류 처리
- 폰트 로딩 실패 대응
- 잘못된 폰트 메트릭 처리
- PDF 생성 오류 복구

### 4. 보안 고려사항
- 폰트 파일 검증
- 입력 매개변수 검증
- 파일 경로 보안

## 데이터 플로우

```
User Input (fontId, sizeId) 
    ↓
Server Action Validation
    ↓  
Font File Loading & Analysis
    ↓
Font Size Calculation
    ↓
PDF Document Creation
    ↓
4-Zone Guidelines Drawing
    ↓
Text Processing & Placement
    ↓
PDF Binary Generation
    ↓
Client Download
```

이 가이드를 바탕으로 Next.js Server Actions를 구현하여 기존 로직을 웹 환경에 완벽히 포팅할 수 있습니다.