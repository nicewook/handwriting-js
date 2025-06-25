# 핸드라이팅 연습 웹앱 개발 계획

## 프로젝트 개요
기존 Node.js PDF 생성기를 Next.js + Server Actions 기반 웹앱으로 전환

## 사용자 요구사항
1. **폰트 선택 가능** - 현재 1개 → 여러 개 폰트 지원
2. **폰트 사이즈 선택 가능** - 3단계 (소/중/대)
3. **폰트 선택시 샘플 문장 미리보기** - "The quick brown fox jumps over the lazy dog" 3가지 사이즈로 표시
4. **다운로드 버튼** - PDF 생성 및 다운로드

## 기술 스택
- **Next.js 14** (App Router) - 안정적인 버전
- **React 18** - 호환성 최적화
- **Server Actions** (PDF 생성)
- **Tailwind CSS 3.4** (스타일링)
- **pdf-lib + opentype.js** (기존 PDF 로직 재사용)

## 구현 단계

### ✅ 1단계: 프로젝트 준비
- [x] 기존 코드 백업 (`backup/` 폴더로 이동)
- [x] Next.js 14 + React 18 프로젝트 초기화 (안정적인 버전)
- [x] Tailwind CSS 3.4 설정 완료
- [x] 기존 dependencies 마이그레이션 (pdf-lib, opentype.js, @pdf-lib/fontkit)
- [x] tasks.md 파일 생성

### ✅ 2단계: 기본 구조 설정
- [x] 프로젝트 폴더 구조 생성 (lib/, app/components/, app/actions/)
- [x] 폰트 파일들을 `public/fonts/`로 이동 (3개 폰트 파일 추가)
- [x] 기본 레이아웃 및 페이지 생성 (핸드라이팅 연습 시트 UI)
- [x] Tailwind CSS 글로벌 스타일 설정
- [x] 개발 서버 시작 및 기본 페이지 확인 (localhost:3000)

### ✅ 3단계: 폰트 관리 시스템
- [x] 폰트 메타데이터 정의 (`lib/fonts.ts`) - 3개 폰트 메타데이터 구조화
- [x] 폰트 목록 관리 유틸리티 함수 (`lib/font-utils.ts`) - 로딩, 유효성 검사 등
- [x] 추가 폰트 파일 수집 (3개) - RobotoMono, JetBrainsMono, SourceCodePro
- [x] 폰트 로딩 최적화 - 웹폰트 CSS, FontFace API, 로딩 훅 구현
- [x] UI 컴포넌트 구현 - FontSelector, SizeSelector, PreviewSection, DownloadButton
- [x] 메인 페이지 통합 - 상태 관리 및 컴포넌트 연동

### ✅ 4단계: Server Actions 구현
- [x] `app/actions/pdf-generator.ts` 생성 - PDF 생성 Server Action 구현
- [x] 기존 PDF 생성 로직 포팅 (`lib/pdf-utils.ts`) - 4-Zone 시스템 완전 재구현
- [x] 폰트 선택 및 사이즈 매개변수 처리 - FormData 기반 매개변수 검증
- [x] PDF 바이너리 반환 로직 - Uint8Array 반환 및 다운로드 처리
- [x] 폰트 메트릭 동적 계산 - OpenType.js 기반 폰트 분석
- [x] 자동 줄바꿈 시스템 - 지능형 텍스트 래핑
- [x] 클라이언트 다운로드 처리 - Blob API 기반 파일 다운로드
- [x] 핵심 로직 문서화 - PDF_GENERATION_GUIDE.md 생성

### ✅ 5단계: UI 컴포넌트 개발 (3단계에서 완료됨)
- [x] `FontSelector` - 폰트 선택 드롭다운 (로딩 상태, 미리보기 포함)
- [x] `SizeSelector` - 사이즈 선택 (소/중/대)
- [x] `PreviewSection` - 실시간 폰트 미리보기
- [x] `DownloadButton` - PDF 생성 및 다운로드 (Server Action 연동)
- [x] 메인 페이지 레이아웃 구성

### ✅ 6단계: 미리보기 기능 (3단계에서 완료됨)
- [x] 웹 폰트 CSS 로딩 - @font-face 및 FontFace API
- [x] "The quick brown fox..." 샘플 텍스트 표시
- [x] 3가지 사이즈로 미리보기 (소/중/대 전체 비교)
- [x] 폰트 변경시 실시간 업데이트

### ✅ 7단계: PDF 다운로드 구현 (4단계에서 완료됨)
- [x] Server Action과 폼 연결 - generatePDF 함수 호출
- [x] 클라이언트 사이드 다운로드 처리 - Blob API 활용
- [x] 로딩 상태 표시 - 진행 상황 세부 표시
- [x] 에러 처리 및 사용자 피드백 - 상세한 오류 메시지

