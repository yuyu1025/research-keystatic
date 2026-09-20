import { cookies } from 'next/headers';
import { HomeView } from '../../../components/HomeView';
import { Studio } from '../../../components/Studio';
import { loadHomepage, loadPostSummaries } from '../../../lib/load-site';

export const dynamic = 'force-dynamic';

export default async function KeystaticPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const token = (await cookies()).get('keystatic-gh-access-token')?.value;
  const [homepage, posts] = await Promise.all([
    loadHomepage(token),
    loadPostSummaries(token),
  ]);

  if (edit === '1') {
    return <Studio initial={homepage} posts={posts} />;
  }

  return (
    <div>
      <nav className="studio-toolbar" aria-label="预览工具栏">
        <div className="studio-brand">
          <strong>预览</strong>
          <span>后台子页 · 读当前仓库内容</span>
        </div>
        <nav className="studio-modes">
          <span aria-current="page">纯预览</span>
          <a href="/keystatic/preview?edit=1">双栏</a>
          <a href="/assets">资源库</a>
          <a href="/keystatic">后台</a>
        </nav>
        <div className="studio-actions">
          <a href="/" target="_blank" rel="noreferrer">
            已发布站点
          </a>
        </div>
      </nav>
      <HomeView homepage={homepage} posts={posts} />
    </div>
  );
}
