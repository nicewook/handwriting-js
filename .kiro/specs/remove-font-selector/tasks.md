# Implementation Plan

- [ ] 1. 폰트 설정 모듈 단순화
  - `lib/fonts.ts` 파일을 수정하여 Roboto Mono만 지원하도록 변경
  - `AVAILABLE_FONTS` 배열을 단일 Roboto Mono 객체로 교체
  - 폰트 선택 관련 유틸리티 함수들을 단순화
  - _Requirements: 2.2, 2.3_

- [ ] 2. 메인 페이지에서 폰트 선택 UI 제거
  - `app/page.tsx`에서 FontSelector 컴포넌트 import 및 사용 제거
  - `selectedFontId` 상태 변수 제거
  - 폰트 선택 섹션 UI 완전 제거
  - 고정된 'roboto-mono' ID를 다른 컴포넌트에 전달하도록 수정
  - _Requirements: 1.1, 3.1_

- [ ] 3. 폰트 로딩 훅 최적화
  - `lib/hooks/useFontLoader.ts`를 단일 폰트 로딩에 최적화
  - 폰트 배열 순회 로직을 단일 폰트 로직으로 변경
  - 불필요한 상태 관리 로직 제거
  - 로딩 상태 인터페이스 단순화
  - _Requirements: 2.3, 4.3_

- [ ] 4. PDF 생성 로직 수정
  - `app/actions/pdf-generator.ts`에서 fontId 매개변수 처리 수정
  - 항상 Roboto Mono 폰트를 사용하도록 로직 변경
  - 폰트 검증 로직을 단일 폰트에 맞게 단순화
  - _Requirements: 1.2, 4.1_

- [ ] 5. 미리보기 컴포넌트 수정
  - `app/components/PreviewSection.tsx`에서 고정된 폰트 ID 사용
  - 폰트 관련 props 처리 로직 단순화
  - _Requirements: 1.3, 4.2_

- [ ] 6. 다운로드 버튼 컴포넌트 수정
  - `app/components/DownloadButton.tsx`에서 고정된 폰트 ID 사용
  - 폰트 관련 매개변수 전달 로직 수정
  - _Requirements: 3.3, 4.1_

- [ ] 7. 사용하지 않는 폰트 파일 정리
  - JetBrains Mono와 Source Code Pro 폰트 파일 제거
  - `assets/fonts/` 및 `public/fonts/` 디렉토리에서 불필요한 파일 삭제
  - _Requirements: 2.2_

- [ ] 8. FontSelector 컴포넌트 제거
  - `app/components/FontSelector.tsx` 파일 삭제
  - 관련 import 및 참조 제거
  - _Requirements: 2.1_

- [ ] 9. 테스트 및 검증
  - 모든 기능이 Roboto Mono 폰트로 정상 작동하는지 확인
  - 사이즈 선택과 텍스트 선택 기능이 여전히 작동하는지 테스트
  - PDF 생성 및 다운로드 기능 테스트
  - 미리보기 기능이 올바른 폰트로 표시되는지 확인
  - _Requirements: 4.1, 4.2, 4.3_