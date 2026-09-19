/**
 * Keystatic 的唯一 schema 入口。
 *
 * 先读这个文件，再看组件。首页能跑，是因为这里的 `discriminant`
 * 和 `components/sections.tsx` 的 switch 对得上——不是因为有什么魔法。
 *
 * 加一个新的首页区块，只改三处，缺一不可：
 *   1. 本文件 `homepageSections` 里加一种 block
 *   2. `components/sections.tsx` 的 switch 加一个 case
 *   3. `content/homepage.yaml` 里插入对应 discriminant
 *
 * 漏掉第 2 步会在 TypeScript 的 `never` 检查上炸掉。这是故意的。
 */
import { collection, config, fields, singleton } from '@keystatic/core';
import { block, mark, wrapper } from '@keystatic/core/content-components';
import { Callout, parseYoutubeId, Youtube } from './components/markdoc';
import { repoName, repoOwner } from './lib/site-env';

const highlightIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 13h10M5.5 10.5 11 5l1.5 1.5-5.5 5.5H5.5v-1.5Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 文章正文里的内容组件。Admin 编辑器的「插入」菜单会列出它们。
 * ContentView 只服务编辑器预览；站点渲染走 `components/markdoc.tsx`。
 * 两边共用同一组 React 组件，避免「编辑器里一个样、线上另一个样」。
 */
export const postContentComponents = {
  Callout: wrapper({
    label: '提示框',
    description: '带语气的提示容器，可包一段富文本。',
    ContentView: ({ value, children }) => (
      <Callout tone={value.tone} title={value.title}>
        {children}
      </Callout>
    ),
    schema: {
      tone: fields.select({
        label: '语气',
        options: [
          { label: '提示', value: 'tip' },
          { label: '说明', value: 'note' },
          { label: '警告', value: 'warning' },
        ],
        defaultValue: 'tip',
      }),
      title: fields.text({ label: '标题' }),
    },
  }),
  Youtube: block({
    label: 'YouTube',
    description: '粘贴完整 URL，不要只填视频 ID。',
    ContentView: ({ value }) => {
      if (!value.url || !parseYoutubeId(value.url)) {
        return <p>粘贴完整的 YouTube URL</p>;
      }
      return <Youtube url={value.url} />;
    },
    schema: {
      url: fields.url({
        label: 'YouTube 链接',
        validation: { isRequired: true },
      }),
    },
  }),
  Highlight: mark({
    label: '高亮',
    icon: highlightIcon,
    tag: 'mark',
    className: 'mdoc-highlight',
    schema: {},
  }),
};

/**
 * 给 @markdoc/markdoc 用的 tag → 组件名映射。
 * 不写 render.tags，transform 出来的节点没有 render 名，页面上就是空白。
 */
export const markdocConfig = fields.markdoc.createMarkdocConfig({
  components: postContentComponents,
  render: {
    tags: {
      Callout: 'Callout',
      Youtube: 'Youtube',
      Highlight: 'Highlight',
    },
  },
});

/**
 * 首页 page builder。每个 key 就是存储里的 discriminant。
 * schema 必须是「一个 field」——多个输入就包进 fields.object。
 */
const homepageSections = {
  hero: {
    label: 'Hero 首屏',
    schema: fields.object({
      eyebrow: fields.text({ label: '眉题' }),
      title: fields.text({ label: '标题' }),
      description: fields.text({ label: '描述', multiline: true }),
      primaryLabel: fields.text({ label: '主按钮文案' }),
      primaryHref: fields.text({ label: '主按钮链接' }),
      secondaryLabel: fields.text({ label: '次按钮文案' }),
      secondaryHref: fields.text({ label: '次按钮链接' }),
    }),
  },
  features: {
    label: '特性网格',
    schema: fields.object({
      title: fields.text({ label: '标题' }),
      items: fields.array(
        fields.object({
          title: fields.text({ label: '标题' }),
          body: fields.text({ label: '说明', multiline: true }),
        }),
        {
          label: '特性',
          itemLabel: props => props.fields.title.value || '未命名特性',
        }
      ),
    }),
  },
  split: {
    label: '双栏',
    schema: fields.object({
      kicker: fields.text({ label: '眉题' }),
      title: fields.text({ label: '标题' }),
      body: fields.text({ label: '正文', multiline: true }),
      asideTitle: fields.text({ label: '侧栏标题' }),
      asideBody: fields.text({ label: '侧栏正文', multiline: true }),
    }),
  },
  quote: {
    label: '引用',
    schema: fields.object({
      quote: fields.text({ label: '引言', multiline: true }),
      author: fields.text({ label: '作者' }),
      role: fields.text({ label: '身份' }),
    }),
  },
  posts: {
    label: '文章列表',
    schema: fields.object({
      title: fields.text({ label: '标题' }),
      limit: fields.integer({
        label: '显示数量',
        defaultValue: 3,
        validation: { min: 1, max: 20, isRequired: true },
      }),
    }),
  },
  cta: {
    label: '行动号召',
    schema: fields.object({
      title: fields.text({ label: '标题' }),
      body: fields.text({ label: '说明', multiline: true }),
      buttonLabel: fields.text({ label: '按钮文案' }),
      buttonHref: fields.text({ label: '按钮链接' }),
    }),
  },
};

const richTextOptions = {
  bold: true,
  italic: true,
  strikethrough: true,
  code: true,
  heading: true,
  blockquote: true,
  orderedList: true,
  unorderedList: true,
  link: true,
  divider: true,
  table: true,
  codeBlock: true,
} as const;

export default config({
  storage: {
    kind: 'github',
    repo: { owner: repoOwner, name: repoName },
  },
  ui: {
    brand: { name: '教学 Demo' },
    navigation: {
      页面: ['homepage'],
      内容: ['posts'],
    },
  },
  singletons: {
    homepage: singleton({
      label: '首页',
      path: 'content/homepage',
      previewUrl: '/preview',
      schema: {
        siteName: fields.text({
          label: '站点名称',
          defaultValue: 'Keystatic 教学主题',
        }),
        sections: fields.blocks(homepageSections, {
          label: '首页区块',
          description:
            'Admin 里拖拽排序。工作室左侧是同一份数据的即时草稿；每个 discriminant 必须在 sections.tsx 有对应 case。',
        }),
      },
    }),
  },
  collections: {
    posts: collection({
      label: '文章',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      previewUrl: '/posts/{slug}',
      schema: {
        title: fields.slug({ name: { label: '标题' } }),
        summary: fields.text({ label: '摘要', multiline: true }),
        publishedAt: fields.date({
          label: '发布日期',
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: '正文',
          options: richTextOptions,
          components: postContentComponents,
        }),
      },
    }),
  },
});
