# Markdown Viewer

Markdown 파일을 브라우저에서 열고, 편집하고, PDF로 저장할 수 있는 정적 웹 앱입니다.
파일은 서버로 업로드되지 않으며 현재 브라우저 안에서만 처리됩니다.

## 기능

- `.md`, `.markdown` 파일 선택 및 드래그 앤 드롭
- GitHub 스타일 Markdown과 코드 구문 강조
- 문서 목차 자동 생성
- 문서 목차 사이드바 접기
- 미리보기 / 나란히 / 편집 보기
- 편집 내용 브라우저 자동 저장
- 불러온 문서와 자동 저장 캐시 초기화
- 라이트 / 다크 테마
- 인쇄 레이아웃 기반 PDF 저장
- 모바일 반응형 화면

## 로컬 실행

Node.js가 설치되어 있다면:

```bash
npm run dev
```

브라우저에서 <http://localhost:8000>을 엽니다.

테스트:

```bash
npm test
```

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소로 만든 뒤 `main` 브랜치에 push합니다.
2. 저장소의 **Settings → Pages**로 이동합니다.
3. **Deploy from a branch**, `main`, `/(root)`를 선택하고 저장합니다.
4. 잠시 뒤 `https://<사용자명>.github.io/<저장소명>/`에서 열 수 있습니다.

사용자 사이트 저장소 이름이 `<사용자명>.github.io`라면 주소는
`https://<사용자명>.github.io/`가 됩니다.

## PDF 저장

상단의 **PDF로 저장**을 누른 뒤 브라우저 인쇄 창의 프린터/대상에서
**PDF로 저장**을 선택합니다. 문서 본문만 A4 레이아웃으로 출력됩니다.

## 사용 라이브러리

브라우저에서 CDN으로 Marked, DOMPurify, highlight.js를 불러옵니다.
따라서 최초 실행 및 Markdown 렌더링에는 인터넷 연결이 필요합니다.
