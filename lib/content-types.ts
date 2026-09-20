import type { reader } from '../app/reader';

/**
 * 从 Reader 推断，和 schema 保持同步。
 * 客户端只 `import type`，不会把 Node fs 打进浏览器包。
 */
export type Homepage = NonNullable<
  Awaited<ReturnType<typeof reader.singletons.homepage.read>>
>;

export type HomepageSection = Homepage['sections'][number];

export type HomepageSectionKind = HomepageSection['discriminant'];

/** 传给 Client Component 的文章摘要。all() 里的 content 是函数，不能过边界。 */
export type PostSummary = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  coverSrc: string;
  coverAlt: string;
};
