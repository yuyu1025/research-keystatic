import type { HomepageSection, HomepageSectionKind } from './content-types';

export const SECTION_OPTIONS: {
  kind: HomepageSectionKind;
  label: string;
}[] = [
  { kind: 'hero', label: 'Hero 首屏' },
  { kind: 'features', label: '特性网格' },
  { kind: 'split', label: '双栏' },
  { kind: 'quote', label: '引用' },
  { kind: 'posts', label: '文章列表' },
  { kind: 'cta', label: '行动号召' },
];

export function sectionLabel(kind: HomepageSectionKind): string {
  const found = SECTION_OPTIONS.find(option => option.kind === kind);
  if (!found) {
    throw new Error(`未知区块: ${kind}`);
  }
  return found.label;
}

/** 新建区块的默认值。预览立刻有东西可看，而不是一堆空字符串。 */
export function emptySection(kind: HomepageSectionKind): HomepageSection {
  switch (kind) {
    case 'hero':
      return {
        discriminant: 'hero',
        value: {
          eyebrow: '眉题',
          title: '新的首屏',
          description: '改左侧字段，右侧马上变。',
          primaryLabel: '主按钮',
          primaryHref: '/',
          secondaryLabel: '',
          secondaryHref: '/',
        },
      };
    case 'features':
      return {
        discriminant: 'features',
        value: {
          title: '特性',
          items: [{ title: '一条特性', body: '说明文字。' }],
        },
      };
    case 'split':
      return {
        discriminant: 'split',
        value: {
          kicker: '眉题',
          title: '双栏标题',
          body: '主栏正文。',
          asideTitle: '侧栏',
          asideBody: '侧栏正文。',
        },
      };
    case 'quote':
      return {
        discriminant: 'quote',
        value: {
          quote: '先把数据结构想清楚。',
          author: '作者',
          role: '',
        },
      };
    case 'posts':
      return {
        discriminant: 'posts',
        value: { title: '文章', limit: 3 },
      };
    case 'cta':
      return {
        discriminant: 'cta',
        value: {
          title: '行动号召',
          body: '',
          buttonLabel: '按钮',
          buttonHref: '/',
        },
      };
    default: {
      const missed: never = kind;
      throw new Error(`未处理的区块: ${String(missed)}`);
    }
  }
}
