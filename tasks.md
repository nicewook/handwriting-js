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

### 4단계: Server Actions 구현
- [ ] `app/actions/pdf-generator.ts` 생성
- [ ] 기존 PDF 생성 로직 포팅
- [ ] 폰트 선택 및 사이즈 매개변수 처리
- [ ] PDF 바이너리 반환 로직

### 5단계: UI 컴포넌트 개발
- [ ] `FontSelector` - 폰트 선택 드롭다운
- [ ] `SizeSelector` - 사이즈 선택 (소/중/대)
- [ ] `PreviewSection` - 실시간 폰트 미리보기
- [ ] `DownloadButton` - PDF 생성 및 다운로드
- [ ] 메인 페이지 레이아웃 구성

### 6단계: 미리보기 기능
- [ ] 웹 폰트 CSS 로딩
- [ ] "The quick brown fox..." 샘플 텍스트 표시
- [ ] 3가지 사이즈로 미리보기 (14px, 18px, 24px)
- [ ] 폰트 변경시 실시간 업데이트

### 7단계: PDF 다운로드 구현
- [ ] Server Action과 폼 연결
- [ ] 클라이언트 사이드 다운로드 처리
- [ ] 로딩 상태 표시
- [ ] 에러 처리 및 사용자 피드백

### 8단계: 최적화 및 마무리
- [ ] 성능 최적화 (폰트 로딩, PDF 생성)
- [ ] 반응형 디자인 적용
- [ ] 접근성 개선
- [ ] 코드 정리 및 주석 추가

### 9단계: 배포 준비
- [ ] Vercel 배포 설정
- [ ] 환경 변수 구성 (필요시)
- [ ] 프로덕션 빌드 테스트
- [ ] 배포 및 테스트

## 파일 구조 (최종)
```
handwriting-next/
├── app/
│   ├── page.tsx             # 메인 페이지
│   ├── layout.tsx           # 루트 레이아웃
│   ├── globals.css          # Tailwind CSS
│   ├── actions/
│   │   └── pdf-generator.ts # Server Actions
│   └── components/
│       ├── FontSelector.tsx # 폰트 선택
│       ├── SizeSelector.tsx # 사이즈 선택
│       ├── PreviewSection.tsx # 미리보기
│       └── DownloadButton.tsx # 다운로드
├── public/
│   └── fonts/              # 폰트 파일들
├── lib/
│   ├── fonts.ts           # 폰트 메타데이터
│   ├── pdf-utils.ts       # PDF 생성 유틸리티
│   └── constants.ts       # 상수 정의
├── backup/                # 기존 코드 백업
└── package.json
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
- 🔄 다음: Server Actions 구현 (4단계)

## 참고사항
- 기존 PDF 생성 로직은 `backup/main.js`에서 참조 가능
- 폰트 파일은 `backup/RobotoMono-ExtraLightItalic.ttf` 위치
- 4-Zone 가이드라인 시스템 로직 재사용 필요
- Vercel 무료 배포 목표
- TypeScript 사용으로 파일 확장자 .ts/.tsx 사용
- **안정적인 버전 사용**: Next.js 14.2.30 + React 18 + Tailwind CSS 3.4