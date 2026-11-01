# 网站修改指南（中文）

这份指南对应当前这个公开仓库里的网页版 CV。它是**纯静态 HTML**：没有框架、没有构建步骤，
改完保存、刷新浏览器就能看到效果。

---

## 1. 先明确：现在是什么状态？

- 现在它是一个 **public GitHub 仓库**；GitHub Pages 还需要在设置里开启一次（见第 6 节）。
- 直接把 `index.html` 单独发给别人：**不行**。CSS、JS、照片、PDF 都在 `assets/` 里，
  只发一个 HTML 文件，对方看到的会是没有样式的纯文字。
- 想直接分享文件：把**整个网站文件夹**压缩后发过去，对方解压后双击
  `index.html` 就能看。字体走 Google Fonts，没网时会退回到系统字体；复制邮箱在
  `file://` 下可能被浏览器限制。
- 想分享一个链接：按第 6 节发布到 GitHub Pages，之后发网址即可。

---

## 2. 本地怎么改、怎么看效果

推荐用本地服务器预览（比双击更接近线上环境）：

```bash
cd Hao-Li-public-resume
python3 -m http.server 8000
```

打开 <http://localhost:8000>。改完文件后刷新浏览器；如果样式没变，按
`Cmd + Shift + R` 强制刷新缓存。

也可以用 VS Code 打开整个仓库，安装 “Live Server” 插件，右键 `index.html` →
“Open with Live Server”。

### 用 make 管理（推荐）

在仓库根目录下运行：

| 命令 | 作用 |
| --- | --- |
| `make` | 列出所有命令 |
| `make serve` | 本地预览（默认 8000 端口，可 `make serve PORT=9000`） |
| `make build` | 检查链接和资源 |
| `make tex` | 编译私有仓库里的 LaTeX，并把 PDF 同步到网站 |
| `make pdf` | 只把已经编译好的 PDF 复制到网站 |
| `make check` | 检查 HTML 标签、内部链接、锚点、缺失文件 |
| `make print` | 生成 A4 打印预览 PDF |
| `make clean` | 清理缓存和生成文件 |
| `make rebuild` | `clean` + `build` |
| `make package` | 生成 `dist/web-cv.zip`，可拖到 Netlify Drop 发布 |
| `make deploy` | 提交并推送，Pages 自动重新发布 |

`make check` 不会检查“论文计数”是否正确，这部分仍需手动同步。

---

## 3. 页面是怎么组织的

`index.html` 从上到下是：

1. `<head>`：标题、SEO、社交分享、字体、CSS。
2. 图标 sprite：页面顶部那一大段 `<symbol>`，一般不用动。
3. `<header>`：顶部导航、主题切换、打印按钮。
4. `.hero`：姓名、职位、照片、四个数字。
5. `.body-grid`：
   - `<aside class="toc">`：左侧目录 + PDF 下载卡片。
   - `<div class="content">`：**11 个 `<section>`，一个 section 就是一个 block**。

每个 section 都有注释和固定 id：

| 章节 | id | 约在第几行（会随编辑移动） |
| --- | --- | --- |
| Profile | `profile` | 289 |
| Professional Experience | `experience` | 348 |
| Education | `education` | 456 |
| Funding & Grants | `funding` | 533 |
| Publications | `publications` | 655 |
| Teaching & Supervision | `teaching` | 1920 |
| Awards & Honours | `awards` | 2069 |
| Scientific Skills | `skills` | 2144 |
| Academic Service | `service` | 2210 |
| International Collaborations | `collaborations` | 2302 |
| Contact | `contact` | 2459 |

用编辑器搜索 `id="publications"` 就能直接跳到对应 block。

### 调整顺序

把整个 `<section ...> ... </section>` 剪切到另一个位置即可。然后同步改两处：

1. 顶部导航 `<nav class="site-nav">` 里的链接顺序；
2. 左侧 `<nav class="toc__list">` 里的链接顺序和编号 `01`–`11`。

滚动高亮是自动的：JS 会扫描所有 `.section[id]`，不需要改脚本。

### 新增一个章节

1. 复制一个 section，改 `id`、`aria-labelledby`、`section__index` 和标题；
2. 在顶部导航加一条 `<a href="#新id" data-spy="新id">…</a>`；
3. 在左侧 TOC 加一条 `<a href="#新id" data-spy="新id">…</a>`；
4. 后面的章节编号顺延。`data-spy` 必须和 section 的 `id` 完全一致。

---

## 4. 常见修改：复制这些模板

### 4.1 改一段文字

直接改 HTML 文本。注意特殊字符要转义：

- `&` 写成 `&amp;`
- `<` 写成 `&lt;`
- 引号、破折号、中文可以直接写（文件是 UTF-8）。

### 4.2 加一段工作经历 / 教育经历

