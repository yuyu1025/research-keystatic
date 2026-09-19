# 教学指南

对象：做过 React、没碰过 Git-based CMS 的人。课时约 90 分钟。

## 课前目标

学生下课应能独立完成：

1. 在工作室里改首页文案，右栏立刻变，文件还没动
2. 新增一种首页区块（schema + 渲染器 + 数据）
3. 在文章里插入 Callout，并说清它和首页 blocks 不是同一套 API

做不到第 2 点，课就白上了。

## 仓库地图

```
keystatic.config.tsx     schema。先读这个。
content/                 数据。Admin 保存就是写这里。
  homepage.yaml          首页 blocks
  posts/*.mdoc           文章 + Markdoc 组件
components/
  Studio.tsx             草稿 state + 保存
  HomepageEditor.tsx     左栏表单，onChange 只改内存
  HomeView.tsx           纯渲染，不关心数据从哪来
  sections.tsx           discriminant → 组件
  markdoc.tsx            文章 tag → 组件
app/
  page.tsx               /
  preview/page.tsx       读文件的独立首页
  posts/                 文章列表和详情
  api/homepage           Save 写 YAML 的唯一入口
```

数据流向：

```
编辑器 onChange → 内存草稿 → 右栏 HomeView
                 ↓ Save
        content/homepage.yaml → /preview、Admin
```

右栏不读盘。所以没保存时 `/preview` 仍是旧的，这是对的。

## 建议节奏

### 1. 先看效果（10 分钟）

打开 `/`。让学生改 Hero 标题，**先别保存**，盯右栏。预览变了，文件没变。

再保存，打开 `content/homepage.yaml` 对答案。Git-based CMS 的秘密是第二下，不是第一下。

### 2. 首页为什么是 blocks（20 分钟）

对比两种首页：

- 一篇 Markdown：改结构就要改解析器
- `fields.blocks`：每种区块自己的字段表，Reader 给出 `{ discriminant, value }`

带学生看 `homepageSections` 和 `renderSection` 的 switch。点出 `never`：这是类型系统在替你做「是不是漏了渲染器」的检查。

### 3. 作业：加 stats 区块（25 分钟）

题目写在 `content/posts/add-a-section.mdoc`。教师只提示三处文件，不代写。

验收：右栏出现数字条，且 `pnpm build` 能过。

常见翻车：

- discriminant 拼错 → 页面直接 throw。让学生读报错，不要帮他们改成 `return null`
- `fields.object` 忘了包 → schema 只能是一个 field
- 改了 schema 没重启 dev → Keystatic Admin 还是旧菜单

### 4. 文章内容组件（20 分钟）

打开 `/keystatic/collection/posts`。插入提示框。

对照：

| | 首页 blocks | Markdoc 内容组件 |
| --- | --- | --- |
| 用在 | 整页分区 | 段落中间 |
| 存储 | YAML 数组 | `{% Tag %}` |
| 渲染 | switch(discriminant) | `render.tags` + React 组件 |

强调：`createMarkdocConfig` 的 `render.tags` 必须写。不写，transform 出来的节点没有组件名，页面上就是空的。

### 5. 为什么不 iframe Keystatic（15 分钟）

Keystatic Admin 的表单在它自己的 React 树里，Save 之前不写盘。把 Admin 塞进 iframe、右栏去读 `/preview`，只能看见文件——永远慢一拍。

官方 real-time preview 也是 Save 到 GitHub 分支之后。要「键入即预览」，草稿和预览必须共享 state。读 `Studio.tsx`：`draft` 一份，左边改、右边渲染，`PUT /api/homepage` 才写盘。

## 不要讲的

- Keystatic Cloud / GitHub mode。本课 storage 是 `local`
- `fields.document`（已被 markdoc 取代）
- 把 Tailwind 或组件库塞进来。CSS 在 `app/styles.css`，分区注释已经够用
- 「以后再抽象一个通用 PageBuilder」。现在 6 种区块，switch 刚刚好

## 布置作业（课后）

在 `features` 和 `cta` 之间加一种 `faq` 区块：问题 + 答案列表。要求：

1. schema 有 array
2. switch 穷尽
3. 种子数据写进 `homepage.yaml`
4. 工作室要能加这个区块的话，顺手改 HomepageEditor / homepage-blocks

## 三个问题（课末用）

1. 这是真问题还是想象的问题？首页需要排序、需要不同类型字段——blocks 是真问题；「可视化拖拽画布」对这个 demo 是想象。
2. 有没有更简单的方案？有：首页也写成一篇 Markdoc。更简单，但加「数字条」这种非叙述区块会立刻变脏。
3. 会不会破坏现有功能？加区块只要 discriminant 是新的，旧 YAML 不受影响。删一种区块会让旧数据在 switch 里炸掉——这是对的，迁移要显式做。
