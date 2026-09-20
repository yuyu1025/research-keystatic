import { repoName, repoOwner } from './site-env';

const TOKEN_COOKIE = 'keystatic-gh-access-token';

function cookieValue(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

/**
 * 本地随便传。线上必须是已经登录 Keystatic 的 GitHub token，
 * 并且对这个仓库可见——假 cookie 过不了 GitHub。
 */
export async function requireEditor(request: Request): Promise<void> {
  if (process.env.NODE_ENV !== 'production') return;

  const token = cookieValue(request.headers.get('cookie'), TOKEN_COOKIE);
  if (!token) {
    throw new AssetAuthError('先到 /keystatic 用 GitHub 登录');
  }

  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'research-keystatic',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new AssetAuthError('GitHub 登录已失效，重新打开 /keystatic');
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub 仓库校验失败 (${response.status}): ${body.slice(0, 300)}`);
  }
}

export class AssetAuthError extends Error {
  readonly status = 401;
}
