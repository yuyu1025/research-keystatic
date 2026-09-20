import Link from 'next/link';
import { reader } from '../reader';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';
import { mediaUrl } from '../../lib/media-url';

export const dynamic = 'force-static';

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
          每篇文章是 <code>content/posts/*.mdoc</code>。正文可以插入图片、附件、Callout、YouTube、高亮。
        </p>
        {sorted.length === 0 ? (
          <p className="empty">还没有文章。</p>
        ) : (
          <ul className="post-list">
            {sorted.map(post => {
              const cover = mediaUrl(post.entry.coverSrc);
              return (
                <li key={post.slug}>
                  <Link href={`/posts/${post.slug}`}>
                    {cover ? (
                      <img
                        className="post-list-cover"
                        src={cover}
                        alt={post.entry.coverAlt ?? ''}
                      />
                    ) : null}
                    <strong>{post.entry.title}</strong>
                    {post.entry.summary ? <span>{post.entry.summary}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <SiteFooter siteName={siteName} />
    </div>
  );
}
