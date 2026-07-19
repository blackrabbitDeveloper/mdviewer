import {
  baseName, clampFontScale, countWords, isMarkdownFile, renderDelay, slugify,
} from './utils.js';

const $ = (selector) => document.querySelector(selector);
const elements = {
  welcome: $('#welcome'),
  workspace: $('#workspace'),
  dropzone: $('#dropzone'),
  fileInput: $('#file-input'),
  openButton: $('#open-button'),
  resetButton: $('#reset-button'),
  saveButton: $('#save-button'),
  exportButton: $('#export-button'),
  themeButton: $('#theme-button'),
  sampleButton: $('#sample-button'),
  filename: $('#filename'),
  stats: $('#document-stats'),
  toc: $('#toc'),
  editor: $('#editor'),
  preview: $('#preview'),
  stage: $('#document-stage'),
  sidebarToggle: $('#sidebar-toggle'),
  saveStatus: $('#save-status'),
  fontDecrease: $('#font-decrease'),
  fontIncrease: $('#font-increase'),
  fontSizeLabel: $('#font-size-label'),
  searchToggle: $('#search-toggle'),
  searchPanel: $('#search-panel'),
  searchInput: $('#search-input'),
  searchCount: $('#search-count'),
  searchPrev: $('#search-prev'),
  searchNext: $('#search-next'),
  searchClose: $('#search-close'),
  toast: $('#toast'),
};

const sample = `# Markdown Viewer

Markdown 문서를 브라우저에서 바로 읽고 편집할 수 있습니다.

## 주요 기능

- **드래그 앤 드롭**으로 파일 열기
- GitHub 스타일 Markdown 미리보기
- 실시간 편집과 자동 저장
- 인쇄에 최적화된 PDF 내보내기

> 문서는 외부 서버로 전송되지 않습니다. 모든 처리는 현재 브라우저에서 이루어집니다.

## 코드 예제

\`\`\`javascript
const greeting = 'Hello, Markdown!';
console.log(greeting);
\`\`\`

## 표

| 기능 | 지원 |
| --- | :---: |
| 제목과 목록 | ✅ |
| 표와 인용문 | ✅ |
| 코드 하이라이트 | ✅ |
| PDF 저장 | ✅ |

---

문서를 수정해 보면 미리보기에 즉시 반영됩니다.
`;

let currentName = 'example.md';
let renderTimer;
let toastTimer;
let headingObserver;
let searchMatches = [];
let searchIndex = -1;
let fontScale = 100;

marked.setOptions({ gfm: true, breaks: false });

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('visible'), 2400);
}

