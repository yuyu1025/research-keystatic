import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reader } from '../../reader';
import { renderMarkdoc } from '../../../lib/render-markdoc';
import { SiteFooter, SiteHeader } from '../../../components/SiteChrome';
import { mediaUrl } from '../../../lib/media-url';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const posts = await reader.collections.posts.all();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [homepage, post] = await Promise.all([
    reader.singletons.homepage.read(),
    reader.collections.posts.read(slug),
  ]);

  if (!post) notFound();

  const siteName = homepage?.siteName ?? 'Keystatic 教学主题';
  const { node } = await post.content();
  const cover = mediaUrl(post.coverSrc);

  return (
    <div className="theme">
      <SiteHeader siteName={siteName} />
      <article className="section post">
        <p className="eyebrow">
          <Link href="/posts">文章</Link>
          {post.publishedAt ? ` · ${post.publishedAt}` : null}
        </p>
        <h1>{post.title}</h1>
        {post.summary ? <p className="lede">{post.summary}</p> : null}
        {cover ? (
          <img className="post-cover" src={cover} alt={post.coverAlt ?? ''} />
        ) : null}
        <div className="post-body">{renderMarkdoc(node)}</div>
      </article>
      <SiteFooter siteName={siteName} />
    </div>
  );
}
