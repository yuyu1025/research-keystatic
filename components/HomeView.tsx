import type { Homepage, PostSummary } from '../lib/content-types';
import { renderSection } from './sections';
import { SiteFooter, SiteHeader } from './SiteChrome';

/**
 * 纯渲染。数据从哪来（磁盘 / 内存草稿）由调用方决定。
 * 工作室右栏喂草稿，/preview 喂 Reader 读出来的文件。
 */
export function HomeView({
  homepage,
  posts,
  embed = false,
}: {
  homepage: Homepage;
  posts: PostSummary[];
  embed?: boolean;
}) {
  return (
    <div className="theme">
      {embed ? null : <SiteHeader siteName={homepage.siteName} />}
      <main>
        {homepage.sections.length === 0 ? (
          <p className="empty">
            首页还没有区块。在左侧加一个 Hero，右侧会立刻出现。
          </p>
        ) : (
          homepage.sections.map((section, index) => (
            <div key={`${section.discriminant}-${index}`}>
              {renderSection(section, posts)}
            </div>
          ))
        )}
      </main>
      {embed ? null : <SiteFooter siteName={homepage.siteName} />}
    </div>
  );
}
