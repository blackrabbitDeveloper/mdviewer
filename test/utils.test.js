import test from 'node:test';
import assert from 'node:assert/strict';
import { baseName, countWords, isMarkdownFile, slugify } from '../js/utils.js';

test('slugify creates readable unique ids including Korean', () => {
  const used = new Map();
  assert.equal(slugify('Hello World!', used), 'hello-world');
  assert.equal(slugify('Hello World!', used), 'hello-world-2');
  assert.equal(slugify('사용 방법', used), '사용-방법');
});

test('countWords ignores markdown decoration', () => {
  assert.equal(countWords('# Hello **Markdown** viewer'), 3);
});

test('file helpers accept markdown and strip its extension', () => {
  assert.equal(isMarkdownFile({ name: 'README.md', type: '' }), true);
  assert.equal(isMarkdownFile({ name: 'photo.png', type: 'image/png' }), false);
  assert.equal(baseName('README.markdown'), 'README');
});

