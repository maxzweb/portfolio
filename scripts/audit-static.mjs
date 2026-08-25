#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function dupIds(html, file) {
  const ids = [...html.matchAll(/\bid=['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const c = {};
  ids.forEach((i) => (c[i] = (c[i] || 0) + 1));
  const dups = Object.entries(c).filter(([, n]) => n > 1);
  if (dups.length) {
    console.log(`${file} duplicate IDs:`, dups.map(([i, n]) => `${i}:${n}`).join(', '));
  }
}

function checkImgs(html, baseDir, file) {
  const srcs = [...html.matchAll(/<img[^>]+\bsrc=['"]([^'"]+)['"]/gi)].map((m) => m[1]);
  for (const s of srcs) {
    if (/^https?:\/\//i.test(s) || s.startsWith('data:')) continue;
    const p = path.resolve(baseDir, s);
    if (!fs.existsSync(p)) console.log('MISSING IMG', file, s, '->', p);
  }
}

function checkLinks(html, baseDir, file) {
  const hrefs = [...html.matchAll(/<a[^>]+\bhref=['"]([^'"]+)['"]/gi)].map((m) => m[1]);
  for (const h of hrefs) {
    if (/^https?:\/\//i.test(h) || h.startsWith('mailto:') || h.startsWith('#')) continue;
    const clean = h.split('#')[0];
    if (!clean) continue;
    const p = path.resolve(baseDir, clean);
    if (!fs.existsSync(p)) console.log('MISSING HREF', file, h, '->', p);
  }
}

for (const f of [
  'index.html',
  '404.html',
  'cases/case1.html',
  'cases/case2.html',
  'cases/case3.html',
  'cases/case4.html'
]) {
  const html = fs.readFileSync(f, 'utf8');
  dupIds(html, f);
  const base = f.includes('cases/') ? 'cases' : '.';
  checkImgs(html, base, f);
  checkLinks(html, base, f);
}
