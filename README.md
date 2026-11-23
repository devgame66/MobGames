# MobGames 推广页（more.mo-mb.com）

我们各款 Android / iOS 游戏里"更多游戏"按钮打开的页面。App 用 **WebView** 加载它，所以很多用户是在低端安卓机上看到的：页面要小、要快、不能卡。

- 线上地址：https://more.mo-mb.com/（GitHub Pages，域名写在 `CNAME`）
- **合并到 `main` 就立即上线，所有 App 的"更多游戏"页同时变化。** 改动先在分支上做，用手机看过再合并。
- `app-ads.txt` 是各广告平台要求的授权文件，和页面无关，不要删改。

## 页面结构

从上到下三块：

1. **主推卡片**：一款重点推广的游戏，渐变色背景（纯 CSS，不用图片），有"Featured"标签和 NEW 角标（可去掉）、图标、名字、一句介绍和"Get it free"按钮。为了节省篇幅和流量，不放横幅大图。
2. **图标网格**：其余 App，每行 3 个，每个有图标、名字（最多两行）和 GET 按钮。
3. **Play instantly — no download**：我们网站 peersgames.com 上的 H5 小游戏，分 FPS 和摩托两行，左右滑动。

点 App 去 Google Play（带 `referrer=utm_source=more&utm_medium=banner`）；iPhone / iPad 上自动改去 App Store，没有 iOS 版本的游戏在 iPhone 上隐藏。

## 怎么修改

**不要直接改 `index.html`**，它由 `build.js` 生成。改完数据后在仓库根目录运行：

```
node build.js
```

`build.js` 开头有三份数据：

| 数据 | 改什么 |
|---|---|
| `featured` | 主推游戏：`name`、`line`（一句介绍）、`pkg`（Play 包名）、`ios`（App Store id，没有就写 `''`）、`badge`（角标文字，`''` 为不显示） |
| `apps` | 网格里的 App，按页面顺序。字段同上，没有 `badge` |
| `web` | H5 游戏：每行的标题、`more`（"See all" 指向 PeersGames 的哪个分类）和游戏列表 `[slug, 显示名]` |

`build.js` 会检查：每款游戏的图标都在、主推游戏没有同时出现在网格里。缺了会报错并提示要运行的命令。

### 常见操作

**加一款 App**
1. `python tools/images.py icon <包名>`：从 Google Play 下载图标，生成两种尺寸。
2. 在 `apps` 里加一行，名字和 Play 上一致；介绍写一句话，不要照抄 Play 上堆关键词的简介。
3. `node build.js`

**换主推游戏**
1. `python tools/images.py icon <包名>`
2. 改 `featured`；如果这款原来在 `apps` 里，从 `apps` 删掉；原来的主推游戏如果还要显示，加回 `apps`。
3. `node build.js`

**下架一款 App**：从 `apps` 删掉那一行，`node build.js`。不用的图标文件可以一起删。上架前可以用浏览器打开 `https://play.google.com/store/apps/details?id=<包名>` 确认链接有效（返回 404 就是已下架）。

**换 H5 游戏**：只从 peersgames.com 上已经上线的游戏里选（`https://peersgames.com/game/<slug>/` 能打开），并优先选：
- **GamePix 的游戏**：封面可以取 240px 小图，页面上的封面地址就是按 GamePix 的格式拼的；GameMonetize 的封面只有一种大图，不要放；
- 首次加载小（PeersGames 的 `web/data/games.json` 里 `mobile.phoneLoadMb`，最好 10 MB 以内）、真机测过触屏能玩的。

## 图片规范

| 图片 | 位置和命名 | 尺寸 | 格式 | 大小上限 | 说明 |
|---|---|---|---|---|---|
| App 图标（页面用） | `icon/<包名>.jpg` | 128 × 128 | JPG，质量 80，渐进式 | 12 KB | 页面上显示 72px（网格和主推卡片都是），128px 在 2 倍屏上足够清晰 |
| App 图标原图 | `icon/512/<包名>.jpg` | 512 × 512 | JPG，质量 80 | — | 只存档，页面不加载；以后要做大图时用 |
| H5 游戏封面 | 不存本地，直接用 GamePix 地址 `…/cover/<slug>.png?w=240` | 240 宽，4:3 显示 | — | 约 10–25 KB | 滑到才加载 |

- 图标一律用 **Play 商店上的当前图标**（`tools/images.py icon` 自动下载），保证和商店一致；以包名命名，调整顺序不用改文件名。
- 不要用 PNG 做照片类图标，体积是 JPG 的几倍；不要上传 512px 图让页面缩小显示。
- `tools/images.py` 需要 Python 和 Pillow（`pip install pillow`），超过大小上限会在输出里提示。

## 速度规范（低端机）

当前首屏：HTML 约 14 KB + 首屏 7 个图标约 45 KB，没有其他图片。新增内容时保持在下面的范围内：

- **不加**横幅大图、网页字体、图标字体、CSS / JS 框架、轮播动画、模糊（`backdrop-filter`）、大阴影。
- 列表是**静态 HTML**，不靠 JS 生成；JS 只负责 iOS 换链接和点击统计。
- 每张图片都写 `width` / `height` 或放在固定比例的框里，加载时页面不跳动。
- 首屏以下的图片加 `loading="lazy"`（`build.js` 已对网格第 7 个起和全部 H5 封面加上）。
- Google Analytics 在页面加载完 1.2 秒后才载入，不要改回 `<head>` 里同步加载。
- 页面最大宽度 640px，在 360px 宽的手机上不能出现横向滚动。改完用浏览器的手机模拟（360 × 740）看一遍。

## 统计

- **Google Analytics**（`G-RM37QWEYQ9`）：`click_link` 是点 App（主推卡片的 label 为 `featured`，value 100；网格的 value 是在 `apps` 里的序号）；`click_h5` 是点 H5 游戏（label 为游戏 slug 或 `more-fps` / `more-moto`）。
- **PeersGames 那边**：H5 链接带 `utm_source=mo-mb&utm_medium=more_page&utm_campaign=fps|moto|more`。PeersGames 用这个参数记两个匿名计数：`ref:mo-mb:view`（从这里来的访问）和 `ref:mo-mb:play`（其中点了 Play 的），存在 PeersGames 的 D1 `ui` 表。

## 政策注意（Google Play / App Store）

这个页面在 App 里打开，算 App 内容的一部分：

- H5 区块必须**写明是网站**（现在写的是 "Free browser games on our website, peersgames.com"），按钮用 ▶ / Play，**不要**做成 "Download"、"Install" 或系统提示的样子。
- 只放 13 岁以上、和 App 分级相符的游戏；如果某款 App 的目标受众包含 13 岁以下（Designed for Families），那款 App 不要打开这个页面。
- H5 只选 GamePix 游戏的另一个原因：我们在 GamePix 的广告目前没开，在 App 的 WebView 里玩不会产生网页广告流量。GamePix 广告开通后，最好让 App 把 peersgames.com 的链接交给外部浏览器（Android Custom Tabs、iOS SFSafariViewController）打开。
