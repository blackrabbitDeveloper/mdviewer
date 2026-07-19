<div align="center">

# Markdown Viewer

Markdown 문서를 열고 편집하며 읽기 좋은 형태로 내보냅니다.

[![Open App](https://img.shields.io/badge/Open_App-E8795A?style=for-the-badge&logo=googlechrome&logoColor=white)](https://blackrabbitdeveloper.github.io/mdviewer/)
[![Tests](https://img.shields.io/badge/Tests-5_passing-248A5A?style=for-the-badge)](#테스트)

</div>

> 문서는 브라우저 안에서만 처리되며 자동 저장 데이터도 현재 브라우저에 보관됩니다.

## 주요 기능

- Markdown 파일 열기, 편집 및 저장
- 미리보기, 분할 보기, 편집 보기
- 자동 목차, 문서 검색, 코드 구문 강조
- 글꼴 크기와 사이드바 조절
- 인쇄 레이아웃 기반 PDF 저장
- Dark/Light 공통 테마와 모바일 레이아웃

## 사용법

1. [Markdown Viewer](https://blackrabbitdeveloper.github.io/mdviewer/)를 엽니다.
2. Markdown 파일을 선택하거나 예제 문서로 시작합니다.
3. 문서를 편집하고 미리보기를 확인합니다.
4. Markdown 또는 PDF로 저장합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 <http://localhost:8000>을 엽니다.

## 테스트

```bash
npm test
```

## 기술

- Vanilla HTML, CSS, JavaScript
- Marked, DOMPurify, highlight.js
- GitHub Pages

## 개인정보

문서 본문은 서버로 업로드되지 않습니다. 자동 저장 데이터는 브라우저의 로컬 저장소에만 남습니다.

## 라이선스

저장소의 라이선스 정책을 따릅니다.
