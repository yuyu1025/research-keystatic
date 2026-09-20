# Keystatic 教学主题

给课堂用的 Keystatic + Next.js demo。首页是 **typed blocks 拼出来的**。`/` 是博客，`/keystatic` 是后台。

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
| http://localhost:3000 | 博客 |
| http://localhost:3000/posts | 文章列表 |
| http://localhost:3000/keystatic | 后台 |
| http://localhost:3000/keystatic/preview | 后台预览 |
| http://localhost:3000/keystatic/preview?edit=1 | 双栏编辑 |
| http://localhost:3000/assets | 资源库 |

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
| 文章正文 | Markdoc 内容组件（图片 / 附件 / Callout / Youtube / Highlight） | `content/posts/*.mdoc` |
| 图片和附件 | 编辑器里选文件，传到 Cloudflare R2 | 内容里只存公开 URL |

不要把首页写成一篇大 Markdown。首页是结构，文章才是叙述。

## 加一个首页区块

要让页面能渲染，改三处：

1. `keystatic.config.tsx` 的 `homepageSections`
2. `components/sections.tsx` 的 `switch`
3. `content/homepage.yaml`

要让工作室也能编这个区块，再改 `lib/homepage-blocks.ts` 和 `components/HomepageEditor.tsx`。两处都有 `never` 检查，漏了会编译失败或运行时炸掉。

逐步说明见 [如何加一个首页区块](content/posts/add-a-section.mdoc)。

## 图片和附件（Cloudflare R2）

Git 不存二进制。编辑器里点 **Choose file**，文件进 R2，YAML / Markdoc 只留下 URL。

线上 Worker 用 `wrangler.jsonc` 的 `r2_buckets` 绑定 `MEDIA`，不要再配 S3 密钥。公开域名写在 `vars.R2_PUBLIC_BASE_URL`。本地 `next dev` 走同一条绑定；要打真实桶时加 `"remote": true` 并 `wrangler login`。

首页 Hero / 配图、文章封面、正文「图片」「附件」都是同一个字段：选文件 → 上传 → 存 URL。正文里拖图、粘贴图也会走这条路。Markdoc 自带插图关掉了，那条路会把文件写进仓库。

## 发布

同一域名，两套宿主：

| 路径 | 行为 | 宿主 |
| --- | --- | --- |
| `/` | 博客 | GitHub Pages |
| `/keystatic` | 后台（子页在 `/keystatic/...`） | Cloudflare Worker |
| `/keystatic/preview` | 后台预览 | Cloudflare Worker |
| `/keystatic/preview?edit=1` | 左编辑、右即时预览 | Cloudflare Worker |
| `/assets`、`/api/assets` | 资源库 | Cloudflare Worker |

```
浏览器  /keystatic  ──► Worker ──GitHub OAuth──► 仓库 content/
                                                    │
                                                    ▼
                              GitHub Actions ──► Pages 静态站 + Worker
```

后台：https://research.distinctive.fun/keystatic  
预览：https://research.distinctive.fun/keystatic/preview

GitHub App 回调要包含：

```
https://research.distinctive.fun/api/keystatic/github/oauth/callback
http://localhost:3000/api/keystatic/github/oauth/callback
```

本地 `pnpm dev` 时路径一样，保存写本地文件。
