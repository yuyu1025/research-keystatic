import type { ReactNode } from 'react';

export type CalloutTone = 'tip' | 'note' | 'warning';

const TONE_LABEL: Record<CalloutTone, string> = {
  tip: '提示',
  note: '说明',
  warning: '警告',
};

function isTone(value: string): value is CalloutTone {
  return value === 'tip' || value === 'note' || value === 'warning';
}

/**
 * 文章正文组件。Admin 的 ContentView 和站点渲染共用，
 * 这样编辑器里看到的结构和线上是同一套，不是两套皮。
 *
 * Markdoc 把 tag 名映射到这里的导出键，见 keystatic.config.tsx 的 render.tags。
 */
export function Callout({
  tone,
  title,
  children,
}: {
  tone: string;
  title?: string;
  children: ReactNode;
}) {
  if (!isTone(tone)) {
    throw new Error(`未知的 Callout tone: ${tone}`);
  }

  return (
    <aside className={`mdoc-callout mdoc-callout--${tone}`} data-tone={tone}>
      <strong className="mdoc-callout-kicker">
        {title || TONE_LABEL[tone]}
      </strong>
      <div className="mdoc-callout-body">{children}</div>
    </aside>
  );
}

export function Highlight({ children }: { children: ReactNode }) {
  return <mark className="mdoc-highlight">{children}</mark>;
}

export function parseYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function Youtube({ url }: { url: string | null }) {
  if (!url) {
    throw new Error('Youtube 组件缺少 url');
  }

  const id = parseYoutubeId(url);
  if (!id) {
    throw new Error(`无法解析 YouTube URL: ${url}`);
  }

  return (
    <div className="mdoc-youtube">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export const markdocComponents = {
  Callout,
  Youtube,
  Highlight,
};
