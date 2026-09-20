import { parse } from 'yaml';
import { reader } from '../app/reader';
import type { Homepage, PostSummary } from './content-types';
import { repoName, repoOwner } from './site-env';

function githubHeaders(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'research-keystatic',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function loadHomepageFromGitHub(token?: string): Promise<Homepage | null> {
  const res = await fetch(
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/content/homepage.yaml`,
    { headers: githubHeaders(token) }
  );
  if (!res.ok) return null;
  return parse(await res.text()) as Homepage;
}

async function loadPostsFromGitHub(token?: string): Promise<PostSummary[]> {
  const res = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/content/posts`,
    { headers: githubHeaders(token) }
  );
  if (!res.ok) return [];
  const files = (await res.json()) as { name: string; download_url?: string | null }[];
  const posts: PostSummary[] = [];
  for (const file of files) {
    if (!file.name.endsWith('.mdoc') || !file.download_url) continue;
    const raw = await fetch(file.download_url, { headers: githubHeaders(token) });
    if (!raw.ok) continue;
    const text = await raw.text();
    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    const data = (fm ? parse(fm[1]) : {}) as Record<string, unknown>;
    const title = data.title;
    posts.push({
      slug: file.name.replace(/\.mdoc$/, ''),
      title:
        typeof title === 'string'
          ? title
          : title && typeof title === 'object' && 'name' in title
            ? String((title as { name: unknown }).name ?? '')
            : '',
      summary: String(data.summary ?? ''),
      publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : null,
      coverSrc: typeof data.coverSrc === 'string' ? data.coverSrc : '',
      coverAlt: typeof data.coverAlt === 'string' ? data.coverAlt : '',
    });
  }
  return posts;
}

export async function loadHomepage(token?: string): Promise<Homepage> {
  const local = await reader.singletons.homepage.read().catch(() => null);
  if (local) return local;
  const remote = await loadHomepageFromGitHub(token);
  if (!remote) {
    throw new Error(
      '找不到首页 singleton。确认 content/homepage.yaml 存在，且 path 是 content/homepage。'
    );
  }
  return remote;
}

export async function loadPostSummaries(token?: string): Promise<PostSummary[]> {
  const local = await reader.collections.posts.all().catch(() => []);
  if (local.length > 0) {
    return local.map(post => ({
      slug: post.slug,
      title: post.entry.title,
      summary: post.entry.summary,
      publishedAt: post.entry.publishedAt,
      coverSrc: post.entry.coverSrc ?? '',
      coverAlt: post.entry.coverAlt ?? '',
    }));
  }
  return loadPostsFromGitHub(token);
}
