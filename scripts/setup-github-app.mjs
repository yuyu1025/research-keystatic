#!/usr/bin/env node
/**
 * Keystatic GitHub App 的 Manifest 流程。
 * 打开浏览器创建 App，写回 .env.local，并（若已 gh 登录）写入仓库 secrets。
 */
import { createServer } from 'node:http';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const PORT = 8765;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const APP_NAME = 'yuyu1025-research-keystatic';
const HOMEPAGE = 'https://research.distinctive.fun';
const CALLBACK = 'http://localhost:3000/api/keystatic/github/oauth/callback';
const STATE = randomBytes(16).toString('hex');
const SECRET =
  process.env.KEYSTATIC_SECRET || randomBytes(32).toString('hex');

const manifest = {
  name: APP_NAME,
  url: HOMEPAGE,
  hook_attributes: { url: `${HOMEPAGE}/api/github/webhook`, active: false },
  redirect_url: REDIRECT,
  callback_url: CALLBACK,
  request_oauth_on_install: true,
  public: false,
  default_permissions: {
    contents: 'write',
    metadata: 'read',
  },
};

const formHtml = `<!doctype html>
<meta charset="utf-8" />
<title>Create Keystatic GitHub App</title>
<body>
  <p>正在跳转到 GitHub 创建 App…</p>
  <form id="f" action="https://github.com/settings/apps/new?state=${STATE}" method="post">
    <input type="hidden" name="manifest" value='${JSON.stringify(manifest)}' />
  </form>
  <script>document.getElementById('f').submit()</script>
</body>`;

function openUrl(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref();
}

function upsertEnv(file, entries) {
  let text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  if (text.length && !text.endsWith('\n')) text += '\n';
  for (const [key, value] of Object.entries(entries)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    text = re.test(text) ? text.replace(re, line) : `${text}${line}\n`;
  }
  writeFileSync(file, text);
}

function ghSecret(name, value) {
  return new Promise(resolve => {
    const child = spawn('gh', ['secret', 'set', name, '--repo', 'yuyu1025/research-keystatic'], {
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    child.stdin.write(value);
    child.stdin.end();
    child.on('close', code => resolve(code === 0));
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/start') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(formHtml);
    return;
  }
  if (url.pathname !== '/callback') {
    res.writeHead(404);
    res.end('not found');
    return;
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || state !== STATE) {
    res.writeHead(400);
    res.end('missing code/state');
    return;
  }

  try {
    const converted = await fetch(
      `https://api.github.com/app-manifests/${code}/conversions`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'research-keystatic-setup',
        },
      }
    );
    if (!converted.ok) {
      const body = await converted.text();
      throw new Error(`manifest conversion failed ${converted.status}: ${body}`);
    }
    const app = await converted.json();
    const env = {
      KEYSTATIC_GITHUB_CLIENT_ID: app.client_id,
      KEYSTATIC_GITHUB_CLIENT_SECRET: app.client_secret,
      KEYSTATIC_SECRET: SECRET,
      NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: app.slug,
    };
    upsertEnv('.env.local', env);
    upsertEnv('.env.example', {
      KEYSTATIC_GITHUB_CLIENT_ID: '',
      KEYSTATIC_GITHUB_CLIENT_SECRET: '',
      KEYSTATIC_SECRET: '',
      NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: '',
    });

    const secretsOk = [];
    for (const [k, v] of Object.entries(env)) {
      secretsOk.push(`${k}=${(await ghSecret(k, v)) ? 'ok' : 'skip'}`);
    }

    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(
      `<!doctype html><meta charset="utf-8" /><title>OK</title>
       <p>GitHub App <strong>${app.slug}</strong> 已创建。</p>
       <p>已写入 <code>.env.local</code>。安装 App：
       <a href="https://github.com/apps/${app.slug}/installations/new">授权仓库</a></p>
       <p>可以关掉这个窗口。</p>`
    );
    console.log('GitHub App created:', app.slug);
    console.log('Wrote .env.local');
    console.log('Secrets:', secretsOk.join(', '));
    console.log(`Install: https://github.com/apps/${app.slug}/installations/new`);
    setTimeout(() => process.exit(0), 500);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(String(error));
    console.error(error);
    setTimeout(() => process.exit(1), 500);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const start = `http://127.0.0.1:${PORT}/start`;
  console.log(`Open ${start} 并在 GitHub 上确认创建 App`);
  openUrl(start);
});
