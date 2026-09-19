import Link from 'next/link';
import { reader } from '../reader';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';

export default async function PostsPage() {
  const homepage = await reader.singletons.homepage.read();
  const siteName = homepage?.siteName ?? 'Keystatic 教学主题';
  const posts = await reader.collections.posts.all();
  const sorted = [...posts].sort((a, b) =>
    (b.entry.publishedAt ?? '').localeCompare(a.entry.publishedAt ?? '')
  );

  return (
    <div className="theme">
      <SiteHeader siteName={siteName} />
      <main className="section">
        <p className="eyebrow">内容集合</p>
        <h1>文章</h1>
        <p className="lede">
          每篇文章是 <code>content/posts/*.mdoc</code>。正文可以插入 Callout、YouTube、高亮。
        </p>
        {sorted.length === 0 ? (
          <p className="empty">还没有文章。</p>
        ) : (
          <ul className="post-list">
            {sorted.map(post => (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`}>
                  <strong>{post.entry.title}</strong>
                  {post.entry.summary ? <span>{post.entry.summary}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter siteName={siteName} />
    </div>
  );
}
