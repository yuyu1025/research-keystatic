# Keystatic 教学主题

给课堂用的 Keystatic + Next.js demo。首页是 **typed blocks 拼出来的**，`/studio` 是 **左编辑、右预览** 的工作室。

```
左侧编辑器 ──onChange──► 内存草稿 ──► 右侧预览（即时）
                              │
                              └── Save ──► content/homepage.yaml
                                              │
                                              ▼
                                    /preview、Admin、Git
```

## 启动

```bash
pnpm install
pnpm dev
```

| 地址 | 干什么 |
| --- | --- |
| http://localhost:3000 | 主题首页 |
| http://localhost:3000/studio | 双栏工作室 |
| http://localhost:3000/posts | 文章列表 |
| http://localhost:3000/console | 双栏工作室 |
| http://localhost:3000/keystatic | Admin |

左侧改文案，右侧应立刻变。这时 `content/homepage.yaml` 还没动。点「保存到文件」（或 ⌘S）才写盘。独立预览 `/preview` 读的是文件，所以未保存的草稿那里看不见。

## 先读这些文件

1. `keystatic.config.tsx` — 内容结构，唯一真相
2. `components/sections.tsx` — 首页区块怎么渲染
3. `components/Studio.tsx` — 草稿和预览如何共享 state
4. `docs/TEACHING.md` — 课怎么上、作业怎么布置

## 两种组件化

| 场景 | 机制 | 存储 |
| --- | --- | --- |
| 首页 | `fields.blocks`，用 `discriminant` 选组件 | `content/homepage.yaml` |
| 文章正文 | Markdoc 内容组件（Callout / Youtube / Highlight） | `content/posts/*.mdoc` |

不要把首页写成一篇大 Markdown。首页是结构，文章才是叙述。

## 加一个首页区块

要让页面能渲染，改三处：

1. `keystatic.config.tsx` 的 `homepageSections`
2. `components/sections.tsx` 的 `switch`
3. `content/homepage.yaml`

要让工作室也能编这个区块，再改 `lib/homepage-blocks.ts` 和 `components/HomepageEditor.tsx`。两处都有 `never` 检查，漏了会编译失败或运行时炸掉。

逐步说明见 [如何加一个首页区块](content/posts/add-a-section.mdoc)。

## 发布

同一域名，两套宿主：

| 路径 | 行为 | 宿主 |
| --- | --- | --- |
| `/` | 纯预览 | GitHub Pages |
| `/keystatic` | 纯编辑（Admin） | Cloudflare Worker |
| `/console` | 左编辑、右即时预览 | Cloudflare Worker |

```
浏览器  /console  ──► Worker ──GitHub OAuth──► 仓库 content/
                                                    │
                                                    ▼
                              GitHub Actions ──► Pages 静态站 + Worker
```

双栏工作室：https://research.distinctive.fun/console  
Admin：https://research.distinctive.fun/keystatic

GitHub App 回调要包含：

```
https://research.distinctive.fun/api/keystatic/github/oauth/callback
http://localhost:3000/api/keystatic/github/oauth/callback
```

本地 `pnpm dev` 时 `/console` 同样是双栏，保存写本地文件。