在 `#experience` 或 `#education` 里找到 `.entry-list`，复制一个 `<article class="entry">`：

```html
<article class="entry">
  <div class="entry__when">2026/10 – now</div>
  <div class="entry__body">
    <h4 class="entry__title">职位名称</h4>
    <p class="entry__org">
      单位名称 — 导师/合作者：
      <a href="https://example.com" target="_blank" rel="noopener">姓名</a>
    </p>
    <p class="entry__desc">一句话描述，可删。</p>
  </div>
</article>
```

### 4.3 加一篇期刊论文

在 `#publications` 的 `panel-journal` 里，把下面这段放在 `<ul class="pub-list">` 的**最前面**：

```html
<li class="pub" data-year="2026" data-first="1">
  <span class="pub__num" aria-hidden="true">[44]</span>
  <div class="pub__body">
    <h4 class="pub__title">
      论文标题
      <span class="pub__badge">First author</span>
    </h4>
    <p class="pub__authors"><span class="me">Li, H.</span>, Zhang, H., Nishiwaki, S.</p>
    <p class="pub__venue"><em>Journal Name</em>, 12(3), 123–145 (2026).</p>
    <div class="pub__links">
      <a href="https://doi.org/10.xxxx/xxxxx" target="_blank" rel="noopener">
        <svg aria-hidden="true"><use href="#i-external"></use></svg>doi:10.xxxx/xxxxx
      </a>
    </div>
  </div>
</li>
```

两个关键属性：

- `data-year`：年份下拉框会**自动**收集，不用手动维护年份列表；
- `data-first="1"`：勾选 “First / corresponding” 时会保留这条；不是一作/通讯就写 `0`，
  并删掉标题里的 `<span class="pub__badge">…</span>`。

新增后还要手动同步这几个计数（这是目前唯一需要手工维护的地方）：

- 该 tab 的数字：`<span class="tab__count">43</span>` → 44；
- 顶部 Publications 概览里的 `.metric__value`；
- 首页 hero 的四个数字：同时改 `data-count` 和标签内的文字，例如
  `data-count="43">43</span>` → `data-count="44">44</span>`；
- 如果作者顺序、一作数量有变化，改正文里的 “11 peer-reviewed journal articles”。

### 4.4 加一篇会议论文 / 预印本 / 书

结构与期刊论文相同，只是放到对应的 panel：

- 预印本 → `panel-review`
- 书 → `panel-books`（没有年份也可以，不带 `data-year` 即可）
- 会议 → `panel-conference`

会议条目也支持 `data-first`。

### 4.5 加一个学术报告

在 `panel-talks` 里找到对应年份的 `.talk-year`，复制一个 `<li class="talk">`：

```html
<li class="talk" data-year="2026">
  <span class="talk__num" aria-hidden="true">[52]</span>
  <div>
    <p class="talk__title">报告标题</p>
    <p class="talk__meta">
      <span class="me">Li, H.</span>, Alexandersen, J. —
      <em>会议名称</em>, 城市, 国家, 2026 年 9 月 1–4 日。
    </p>
    <p class="talk__links">
      <a href="https://example.com" target="_blank" rel="noopener">链接文字</a>
    </p>
  </div>
</li>
```

同时改年份标题里的数量（例如 `2026 · 5 talks`）和 Talks tab 的 `51`。
如果是新的年份，复制整个 `<div class="talk-year" data-group="2026">…</div>` 再改年份。

### 4.6 加一个奖项 / 资助 / 合作者

奖项和资助是 `.card`：

```html
<article class="card">
  <span class="card__kicker">[5] · 2027</span>
  <h3 class="card__title">奖项名称</h3>
  <p class="card__text">颁发机构，获奖理由。</p>
  <div class="card__foot">
    <a class="link-btn" href="https://example.com" target="_blank" rel="noopener">News</a>
  </div>
</article>
```

合作者是 `.collab`：

```html
<article class="collab">
  <span class="collab__avatar" aria-hidden="true">XX</span>
  <div>
    <h3 class="collab__name">
      <a href="https://example.com" target="_blank" rel="noopener">姓名</a>
    </h3>
    <p class="collab__role">职位, 单位</p>
    <p class="collab__text">合作内容，一句话。</p>
  </div>
</article>
```

### 4.7 加一门课

在 `#teaching` 的 `.teach-list` 里：

```html
<li>
  <a href="课程链接" target="_blank" rel="noopener">课程名称</a>
  <span class="level">Graduate · 3.80/4.0</span>
</li>
```

没有评分就只写 `Undergraduate` 或 `Graduate`。

---

## 5. 排版、颜色、字体怎么改

都在 `assets/css/style.css`，文件开头是设计变量：

