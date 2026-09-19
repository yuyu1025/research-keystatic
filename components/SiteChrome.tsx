import Link from 'next/link';
import { isStaticExport } from '../lib/site-env';

export function SiteHeader({ siteName }: { siteName: string }) {
  const homeHref = isStaticExport ? '/' : '/preview';
  return (
    <header className="site-header">
      <Link className="site-mark" href={homeHref}>
        {siteName}
      </Link>
      <nav>
        {isStaticExport ? null : <Link href="/">工作室</Link>}
        <Link href="/posts">文章</Link>
        {isStaticExport ? null : <a href="/keystatic">Admin</a>}
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
