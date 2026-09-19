import { stringify } from 'yaml';
import { repoName, repoOwner } from './site-env';
import type { Homepage } from './content-types';

const HOMEPAGE_PATH = 'content/homepage.yaml';

export function homepageYaml(body: Homepage): string {
  if (typeof body.siteName !== 'string' || !Array.isArray(body.sections)) {
    throw new Error('首页 payload 不完整：需要 siteName 和 sections');
  }
  for (const section of body.sections) {
    if (!section || typeof section.discriminant !== 'string' || section.value == null) {
      throw new Error('sections 里有条目缺 discriminant 或 value');
    }
  }
  const yaml = stringify(
    { siteName: body.siteName, sections: body.sections },
    { lineWidth: 92 }
  );
  return yaml.endsWith('\n') ? yaml : `${yaml}\n`;
}

export function githubTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)keystatic-gh-access-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function commitHomepageToGitHub(yaml: string, token: string) {
  const repo = `${repoOwner}/${repoName}`;
  const api = `https://api.github.com/repos/${repo}/contents/${HOMEPAGE_PATH}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'research-keystatic',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const current = await fetch(api, { headers });
  if (!current.ok && current.status !== 404) {
    throw new Error(`读取 GitHub 文件失败 (${current.status})`);
  }
  const currentBody = current.ok ? ((await current.json()) as { sha?: string }) : {};

  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'chore: update homepage',
      content: Buffer.from(yaml, 'utf8').toString('base64'),
      sha: currentBody.sha,
      branch: 'main',
    }),
  });
  if (!put.ok) {
    const detail = await put.text();
    throw new Error(detail || `写入 GitHub 失败 (${put.status})`);
  }
}
