import Link from 'next/link';

export function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="site-header">
      <Link className="site-mark" href="/">
        {siteName}
      </Link>
      <nav>
        <Link href="/posts">文章</Link>
        <a href="/console">工作室</a>
        <a href="/keystatic">Admin</a>
      </nav>
    </header>
  );
}

export function SiteFooter({ siteName }: { siteName: string }) {
  return (
    <footer className="site-footer">
      <p>
        {siteName} · 内容来自 <code>content/</code>，结构来自{' '}
        <code>keystatic.config.tsx</code>
      </p>
    </footer>
  );
}
