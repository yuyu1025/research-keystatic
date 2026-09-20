import type { Homepage, HomepageSection, HomepageSectionKind } from '../lib/content-types';
import { emptySection, SECTION_OPTIONS, sectionLabel } from '../lib/homepage-blocks';
import { AssetPicker } from './AssetPicker';

/**
 * 左侧编辑器。onChange 立刻改草稿，不碰磁盘。
 * 每种 discriminant 的字段在这里显式写出——和 sections.tsx 一样，靠 never 抓漏网。
 */
export function HomepageEditor({
  value,
  onChange,
}: {
  value: Homepage;
  onChange: (next: Homepage) => void;
}) {
  return (
    <div className="editor">
      <label className="editor-field">
        站点名称
        <input
          value={value.siteName}
          onChange={event => onChange({ ...value, siteName: event.target.value })}
        />
      </label>

      <div className="editor-add">
        <span>区块</span>
        <select
          defaultValue=""
          onChange={event => {
            const kind = event.target.value as HomepageSectionKind | '';
            event.target.value = '';
            if (!kind) return;
            onChange({
              ...value,
              sections: [...value.sections, emptySection(kind)],
            });
          }}
        >
          <option value="" disabled>
            添加区块
          </option>
          {SECTION_OPTIONS.map(option => (
            <option key={option.kind} value={option.kind}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {value.sections.map((section, index) => (
        <article key={`${section.discriminant}-${index}`} className="editor-block">
          <header className="editor-block-bar">
            <strong>{sectionLabel(section.discriminant)}</strong>
            <div>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onChange({ ...value, sections: move(value.sections, index, -1) })}
              >
                上移
              </button>
              <button
                type="button"
                disabled={index === value.sections.length - 1}
                onClick={() => onChange({ ...value, sections: move(value.sections, index, 1) })}
              >
                下移
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    sections: value.sections.filter((_, i) => i !== index),
                  })
                }
              >
                删除
              </button>
            </div>
          </header>
          <SectionFields
            section={section}
            onChange={next =>
              onChange({
                ...value,
                sections: value.sections.map((item, i) => (i === index ? next : item)),
              })
            }
          />
        </article>
      ))}
    </div>
  );
}

