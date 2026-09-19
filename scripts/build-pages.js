#!/usr/bin/env node
/**
 * GitHub Pages 只托管静态前台。API / Keystatic / 工作室需要 Node，导出前挪走。
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const stash = path.join(root, '.pages-exclude');
const exclude = ['app/api', 'app/keystatic', 'app/studio'];
const siteHost = 'research.distinctive.fun';

function stashDir(rel) {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(stash, { recursive: true });
  fs.renameSync(from, path.join(stash, path.basename(rel)));
}

function restore() {
  if (!fs.existsSync(stash)) return;
  for (const rel of exclude) {
    const parked = path.join(stash, path.basename(rel));
    if (fs.existsSync(parked)) {
      fs.renameSync(parked, path.join(root, rel));
    }
  }
  fs.rmSync(stash, { recursive: true, force: true });
}

process.on('SIGINT', () => {
  restore();
  process.exit(1);
});
process.on('SIGTERM', () => {
  restore();
  process.exit(1);
});

try {
  for (const rel of exclude) stashDir(rel);

  const result = spawnSync('pnpm', ['exec', 'next', 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NEXT_PUBLIC_STATIC_EXPORT: '1' },
  });
  if (result.status !== 0) {
    throw new Error(`next build exited ${result.status}`);
  }

  const out = path.join(root, 'out');
  fs.writeFileSync(path.join(out, 'CNAME'), `${siteHost}\n`);
  fs.writeFileSync(path.join(out, '.nojekyll'), '');
} finally {
  restore();
}
