import Link from 'next/link';
import { isDevStudio } from '../lib/site-env';

export function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="site-header">
      <Link className="site-mark" href="/">
        {siteName}
      </Link>
      <nav>
        {isDevStudio ? <Link href="/studio">工作室</Link> : null}
        <Link href="/posts">文章</Link>
        <a href="/console">Admin</a>
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