function SectionFields({
  section,
  onChange,
}: {
  section: HomepageSection;
  onChange: (next: HomepageSection) => void;
}) {
  switch (section.discriminant) {
    case 'hero':
      return (
        <>
          <TextField
            label="眉题"
            value={section.value.eyebrow}
            onChange={eyebrow => patch(section, onChange, { eyebrow })}
          />
          <TextField
            label="标题"
            value={section.value.title}
            onChange={title => patch(section, onChange, { title })}
          />
          <AreaField
            label="描述"
            value={section.value.description}
            onChange={description => patch(section, onChange, { description })}
          />
          <TextField
            label="主按钮文案"
            value={section.value.primaryLabel}
            onChange={primaryLabel => patch(section, onChange, { primaryLabel })}
          />
          <TextField
            label="主按钮链接"
            value={section.value.primaryHref}
            onChange={primaryHref => patch(section, onChange, { primaryHref })}
          />
          <TextField
            label="次按钮文案"
            value={section.value.secondaryLabel}
            onChange={secondaryLabel => patch(section, onChange, { secondaryLabel })}
          />
          <TextField
            label="次按钮链接"
            value={section.value.secondaryHref}
            onChange={secondaryHref => patch(section, onChange, { secondaryHref })}
          />
          <AssetPicker
            label="配图"
            value={section.value.imageSrc ?? ''}
            onChange={imageSrc => patch(section, onChange, { imageSrc })}
          />
          <TextField
            label="配图替代文本"
            value={section.value.imageAlt ?? ''}
            onChange={imageAlt => patch(section, onChange, { imageAlt })}
          />
        </>
      );
    case 'figure':
      return (
        <>
          <AssetPicker
            label="图片"
            value={section.value.src ?? ''}
            onChange={src => patch(section, onChange, { src })}
          />
          <TextField
            label="替代文本"
            value={section.value.alt}
            onChange={alt => patch(section, onChange, { alt })}
          />
          <TextField
            label="说明"
            value={section.value.caption}
            onChange={caption => patch(section, onChange, { caption })}
          />
        </>
      );
    case 'features':
      return (
        <>
          <TextField
            label="标题"
            value={section.value.title}
            onChange={title => patch(section, onChange, { title })}
          />
          {section.value.items.map((item, index) => (
            <div key={index} className="editor-item">
              <TextField
                label={`特性 ${index + 1} 标题`}
                value={item.title}
                onChange={title =>
                  patch(section, onChange, {
                    items: section.value.items.map((row, i) =>
                      i === index ? { ...row, title } : row
                    ),
                  })
                }
              />
              <AreaField
                label="说明"
                value={item.body}
                onChange={body =>
                  patch(section, onChange, {
                    items: section.value.items.map((row, i) =>
                      i === index ? { ...row, body } : row
                    ),
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  patch(section, onChange, {
                    items: section.value.items.filter((_, i) => i !== index),
                  })
                }
              >
                删除这条
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch(section, onChange, {
                items: [...section.value.items, { title: '新特性', body: '' }],
              })
            }
          >
            添加特性
          </button>
        </>
      );
    case 'split':
      return (
        <>
          <TextField
            label="眉题"
            value={section.value.kicker}
            onChange={kicker => patch(section, onChange, { kicker })}
          />
          <TextField
            label="标题"
            value={section.value.title}
            onChange={title => patch(section, onChange, { title })}
          />
          <AreaField
            label="正文"
            value={section.value.body}
            onChange={body => patch(section, onChange, { body })}
          />
          <TextField
            label="侧栏标题"
            value={section.value.asideTitle}
            onChange={asideTitle => patch(section, onChange, { asideTitle })}
          />
          <AreaField
            label="侧栏正文"
            value={section.value.asideBody}
            onChange={asideBody => patch(section, onChange, { asideBody })}
          />
        </>
      );
    case 'quote':
      return (
        <>
          <AreaField
            label="引言"
            value={section.value.quote}
            onChange={quote => patch(section, onChange, { quote })}
          />
          <TextField
            label="作者"
            value={section.value.author}
            onChange={author => patch(section, onChange, { author })}
          />
          <TextField
            label="身份"
            value={section.value.role}
            onChange={role => patch(section, onChange, { role })}
          />
        </>
      );
    case 'posts':
      return (
        <>
          <TextField
            label="标题"
            value={section.value.title}
            onChange={title => patch(section, onChange, { title })}
          />
          <label className="editor-field">
            显示数量
            <input
              type="number"
              min={1}
              max={20}
              value={section.value.limit ?? 3}
              onChange={event => {
                const limit = Number(event.target.value);
                if (!Number.isInteger(limit) || limit < 1) return;
                patch(section, onChange, { limit });
              }}
            />
          </label>
        </>
      );
    case 'cta':
      return (
        <>
          <TextField
            label="标题"
            value={section.value.title}
            onChange={title => patch(section, onChange, { title })}
          />
          <AreaField
            label="说明"
            value={section.value.body}
            onChange={body => patch(section, onChange, { body })}
          />
          <TextField
            label="按钮文案"
            value={section.value.buttonLabel}
            onChange={buttonLabel => patch(section, onChange, { buttonLabel })}
          />
          <TextField
            label="按钮链接"
            value={section.value.buttonHref}
            onChange={buttonHref => patch(section, onChange, { buttonHref })}
          />
        </>
      );
    default: {
      const missed: never = section;
      throw new Error(`未处理的编辑字段: ${JSON.stringify(missed)}`);
    }
  }
}

function patch<T extends HomepageSection>(
  section: T,
  onChange: (next: HomepageSection) => void,
  value: Partial<T['value']>
) {
  onChange({ ...section, value: { ...section.value, ...value } } as HomepageSection);
}

function move<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) {
    throw new Error(`无法把区块从 ${index} 移到 ${target}`);
  }
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="editor-field">
      {label}
      <input value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function AreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="editor-field">
      {label}
      <textarea
        rows={3}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    </label>
  );
}
