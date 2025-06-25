# 핸드라이팅 연습 시트 생성기 (Handwriting Practice Sheet Generator)

다양한 폰트와 사이즈로 나만의 핸드라이팅 연습 시트를 만들 수 있는 웹 애플리케이션입니다.

## 기능 (Features)

- 🖋️ 다양한 폰트 선택 (Multiple font options)
- 📏 사이즈 조절 기능 (Adjustable font sizes)
- 👀 실시간 미리보기 (Real-time preview)
- 📄 PDF 다운로드 (PDF download)
- 🎨 깔끔한 사용자 인터페이스 (Clean user interface)

## 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: PDF-lib, @pdf-lib/fontkit
- **Font Processing**: OpenType.js

## 시작하기 (Getting Started)

### 필수 조건 (Prerequisites)

- Node.js 18.17 또는 그 이상
- npm 또는 yarn

### 설치 (Installation)

```bash
# 저장소 클론
git clone <repository-url>
cd handwriting-js

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 빌드 (Build)

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 사용법 (Usage)

1. **폰트 선택**: 왼쪽 패널에서 원하는 폰트를 선택합니다
2. **사이즈 조절**: 글자 크기를 선택합니다
3. **미리보기**: 오른쪽 패널에서 실시간으로 결과를 확인합니다
4. **다운로드**: PDF 다운로드 버튼을 클릭하여 연습 시트를 저장합니다

## 개발 명령어 (Development Commands)

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## 프로젝트 구조 (Project Structure)

```
handwriting-js/
├── app/
│   ├── components/          # React 컴포넌트
│   │   ├── FontSelector.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── PreviewSection.tsx
│   │   └── DownloadButton.tsx
│   ├── actions/             # Server Actions
│   ├── layout.tsx
│   └── page.tsx
├── lib/                     # 유틸리티 및 설정
├── public/                  # 정적 파일
└── reference/              # 참고 자료 및 할일 목록
```

## 할일 목록 (Todo List)

자세한 개발 계획은 [reference/todo.md](./reference/todo.md)를 참조하세요.

## 기여하기 (Contributing)

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
