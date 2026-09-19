import { reader } from '../app/reader';
import type { Homepage, PostSummary } from './content-types';

export async function loadHomepage(): Promise<Homepage> {
  const homepage = await reader.singletons.homepage.read();
  if (!homepage) {
    throw new Error(
      '找不到首页 singleton。确认 content/homepage.yaml 存在，且 path 是 content/homepage。'
    );
  }
  return homepage;
}

export async function loadPostSummaries(): Promise<PostSummary[]> {
  const posts = await reader.collections.posts.all();
  return posts.map(post => ({
    slug: post.slug,
    title: post.entry.title,
    summary: post.entry.summary,
    publishedAt: post.entry.publishedAt,
  }));
}
