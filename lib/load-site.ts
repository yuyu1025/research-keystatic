import { createGitHubReader } from '@keystatic/core/reader/github';
import { reader } from '../app/reader';
import keystaticConfig from '../keystatic.config';
import type { Homepage, PostSummary } from './content-types';
import { repoName, repoOwner } from './site-env';

function githubReader(token?: string) {
  return createGitHubReader(keystaticConfig, {
    repo: `${repoOwner}/${repoName}`,
    token,
  });
}

export async function loadHomepage(token?: string): Promise<Homepage> {
  const local = await reader.singletons.homepage.read().catch(() => null);
  if (local) return local;
  const remote = await githubReader(token).singletons.homepage.read();
  if (!remote) {
    throw new Error(
      '找不到首页 singleton。确认 content/homepage.yaml 存在，且 path 是 content/homepage。'
    );
  }
  return remote;
}

export async function loadPostSummaries(token?: string): Promise<PostSummary[]> {
  const local = await reader.collections.posts.all().catch(() => []);
  const source = local.length > 0 ? local : await githubReader(token).collections.posts.all();
  return source.map(post => ({
    slug: post.slug,
    title: post.entry.title,
    summary: post.entry.summary,
    publishedAt: post.entry.publishedAt,
  }));
}
