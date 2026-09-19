#!/usr/bin/env node
/**
 * Worker HTML 引用 /console/_next/...，Pages 占着根路径 /_next。
 * 把 OpenNext 静态资源复制到 /console/_next，让 Cloudflare Assets 直接吐。
 */
const fs = require('node:fs');
const path = require('node:path');

const assets = path.join(__dirname, '..', '.open-next', 'assets');
const src = path.join(assets, '_next');
const dest = path.join(assets, 'console', '_next');

if (!fs.existsSync(src)) {
  throw new Error(`missing ${src}; run opennextjs-cloudflare build first`);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`copied ${src} -> ${dest}`);