### 8단계: 최적화 및 마무리
- [x] 성능 최적화 (폰트 로딩, PDF 생성) - 폰트 미리 로딩, 메모리 관리
- [x] 반응형 디자인 적용 - 모바일/데스크톱 최적화
- [x] 접근성 개선 - 키보드 네비게이션, 스크린 리더 지원
- [x] 코드 정리 및 주석 추가 - TypeScript 타입 안정성

### 9단계: 배포 준비
- [ ] Vercel 배포 설정
- [ ] 환경 변수 구성 (필요시)
- [ ] 프로덕션 빌드 테스트
- [ ] 배포 및 테스트
- [ ] 최종 기능 검증

## 파일 구조 (현재)
```
handwriting-js/
├── app/
│   ├── page.tsx             # 메인 페이지 (상태 관리 및 컴포넌트 통합)
│   ├── layout.tsx           # 루트 레이아웃 
│   ├── globals.css          # Tailwind CSS + 웹폰트 정의
│   ├── actions/
│   │   └── pdf-generator.ts # PDF 생성 Server Actions
│   └── components/
│       ├── FontSelector.tsx # 폰트 선택 + 로딩 상태
│       ├── SizeSelector.tsx # 사이즈 선택 (소/중/대)
│       ├── PreviewSection.tsx # 실시간 미리보기
│       └── DownloadButton.tsx # PDF 다운로드 + 진행 상황
├── public/
│   └── fonts/              # 폰트 파일들 (3개)
│       ├── RobotoMono-ExtraLightItalic.ttf
│       ├── JetBrainsMono-ExtraLightItalic.ttf
│       └── SourceCodePro-ExtraLightItalic.ttf
├── lib/
│   ├── fonts.ts           # 폰트 메타데이터 및 유틸리티
│   ├── font-utils.ts      # 폰트 로딩 및 검증 유틸리티
│   ├── pdf-utils.ts       # PDF 생성 핵심 로직
│   ├── constants.ts       # 4-Zone 시스템 상수
│   └── hooks/
│       └── useFontLoader.ts # 폰트 로딩 React Hook
├── backup/                # 기존 코드 백업
│   ├── main.js           # 원본 PDF 생성 로직
│   ├── RobotoMono-ExtraLightItalic.ttf
│   └── ...
├── PDF_GENERATION_GUIDE.md # 핵심 로직 문서화
├── tasks.md              # 개발 진행 상황 관리
└── package.json          # dependencies 포함
```

## 현재 진행 상황
- ✅ 기존 코드 백업 완료
- ✅ Next.js 14 + React 18 프로젝트 초기화 완료 (안정적인 버전)
- ✅ 필요한 dependencies 설치 완료
- ✅ 프로젝트 계획 수립 완료
- ✅ 기본 구조 설정 완료 (2단계)
- ✅ 폰트 파일 3개 추가 (RobotoMono, JetBrainsMono, SourceCodePro)
- ✅ 기본 UI 레이아웃 구현 완료
- ✅ 폰트 관리 시스템 구현 완료 (3단계)
- ✅ 웹폰트 로딩 시스템 및 UI 컴포넌트 완성
- ✅ **핵심 Server Actions 구현 완료 (4단계)**
- ✅ **4-Zone 가이드라인 시스템 완전 재구현**
- ✅ **실시간 PDF 생성 및 다운로드 기능 완성**
- ✅ **핵심 로직 문서화 (PDF_GENERATION_GUIDE.md)**
- 🔄 다음: 배포 준비 (9단계)

## 참고사항

### 핵심 기능
- **4-Zone 가이드라인 시스템**: 정밀한 폰트 메트릭 기반 가이드라인 생성
- **동적 폰트 크기 계산**: OpenType.js를 활용한 폰트별 최적 크기 자동 산출
- **실시간 미리보기**: 웹폰트 로딩과 연동된 WYSIWYG 미리보기
- **Server Actions**: Next.js 14의 최신 서버 사이드 처리 기능 활용

### 기술적 특징
- **안정적인 버전**: Next.js 14.2.30 + React 18 + Tailwind CSS 3.4
- **TypeScript 완전 지원**: 타입 안정성과 개발 경험 최적화
- **메모리 효율적**: 대용량 PDF 생성 시 메모리 관리 최적화
- **오류 처리**: 상세한 오류 메시지와 복구 로직

### 문서화
- **핵심 로직**: `PDF_GENERATION_GUIDE.md` 상세 설명
- **진행 상황**: `tasks.md` 실시간 업데이트
- **원본 로직**: `backup/main.js` 참조 가능

### 배포 정보
- **목표 플랫폼**: Vercel 무료 배포
- **서버리스**: Next.js Server Actions → Vercel Functions 자동 변환
- **정적 자산**: 폰트 파일 CDN 배포