export function slugify(text, used = new Map()) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'section';
  const count = used.get(base) || 0;
  used.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

export function countWords(text) {
  const normalized = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~[\]()-]/g, ' ')
    .trim();
  return normalized ? normalized.split(/\s+/u).length : 0;
}

export function baseName(filename) {
  return filename.replace(/\.(md|markdown)$/i, '') || 'document';
}

export function isMarkdownFile(file) {
  return Boolean(file && (
    /\.(md|markdown)$/i.test(file.name)
    || file.type === 'text/markdown'
    || file.type === 'text/plain'
  ));
}

