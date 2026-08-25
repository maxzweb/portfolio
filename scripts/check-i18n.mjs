#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function allJsonKeys(obj, prefix = '') {
  const out = [];
  for (const k of Object.keys(obj)) {
    const pth = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      out.push(...allJsonKeys(obj[k], pth));
    } else {
      out.push(pth);
    }
  }
  return out;
}

const root = path.dirname(__dirname);
const files = walk(root).filter(
  (f) => f.endsWith('.html') || f.endsWith('.js')
);

const re = /data-i18n(?:-(?:placeholder|value|aria-label|content|href))?="([^"]+)"/g;
const jsKeyRe = /['"]((?:header|contact|scrollPill|case|index|404|footer|links)\.[a-zA-Z0-9_.]+)['"]/g;
const keys = new Set();
for (const file of files) {
  if (file.includes('/scripts/')) continue;
  const s = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(s)) !== null) keys.add(m[1]);
  if (file.endsWith('.js')) {
    while ((m = jsKeyRe.exec(s)) !== null) {
      const key = m[1];
      if (!/\.html$/i.test(key)) keys.add(key);
    }
  }
}

const en = JSON.parse(fs.readFileSync(path.join(root, 'data/en.json'), 'utf8'));
const uk = JSON.parse(fs.readFileSync(path.join(root, 'data/uk.json'), 'utf8'));
const enKeys = new Set(allJsonKeys(en));
const ukKeys = new Set(allJsonKeys(uk));

const missingEn = [...keys].filter((k) => !enKeys.has(k)).sort();
const missingUk = [...keys].filter((k) => !ukKeys.has(k)).sort();

console.log('Referenced keys:', keys.size);
console.log('Missing en:', missingEn.length ? missingEn.join('\n') : '(none)');
console.log('Missing uk:', missingUk.length ? missingUk.join('\n') : '(none)');