function render() {
  const markdown = elements.editor.value;
  const unsafeHtml = marked.parse(markdown);
  elements.preview.innerHTML = DOMPurify.sanitize(unsafeHtml, { USE_PROFILES: { html: true } });

  const usedSlugs = new Map();
  const headings = [...elements.preview.querySelectorAll('h1, h2, h3')];
  elements.toc.innerHTML = '';
  headings.forEach((heading) => {
    heading.id = slugify(heading.textContent, usedSlugs);
    const item = document.createElement('li');
    item.className = `toc-level-${heading.tagName.slice(1)}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    item.appendChild(link);
    elements.toc.appendChild(item);
  });

  elements.preview.querySelectorAll('a').forEach((link) => {
    if (/^https?:/i.test(link.href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });
  addCodeCopyButtons();
  scheduleCodeHighlight();
  observeHeadings(headings);
  if (!elements.searchPanel.hidden) updateSearch();

  const words = countWords(markdown);
  elements.stats.textContent = `${words.toLocaleString()}단어 · 약 ${Math.max(1, Math.ceil(words / 300))}분`;
  localStorage.setItem('mdviewer-content', markdown);
  localStorage.setItem('mdviewer-name', currentName);
  elements.saveStatus.textContent = '자동 저장됨';
}

function queueRender() {
  elements.saveStatus.textContent = '저장 중…';
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, renderDelay(elements.editor.value.length));
}

function scheduleCodeHighlight() {
  const blocks = [...elements.preview.querySelectorAll('pre code')];
  let index = 0;
  const run = (deadline) => {
    while (index < blocks.length && (!deadline || deadline.timeRemaining() > 3)) {
      hljs.highlightElement(blocks[index]);
      index += 1;
    }
    if (index < blocks.length) {
      if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 500 });
      else setTimeout(() => run(), 16);
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 300 });
  else setTimeout(() => run(), 0);
}

function addCodeCopyButtons() {
  elements.preview.querySelectorAll('pre').forEach((pre) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '복사';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || pre.textContent);
        button.textContent = '복사됨';
        setTimeout(() => { button.textContent = '복사'; }, 1400);
      } catch {
        showToast('코드를 복사하지 못했습니다.');
      }
    });
    pre.appendChild(button);
  });
}

function observeHeadings(headings) {
  headingObserver?.disconnect();
  if (!('IntersectionObserver' in window)) return;
  headingObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    elements.toc.querySelectorAll('a').forEach((link) => {
      link.classList.toggle('current', link.hash === `#${visible.target.id}`);
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  headings.forEach((heading) => headingObserver.observe(heading));
}

function downloadMarkdown() {
  if (elements.workspace.hidden) {
    showToast('먼저 Markdown 문서를 열어 주세요.');
    return;
  }
  const blob = new Blob([elements.editor.value], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = /\.(md|markdown)$/i.test(currentName) ? currentName : `${currentName}.md`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast(`${link.download} 파일을 저장했습니다.`);
}

function setFontScale(value) {
  fontScale = clampFontScale(value);
  elements.preview.style.setProperty('--reader-scale', `${fontScale / 100}`);
  elements.fontSizeLabel.textContent = `${fontScale}%`;
  localStorage.setItem('mdviewer-font-scale', String(fontScale));
}

function clearSearchMarks() {
  elements.preview.querySelectorAll('mark.search-match').forEach((mark) => mark.replaceWith(mark.textContent));
  searchMatches = [];
  searchIndex = -1;
}

function updateSearch() {
  clearSearchMarks();
  const query = elements.searchInput.value.trim();
  if (!query) {
    elements.searchCount.textContent = '';
    return;
  }
  const walker = document.createTreeWalker(elements.preview, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.toLocaleLowerCase().includes(query.toLocaleLowerCase())) return NodeFilter.FILTER_REJECT;
      if (node.parentElement.closest('script, style, .copy-code')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${escaped})`, 'gi');
  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.nodeValue.split(pattern).forEach((part) => {
      if (part.toLocaleLowerCase() === query.toLocaleLowerCase()) {
        const mark = document.createElement('mark');
        mark.className = 'search-match';
        mark.textContent = part;
        fragment.appendChild(mark);
        searchMatches.push(mark);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    node.replaceWith(fragment);
  });
  searchIndex = searchMatches.length ? 0 : -1;
  focusSearchMatch();
}

function focusSearchMatch(step = 0) {
  if (!searchMatches.length) {
    elements.searchCount.textContent = elements.searchInput.value ? '0개' : '';
    return;
  }
  searchIndex = (searchIndex + step + searchMatches.length) % searchMatches.length;
  searchMatches.forEach((mark, index) => mark.classList.toggle('active', index === searchIndex));
  elements.searchCount.textContent = `${searchIndex + 1}/${searchMatches.length}`;
  searchMatches[searchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleSearch(show = elements.searchPanel.hidden) {
  elements.searchPanel.hidden = !show;
  elements.searchToggle.setAttribute('aria-expanded', String(show));
  if (show) {
    elements.searchInput.focus();
    elements.searchInput.select();
  } else {
    clearSearchMarks();
    elements.searchCount.textContent = '';
  }
}

function openDocument(content, filename) {
  currentName = filename || 'document.md';
  elements.filename.textContent = currentName;
  elements.editor.value = content.replace(/^\uFEFF/, '');
  elements.welcome.hidden = true;
  elements.workspace.hidden = false;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadFile(file) {
  if (!isMarkdownFile(file)) {
    showToast('Markdown(.md, .markdown) 파일을 선택해 주세요.');
    return;
  }
  try {
    openDocument(await file.text(), file.name);
  } catch {
    showToast('파일을 읽지 못했습니다.');
  }
}

function setView(view) {
  elements.stage.className = `document-stage ${view}-mode`;
  document.querySelectorAll('.view-tab').forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  localStorage.setItem('mdviewer-view', view);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('utils-theme', theme);
  elements.themeButton.textContent = theme === 'dark' ? '☀' : '◐';
}

function setSidebarCollapsed(collapsed) {
  elements.workspace.classList.toggle('sidebar-collapsed', collapsed);
  elements.sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  elements.sidebarToggle.querySelector('.sidebar-toggle-label').textContent = collapsed ? '목차 열기' : '목차 접기';
  localStorage.setItem('mdviewer-sidebar-collapsed', String(collapsed));
}

function resetDocument() {
  if (!elements.workspace.hidden && !window.confirm('현재 문서와 브라우저에 저장된 내용을 지울까요?')) return;
  clearTimeout(renderTimer);
  localStorage.removeItem('mdviewer-content');
  localStorage.removeItem('mdviewer-name');
  currentName = 'document.md';
  elements.editor.value = '';
  elements.preview.innerHTML = '';
  elements.toc.innerHTML = '';
  elements.filename.textContent = '문서.md';
  elements.stats.textContent = '';
  elements.fileInput.value = '';
  elements.workspace.hidden = true;
  elements.welcome.hidden = false;
  document.title = 'Markdown Viewer';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('불러온 문서와 저장된 캐시를 초기화했습니다.');
}

elements.openButton.addEventListener('click', () => elements.fileInput.click());
elements.resetButton.addEventListener('click', resetDocument);
elements.saveButton.addEventListener('click', downloadMarkdown);
elements.sidebarToggle.addEventListener('click', () => {
  setSidebarCollapsed(!elements.workspace.classList.contains('sidebar-collapsed'));
});
elements.dropzone.addEventListener('click', () => elements.fileInput.click());
elements.dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') elements.fileInput.click();
});
elements.fileInput.addEventListener('change', () => {
  loadFile(elements.fileInput.files[0]);
  elements.fileInput.value = '';
});
elements.sampleButton.addEventListener('click', () => openDocument(sample, 'example.md'));
elements.editor.addEventListener('input', queueRender);
elements.exportButton.addEventListener('click', () => {
  if (elements.workspace.hidden) {
    showToast('먼저 Markdown 문서를 열어 주세요.');
    return;
  }
  document.title = `${baseName(currentName)} - Markdown Viewer`;
  window.print();
  setTimeout(() => { document.title = 'Markdown Viewer'; }, 500);
});
elements.themeButton.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
elements.fontDecrease.addEventListener('click', () => setFontScale(fontScale - 10));
elements.fontIncrease.addEventListener('click', () => setFontScale(fontScale + 10));
elements.searchToggle.addEventListener('click', () => toggleSearch());
elements.searchClose.addEventListener('click', () => toggleSearch(false));
elements.searchInput.addEventListener('input', updateSearch);
elements.searchPrev.addEventListener('click', () => focusSearchMatch(-1));
elements.searchNext.addEventListener('click', () => focusSearchMatch(1));
elements.searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    focusSearchMatch(event.shiftKey ? -1 : 1);
  }
  if (event.key === 'Escape') toggleSearch(false);
});
document.querySelectorAll('.view-tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

for (const eventName of ['dragenter', 'dragover']) {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropzone.classList.add('dragover');
  });
}
for (const eventName of ['dragleave', 'drop']) {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropzone.classList.remove('dragover');
  });
}
document.addEventListener('drop', (event) => loadFile(event.dataTransfer.files[0]));
document.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLocaleLowerCase();
  if (key === 'o') {
    event.preventDefault();
    elements.fileInput.click();
  } else if (key === 's') {
    event.preventDefault();
    downloadMarkdown();
  } else if (key === 'p') {
    event.preventDefault();
    elements.exportButton.click();
  } else if (key === 'f' && !elements.workspace.hidden) {
    event.preventDefault();
    toggleSearch(true);
  }
});

const preferredTheme = localStorage.getItem('utils-theme')
  || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(preferredTheme);
setView(localStorage.getItem('mdviewer-view') || 'preview');
setSidebarCollapsed(localStorage.getItem('mdviewer-sidebar-collapsed') === 'true');
setFontScale(Number(localStorage.getItem('mdviewer-font-scale')) || 100);

const savedContent = localStorage.getItem('mdviewer-content');
if (savedContent) {
  openDocument(savedContent, localStorage.getItem('mdviewer-name') || 'document.md');
}
