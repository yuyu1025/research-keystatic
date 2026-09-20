import Link from 'next/link';
import type { HomepageSection, PostSummary } from '../lib/content-types';
import { mediaUrl } from '../lib/media-url';

/**
 * 首页区块 → React 组件。switch 必须穷尽 HomepageSection['discriminant']。
 * 你在 schema 里加了一种 block、却忘了这里的 case，`never` 赋值会编译失败。
 * 别加 default 里 return null 来「兜底」——那是在撒谎。
 */
export function renderSection(
  section: HomepageSection,
  posts: PostSummary[]
) {
  switch (section.discriminant) {
    case 'hero':
      return <Hero {...section.value} />;
    case 'figure':
      return <Figure {...section.value} />;
    case 'features':
      return <Features {...section.value} />;
    case 'split':
      return <Split {...section.value} />;
    case 'quote':
      return <Quote {...section.value} />;
    case 'posts':
      return <PostList {...section.value} posts={posts} />;
    case 'cta':
      return <Cta {...section.value} />;
    default: {
      const missed: never = section;
      throw new Error(`未处理的首页区块: ${JSON.stringify(missed)}`);
    }
  }
}

function Hero({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  imageSrc = '',
  imageAlt = '',
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const image = mediaUrl(imageSrc);
  return (
    <section className="section hero">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p className="lede">{description}</p> : null}
      <div className="hero-actions">
        {primaryLabel ? <HrefButton href={primaryHref}>{primaryLabel}</HrefButton> : null}
        {secondaryLabel ? (
          <HrefButton href={secondaryHref} variant="ghost">
            {secondaryLabel}
          </HrefButton>
        ) : null}
      </div>
      {image ? <img className="hero-image" src={image} alt={imageAlt} /> : null}
    </section>
  );
}

function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const image = mediaUrl(src);
  if (!image) {
    return (
      <section className="section">
        <p className="empty">配图还没有文件。在左侧选一张图。</p>
      </section>
    );
  }
  return (
    <section className="section">
      <figure className="site-figure">
        <img src={image} alt={alt} />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    </section>
  );
}

function Features({
  title,
  items,
}: {
  title: string;
  items: readonly { title: string; body: string }[];
}) {
  return (
    <section className="section">
      <h2>{title}</h2>
      <ul className="feature-grid">
        {items.map(item => (
          <li key={item.title} className="feature-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Split({
  kicker,
  title,
  body,
  asideTitle,
  asideBody,
}: {
  kicker: string;
  title: string;
  asideTitle: string;
  body: string;
  asideBody: string;
}) {
  return (
    <section className="section split">
      <div>
        {kicker ? <p className="eyebrow">{kicker}</p> : null}
        <h2>{title}</h2>
        <p className="split-body">{body}</p>
      </div>
      <aside className="split-aside">
        <h3>{asideTitle}</h3>
        <p>{asideBody}</p>
      </aside>
    </section>
  );
}

function Quote({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <section className="section">
      <blockquote className="pull-quote">
        <p>{quote}</p>
        <footer>
          <cite>{author}</cite>
          {role ? <span>{role}</span> : null}
        </footer>
      </blockquote>
    </section>
  );
}

function PostList({
  title,
  limit,
  posts,
}: {
  title: string;
  limit: number | null;
  posts: PostSummary[];
}) {
  if (limit === null || limit < 1) {
    throw new Error('文章列表的 limit 必须是 ≥ 1 的整数');
  }

  const items = [...posts]
    .sort(byPublishedAtDesc)
    .slice(0, limit);

  return (
    <section className="section">
      <div className="section-heading">
        <h2>{title}</h2>
        <Link href="/posts">全部文章</Link>
      </div>
      {items.length === 0 ? (
        <p className="empty">还没有文章。去 Admin 的「文章」里写一篇。</p>
      ) : (
        <ul className="post-list">
          {items.map(post => {
            const cover = mediaUrl(post.coverSrc);
            return (
              <li key={post.slug}>
                <Link href={`/posts/${post.slug}`}>
                  {cover ? (
                    <img className="post-list-cover" src={cover} alt={post.coverAlt} />
                  ) : null}
                  <strong>{post.title}</strong>
                  {post.summary ? <span>{post.summary}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Cta({
  title,
  body,
  buttonLabel,
  buttonHref,
}: {
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  return (
    <section className="section cta">
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
      {buttonLabel ? <HrefButton href={buttonHref}>{buttonLabel}</HrefButton> : null}
    </section>
  );
}

function HrefButton({
  href,
  variant = 'solid',
  children,
}: {
  href: string;
  variant?: 'solid' | 'ghost';
  children: string;
}) {
  const className = variant === 'ghost' ? 'btn btn-ghost' : 'btn';
  if (href.startsWith('/')) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

function byPublishedAtDesc(a: PostSummary, b: PostSummary) {
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
}