```css
:root {
  --bg: #f7f6f2;          /* 页面底色 */
  --surface: #ffffff;     /* 卡片底色 */
  --ink: #16201e;         /* 主文字 */
  --ink-soft: #46514e;    /* 次要文字 */
  --muted: #6b7673;       /* 辅助文字 */
  --line: #e2e0d8;        /* 分割线 */
  --accent: #0a6b60;      /* 主题色（青绿） */
  --accent-soft: #e4f1ee; /* 浅色背景块 */
  --wrap: 1180px;         /* 页面最大宽度 */
  --radius: 14px;         /* 圆角 */
  --font-serif: ...;      /* 标题字体 */
  --font-sans: ...;       /* 正文字体 */
}
```

深色模式在下面的 `[data-theme="dark"]` 里单独覆盖。**改浅色时最好把深色对应值也改一下**，
否则切换主题会不协调。

常用位置：

- 正文宽度：`--wrap`；
- 左侧目录宽度：`.body-grid { grid-template-columns: 210px … }`；
- 章节上下间距：`.section { padding: … }`；
- 章节标题字号：`.section__title { font-size: clamp(…) }`；
- 论文列表：`.pub`、`.pub__title`、`.pub__venue`；
- 打印版：文件末尾的 `@media print { … }`，改完用浏览器的“打印预览”看效果。

改了没生效，依次检查：缓存 → 选择器优先级 → 是否写在了对应的 `@media` 里。

---

## 6. 发布 / 更新线上版本

这个仓库是 **public**，所以可以直接用 GitHub Pages 的“分支部署”，不需要 Actions。

第一次发布：

1. `git add . && git commit -m "Add web CV" && git push`
2. GitHub 仓库 → **Settings → Pages → Build and deployment → Source** 选
   **Deploy from a branch**，Branch 选 **main**，Folder 选 **/ (root)**。
3. 保存后等 1–2 分钟，访问
   <https://haoli-ku.github.io/Hao-Li-public-resume/>。

以后每次改完：

```bash
git add .
git commit -m "Update CV"
git push
```

推送后 Pages 会自动重新发布，刷新网址即可。仓库里的 `.nojekyll` 会让 GitHub
跳过 Jekyll 处理，直接按静态文件发布。

如果以后换域名，记得改 `index.html` 里的 canonical、`og:url`、`og:image` 和 JSON-LD 里的 URL。

### LaTeX 更新后，网站会自动更新吗？

**目前不会。** 网页正文是独立的手写 HTML，不是从 `.tex` 自动生成的。

| 内容 | 更新方式 |
| --- | --- |
| 下载的 PDF | `make tex`（编译私有 LaTeX 仓库并同步）或 `make pdf`（只同步已编译的 PDF） |
| 网页正文 | 修改 `index.html`，或者把改动告诉我、由我来改 |
| 网页样式 | 修改 `assets/css/style.css` |

如果希望“只改 `.tex`，网页自动跟着变”，需要一次性改造，常见有两种做法：

1. **单一数据源**：把内容抽成 `cv.json` / `cv.yml`，再用脚本生成 LaTeX 和 HTML。
   维护最省心，但需要把现有内容迁移过去。
2. **写一个 `.tex → HTML` 的转换器**：解析 `moderncv` 的 `\section`、`\cvitem`、
   `\cvlistitem` 等命令，自动生成网页 section。可以做，但你的 LaTeX 里有大量自定义宏
   （`\iconlink`、`\DOIlink`、`` ``…'' `` 等），需要针对这个文件适配；排版细节也不如
   现在这样能逐块控制。

现阶段建议：**PDF 用 `make tex` 自动同步，网页正文按需手改**。如果你决定走自动生成，
告诉我选哪条路，我可以把脚本和迁移一起做掉。

---

## 7. 最容易踩的坑

1. **计数不同步**：加了论文但没改 tab 数字 / metrics / hero 数字。
2. **`data-spy` 和 `id` 不一致**：导航高亮会失效。
3. **只改了 `data-count` 没改标签文字**（或反过来）：JS 未执行时会显示错数字。
4. **`&` 没转义**：HTML 里写成 `&amp;`。
5. **图片路径写错**：图片放 `assets/img/`，用相对路径，例如 `assets/img/xxx.jpg`。
6. **新增链接忘了** `target="_blank" rel="noopener"`。
7. **直接改线上产物**：线上是自动部署的，改本地再 push 才会保留。

---

## 8. 如果以后想更省事

现在这种“一个 block 一段 HTML”的方式，适合偶尔改文字、加一两篇论文，优点是简单、
可控、随时能发。如果你以后想：

- 一次性批量导入几十篇论文；
- 不想手动同步计数；
- 或者想用 Markdown 写内容；

可以再把出版物抽成 `publications.json`，让 JS 自动渲染列表和计数。那会多一层数据文件，
但批量维护更轻松。需要的话直接说，我可以帮你改成那种结构。
