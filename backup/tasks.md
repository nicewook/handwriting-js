# 핸드라이팅 연습 웹앱 개발 계획

## 프로젝트 개요
기존 Node.js PDF 생성기를 Next.js + Server Actions 기반 웹앱으로 전환

## 사용자 요구사항
1. **폰트 선택 가능** - 현재 1개 → 여러 개 폰트 지원
2. **폰트 사이즈 선택 가능** - 3단계 (소/중/대)
3. **폰트 선택시 샘플 문장 미리보기** - "The quick brown fox jumps over the lazy dog" 3가지 사이즈로 표시
4. **다운로드 버튼** - PDF 생성 및 다운로드

## 기술 스택
- **Next.js 14** (App Router)
- **Server Actions** (PDF 생성)
- **Tailwind CSS** (스타일링)
- **pdf-lib + opentype.js** (기존 PDF 로직 재사용)

## 구현 단계

### ✅ 1단계: 프로젝트 준비
- [x] 기존 코드 백업 (`backup/` 폴더로 이동)
- [x] tasks.md 파일 생성
- [ ] Next.js 14 프로젝트 초기화
- [ ] Tailwind CSS 설정
- [ ] 기존 dependencies 마이그레이션

### 2단계: 기본 구조 설정
- [ ] 프로젝트 폴더 구조 생성
- [ ] 폰트 파일들을 `public/fonts/`로 이동
- [ ] 기본 레이아웃 및 페이지 생성
- [ ] Tailwind CSS 글로벌 스타일 설정

### 3단계: 폰트 관리 시스템
- [ ] 폰트 메타데이터 정의 (`lib/fonts.js`)
- [ ] 폰트 목록 관리 유틸리티 함수
- [ ] 추가 폰트 파일 수집 (3-5개)
- [ ] 폰트 로딩 최적화

### 4단계: Server Actions 구현
- [ ] `app/actions/pdf-generator.js` 생성
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
│   ├── page.js              # 메인 페이지
│   ├── layout.js            # 루트 레이아웃
│   ├── globals.css          # Tailwind CSS
│   ├── actions/
│   │   └── pdf-generator.js # Server Actions
│   └── components/
│       ├── FontSelector.js  # 폰트 선택
│       ├── SizeSelector.js  # 사이즈 선택
│       ├── PreviewSection.js # 미리보기
│       └── DownloadButton.js # 다운로드
├── public/
│   └── fonts/              # 폰트 파일들
├── lib/
│   ├── fonts.js           # 폰트 메타데이터
│   ├── pdf-utils.js       # PDF 생성 유틸리티
│   └── constants.js       # 상수 정의
├── backup/                # 기존 코드 백업
└── package.json
```

## 현재 진행 상황
- ✅ 기존 코드 백업 완료
- ✅ 프로젝트 계획 수립 완료
- 🔄 다음: Next.js 프로젝트 초기화

## 참고사항
- 기존 PDF 생성 로직은 `backup/main.js`에서 참조 가능
- 폰트 파일은 `backup/RobotoMono-ExtraLightItalic.ttf` 위치
- 4-Zone 가이드라인 시스템 로직 재사용 필요
- Vercel 무료 배포 목표