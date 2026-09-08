# 道友 3D 闪卡画廊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩大首页三张入口卡片间距，并让“道友”进入一个使用韩立分层素材、真实 Blender 卡片几何和九卡 3×3 布局的 Three.js 闪卡网页。

**Architecture:** 首页只维护可扩展的入口配置和同页链接；RuiC Card 生成源保存在 `card-projects/daoyou/`，可部署静态网页位于 `public/gallery/daoyou/`。九张卡共享一个 WebGL renderer、导出几何和纹理，通过独立根节点、射线检测及响应式布局函数维护各自交互状态。

**Tech Stack:** React 19、TypeScript、Vite 6、GSAP、Three.js 0.180、Blender、Node `node:test`、RuiC-card-skill 流水线、内置 ImageGen。

**Spec:** `docs/superpowers/specs/2026-09-08-daoyou-3d-card-gallery-design.md`

## Global Constraints

- 采用 A 方案：原图不覆盖；派生背景、透明人物、配准线稿和透明文字层。
- 不向卡面添加姓名、招式、版本号或官方联名文字。
- 桌面九张卡严格 3×3；中等宽度两列；390px 手机单列且无横向溢出。
- 使用真实 Blender 卡片几何，保留 `web_front`、`web_edge`、`web_back`、`web_gold` 材质契约。
- 一个页面只创建一个 WebGL renderer；九张卡共享几何、纹理和材质数据。
- “仙途 / 惊鸿”不创建占位页，只保留可追加 `href` 的入口配置。
- 不修改启动加载器、人物视频、九图壁纸映射或用户已有的其他未提交改动。
- 运行时网页不依赖主 React 包新增 Three.js 依赖。

---

### Task 1: 首页入口配置与卡片间距

**Files:**
- Modify: `tests/wallpaper-gallery.test.mjs`
- Modify: `src/components/landing/sections/WallpaperGallerySection.tsx`
- Modify: `src/components/landing/sections/WallpaperGallerySection.css`

**Interfaces:**
- Consumes: 现有 `.wallpaper-card` GSAP 指针动画和移动端横向滚动。
- Produces: `galleryEntries: readonly GalleryEntry[]`；“道友”链接 `/gallery/daoyou/`；桌面 `--gallery-card-gap` 32–40px。

- [ ] **Step 1: 写入口和间距失败测试**

在现有首个卡片测试中断言三张标签仍存在、只有“道友”是链接、“仙途 / 惊鸿”没有空链接；新增 CSS 断言：

```js
assert.match(html, /<a[^>]+href="\/gallery\/daoyou\/"[^>]*>/);
assert.equal((html.match(/href="\/gallery\//g) ?? []).length, 1);
assert.match(html, /仙途/);
assert.match(html, /惊鸿/);
assert.match(html, /道友/);

const styles = await readFile(
  "src/components/landing/sections/WallpaperGallerySection.css",
  "utf8",
);
assert.match(styles, /--gallery-card-gap:\s*clamp\(2rem,\s*3vw,\s*2\.5rem\)/);
assert.match(styles, /\.wallpaper-card--link:focus-visible/);
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `node --test tests/wallpaper-gallery.test.mjs`  
Expected: FAIL，原因是尚无 `/gallery/daoyou/` 链接且 gap 仍为旧值。

- [ ] **Step 3: 实现最小入口配置与语义链接**

在组件顶部定义并导出：

```ts
export type GalleryEntry = {
  id: "xiantu" | "jinghong" | "daoyou";
  label: string;
  href?: string;
};

export const galleryEntries = [
  { id: "xiantu", label: "仙途" },
  { id: "jinghong", label: "惊鸿" },
  { id: "daoyou", label: "道友", href: "/gallery/daoyou/" },
] as const satisfies readonly GalleryEntry[];
```

提取只负责字标内容的 `GalleryEntryWordmark`，有 `href` 时用 `<a className="wallpaper-card wallpaper-card--link">`，否则沿用 `<figure className="wallpaper-card">`。保持 `.wallpaper-card__logo` 在两种容器中的 DOM 层级一致，让现有 GSAP 查询无需分支。

CSS 将桌面 gap 改为：

```css
--gallery-card-gap: clamp(2rem, 3vw, 2.5rem);
```

移动端 `.wallpaper-gallery__track` 继续覆盖 `gap: 0.8rem`。链接增加 `color: inherit; text-decoration: none; cursor: pointer` 和高对比度 `:focus-visible` 轮廓。

- [ ] **Step 4: 运行聚焦测试和全部现有测试**

Run: `node --test tests/wallpaper-gallery.test.mjs`  
Expected: PASS。  
Run: `node --test tests/*.test.mjs`  
Expected: 新测试通过；若有既有失败，记录其完整名称，不顺手改动无关模块。

- [ ] **Step 5: 独立提交入口改动**

```powershell
git add -- tests/wallpaper-gallery.test.mjs src/components/landing/sections/WallpaperGallerySection.tsx src/components/landing/sections/WallpaperGallerySection.css
git commit --only -m "页面：接入道友闪卡入口并扩大卡片间距" -- tests/wallpaper-gallery.test.mjs src/components/landing/sections/WallpaperGallerySection.tsx src/components/landing/sections/WallpaperGallerySection.css
```

---

### Task 2: 韩立分层资产与 RuiC 生成源

**Files:**
- Modify: `.gitignore`
- Create: `tests/daoyou-card-assets.test.mjs`
- Create: `card-projects/daoyou/card-config.json`
- Create: `card-projects/daoyou/provenance.md`
- Create: `card-projects/daoyou/assets/source.jpg`
- Create: `card-projects/daoyou/assets/background.png`
- Create: `card-projects/daoyou/assets/subject.png`
- Create: `card-projects/daoyou/assets/lineart.png`
- Create: `card-projects/daoyou/assets/text.png`

**Interfaces:**
- Consumes: 用户提供的韩立图片 `C:/Users/28645/AppData/Local/Temp/codex-clipboard-4741bede-35b7-480b-be1c-527aebead9a1.jpg`，身份与构图基准。
- Produces: RuiC 校验器接受的同画布四层素材及 `card-config.json`。

- [ ] **Step 1: 写资产合同失败测试**

测试用 Node 标准库读取配置和 PNG 头，不引入测试依赖：

```js
test("道友卡片配置保持无新增文案并引用四层素材", async () => {
  const config = JSON.parse(
    await readFile("card-projects/daoyou/card-config.json", "utf8"),
  );
  assert.equal(config.title, "");
  assert.equal(config.subtitle, "");
  assert.deepEqual(config.assets, {
    background: "assets/background.png",
    subject: "assets/subject.png",
    lineart: "assets/lineart.png",
    text: "assets/text.png",
  });
});

test("四层 PNG 使用同一画布且人物层含 alpha", async () => {
  const layers = await Promise.all(
    ["background", "subject", "lineart", "text"].map(readPngHeader),
  );
  assert.deepEqual(new Set(layers.map(({ width, height }) => `${width}x${height}`)).size, 1);
  assert.equal(layers.find(({ name }) => name === "subject").hasAlpha, true);
});
```

`readPngHeader(name)` 读取 PNG signature、IHDR 宽高和 color type；color type 4 或 6 视为含 alpha。

- [ ] **Step 2: 运行资产测试并确认按预期失败**

Run: `node --test tests/daoyou-card-assets.test.mjs`  
Expected: FAIL，原因是 `card-projects/daoyou/card-config.json` 与素材尚不存在。

- [ ] **Step 3: 保存源图并生成三个派生图层**

非破坏性复制原图到 `assets/source.jpg`。通过内置 ImageGen 分三次编辑同一个已查看的源图：

1. `background.png`：`precise-object-edit`，只移除人物并自然补全原位置的云雾、山体和道路；锁定构图、镜头、色调和尺寸；无文字、无水印。
2. `subject.png`：`background-extraction`，精确保留人物面容、身体、发丝、衣摆、姿态和原始光照；真正透明背景；无描边、无文字、无水印。
3. `lineart.png`：`identity-preserve`，同画布同姿态的稀疏黑色单线轮廓，白色背景；不改变人物比例，不增加阴影、填充或文字。

生成结果逐张用图像查看工具检查。最终文件移动到项目后再被代码引用，原图不覆盖。`text.png` 使用 RuiC 字体脚本或 Pillow 生成同画布全透明 RGBA 图，不绘制文字。

- [ ] **Step 4: 写入配置和来源记录**

`card-config.json` 使用技能示例的现有字段，关键值固定为：

```json
{
  "title": "",
  "subtitle": "",
  "technique": "",
  "edition": "",
  "assets": {
    "background": "assets/background.png",
    "subject": "assets/subject.png",
    "lineart": "assets/lineart.png",
    "text": "assets/text.png"
  },
  "appearance": {
    "background": "#06181f",
    "subjectScale": 1.25,
    "subjectDepth": 0.28,
    "backgroundDepth": -0.2,
    "textScale": 1,
    "textDepth": 0
  }
}
```

`provenance.md` 写明源图角色、三个最终提示词、内置 ImageGen 模式以及未添加文案的约束。.gitignore 只增加：

```gitignore
card-projects/daoyou/tools/
card-projects/daoyou/web/node_modules/
card-projects/daoyou/.tmp/
```

- [ ] **Step 5: 运行测试、技能校验并目视检查**

Run: `node --test tests/daoyou-card-assets.test.mjs`  
Expected: PASS。  
Run: `python C:/Users/28645/.codex/skills/RuiC-card-skill/scripts/validate_assets.py card-projects/daoyou`  
Expected: exit 0；四层尺寸一致；透明人物层和透明文字层通过 alpha 校验。

- [ ] **Step 6: 独立提交分层资产**

```powershell
git add -- .gitignore tests/daoyou-card-assets.test.mjs card-projects/daoyou/card-config.json card-projects/daoyou/provenance.md card-projects/daoyou/assets
git commit --only -m "资源：生成道友闪卡分层素材" -- .gitignore tests/daoyou-card-assets.test.mjs card-projects/daoyou/card-config.json card-projects/daoyou/provenance.md card-projects/daoyou/assets
```

---

### Task 3: Blender 基线与九卡布局核心

**Files:**
- Create: `tests/daoyou-card-gallery.test.mjs`
- Create: `card-projects/daoyou/card.blend`
- Create: `card-projects/daoyou/web/assets/card.glb`
- Create: `card-projects/daoyou/web/gallery-layout.mjs`
- Modify: `card-projects/daoyou/web/app.js`
- Modify: `card-projects/daoyou/web/index.html`
- Modify: `card-projects/daoyou/web/style.css`

**Interfaces:**
- Consumes: Task 2 的四层素材、RuiC `run_pipeline.py` 生成的单卡场景与网页模板。
- Produces: `getGalleryLayout(viewportWidth)`、`createCardSlots(count, columns)`、一个 renderer 中的九个独立卡片根节点。

- [ ] **Step 1: 写布局和真实几何失败测试**

```js
import { createCardSlots, getGalleryLayout } from "../card-projects/daoyou/web/gallery-layout.mjs";

test("桌面九张卡严格排列为三列三行", () => {
  assert.equal(getGalleryLayout(1280).columns, 3);
  const slots = createCardSlots(9, 3);
  assert.equal(slots.length, 9);
  assert.deepEqual([...new Set(slots.map(({ row }) => row))], [0, 1, 2]);
});

test("中屏两列且 390px 为单列", () => {
  assert.equal(getGalleryLayout(800).columns, 2);
  assert.equal(getGalleryLayout(390).columns, 1);
});

test("导出模型保留 RuiC 网页材质合同", async () => {
  const model = await readFile("card-projects/daoyou/web/assets/card.glb");
  const text = model.toString("latin1");
  for (const material of ["web_front", "web_edge", "web_back", "web_gold"]) {
    assert.match(text, new RegExp(material));
  }
});
```

- [ ] **Step 2: 运行测试并确认生成产物缺失导致失败**

Run: `node --test tests/daoyou-card-gallery.test.mjs`  
Expected: FAIL，原因是 `gallery-layout.mjs` 和 `card.glb` 尚不存在。

- [ ] **Step 3: 运行 RuiC 基线流水线**

Run: `python C:/Users/28645/.codex/skills/RuiC-card-skill/scripts/run_pipeline.py --project card-projects/daoyou`  
Expected: 生成 `card.blend`、`web/assets/card.glb`、网页模板和浏览器纹理；若缺依赖，按错误只补齐明确缺失项，不重复盲试。再次运行测试时 GLB 材质合同通过，但布局模块仍按预期失败。

- [ ] **Step 4: 实现纯布局模块**

```js
export const CARD_COUNT = 9;

export function getGalleryLayout(viewportWidth) {
  const columns = viewportWidth >= 960 ? 3 : viewportWidth >= 600 ? 2 : 1;
  return { columns, gap: columns === 3 ? 0.72 : columns === 2 ? 0.62 : 0.5 };
}

export function createCardSlots(count, columns) {
  return Array.from({ length: count }, (_, index) => ({
    index,
    column: index % columns,
    row: Math.floor(index / columns),
  }));
}
```

- [ ] **Step 5: 将单卡查看器收敛为九卡共享场景**

在 `app.js` 导入布局模块。保留 RuiC 顶点/片元着色器、纹理加载、glTF 材质替换和 `uView` 计算；移除下载、参数面板、材质选择器及与本需求无关的控件。

模型加载后：

```js
const cardRoots = Array.from({ length: CARD_COUNT }, (_, index) => {
  const card = gltf.scene.clone(true);
  const root = new THREE.Group();
  root.userData = { index, targetX: 0, targetY: 0, flipped: false };
  root.add(card);
  scene.add(root);
  return root;
});
```

材质与纹理由九张卡共享；每个 `root` 独立保存旋转、翻面和悬停状态。射线检测命中的 mesh 沿父级查找 `userData.index`。拖动只更新命中卡，指针离开后平滑回正；越过 π/2 时显示卡背。`animate()` 每帧更新九个根节点并只调用一次 `renderer.render(scene, camera)`。

- [ ] **Step 6: 实现响应式 Three.js 排位**

`responsiveSettings()` 调用 `getGalleryLayout(innerWidth)` 和 `createCardSlots(9, columns)`，按卡片导出尺寸、gap、行列数计算世界坐标；同时调整正交相机和 canvas CSS 高度，让所有行完整进入文档流。桌面三列，中屏两列，手机单列。

- [ ] **Step 7: 运行核心测试**

Run: `node --test tests/daoyou-card-gallery.test.mjs`  
Expected: PASS，确认 3/2/1 列逻辑、九个位置和真实 GLB 材质名。

- [ ] **Step 8: 独立提交 Blender 与核心查看器**

```powershell
git add -- tests/daoyou-card-gallery.test.mjs card-projects/daoyou/card.blend card-projects/daoyou/web
git commit --only -m "页面：生成九宫格3D闪卡核心" -- tests/daoyou-card-gallery.test.mjs card-projects/daoyou/card.blend card-projects/daoyou/web
```

---

### Task 4: 可访问交互、静态降级与部署页面

**Files:**
- Modify: `tests/daoyou-card-gallery.test.mjs`
- Modify: `card-projects/daoyou/web/index.html`
- Modify: `card-projects/daoyou/web/style.css`
- Modify: `card-projects/daoyou/web/app.js`
- Create: `card-projects/daoyou/web/app.bundle.js`
- Create: `public/gallery/daoyou/index.html`
- Create: `public/gallery/daoyou/style.css`
- Create: `public/gallery/daoyou/app.bundle.js`
- Create: `public/gallery/daoyou/assets/*`

**Interfaces:**
- Consumes: Task 3 的 `CARD_COUNT`、九卡根节点、共享 renderer 与交互状态。
- Produces: 可键盘操作的九卡页面、WebGL 失败时的九图静态网格、Vite 可直接复制的 `/gallery/daoyou/` 页面。

- [ ] **Step 1: 写语义和降级失败测试**

读取 `index.html`、`style.css`、`app.js`，断言：

```js
assert.match(html, /href="\/"[^>]*>返回首页</);
assert.equal((html.match(/class="card-control"/g) ?? []).length, 9);
assert.match(html, /aria-live="polite"/);
assert.match(html, /class="fallback-grid"/);
assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(source, /Enter|Space|ArrowLeft|ArrowRight/);
assert.match(source, /webglcontextlost/);
```

- [ ] **Step 2: 运行测试并确认语义元素缺失导致失败**

Run: `node --test tests/daoyou-card-gallery.test.mjs`  
Expected: FAIL，缺少九个 `.card-control` 或降级网格。

- [ ] **Step 3: 实现页面骨架与九个可访问控制器**

`index.html` 只保留：页面标题、返回首页链接、加载/错误状态、Three.js stage、九个透明定位的 `.card-control`、九张 `source.jpg` 组成的 `.fallback-grid`。控制器中文名称为“道友闪卡 1”至“道友闪卡 9”，使用 `aria-pressed` 表示翻面状态。

键盘 `Enter`/空格切换聚焦卡正反面；左右/上下键短暂改变目标旋转。焦点和命中状态同步到同一个卡片状态对象。触屏拖动期间捕获指针，释放后恢复页面纵向滚动能力。

- [ ] **Step 4: 实现加载错误和减少动态效果**

所有 GLB 与纹理加载成功才把 `window.__holo` 设置为：

```js
window.__holo = {
  ready: true,
  cardCount: 9,
  renderer,
  scene,
  camera,
};
```

加载超时、着色器失败、WebGL 创建失败或 `webglcontextlost` 时停止动画、隐藏 canvas、显示 `.fallback-grid` 和重试按钮。`prefers-reduced-motion: reduce` 时关闭空闲摆动和缓动插值，只保留即时翻面状态。

- [ ] **Step 5: 打包并复制可部署产物**

在生成 web 目录安装锁定的 Three.js 依赖并用可用的 Bun 或项目现有打包器将 `app.js` 与 `gallery-layout.mjs` 打成一个 `app.bundle.js`。把 `index.html`、`style.css`、bundle 和所需 assets 复制到 `public/gallery/daoyou/`；不复制 `node_modules`、Blender 工具或源提示词。

- [ ] **Step 6: 运行测试和 Vite 构建**

Run: `node --test tests/daoyou-card-gallery.test.mjs tests/wallpaper-gallery.test.mjs`  
Expected: PASS。  
Run: `npm run build`  
Expected: exit 0，`dist/gallery/daoyou/index.html` 和相关资产存在。

- [ ] **Step 7: 独立提交部署页面**

```powershell
git add -- tests/daoyou-card-gallery.test.mjs card-projects/daoyou/web public/gallery/daoyou
git commit --only -m "页面：完善道友闪卡交互与降级" -- tests/daoyou-card-gallery.test.mjs card-projects/daoyou/web public/gallery/daoyou
```

---

### Task 5: 浏览器验收与最终回归

**Files:**
- Modify only if a reproduced failure needs a focused fix: files already listed in Tasks 1–4

**Interfaces:**
- Consumes: 可运行的 Vite 首页和 `/gallery/daoyou/` 静态页面。
- Produces: 桌面、390px、交互、控制台、构建和工作区完整性证据。

- [ ] **Step 1: 启动项目并记录地址**

Run: `npm run dev -- --host 127.0.0.1`  
Expected: Vite 返回本地 URL；保持进程运行直到浏览器验收结束。

- [ ] **Step 2: 验收桌面首页入口**

在桌面视口确认三张绿色卡片间距明显增大、卡片仍等宽、GSAP 倾斜仍工作；用鼠标和键盘点击“道友”，确认当前标签进入 `/gallery/daoyou/`。

- [ ] **Step 3: 验收桌面九卡和着色器**

确认九张卡可见且 3×3；检查 `window.__holo.ready === true`、`cardCount === 9`、一个 canvas 和一个 WebGL 上下文。依次实测悬停景深、左右视角流光、拖动、正反双向翻转、回正及键盘翻面；检查人物无明显双影、线稿与人物配准。

- [ ] **Step 4: 验收 390×844**

确认实际视口为 390×844；九张卡单列，触屏拖动卡片可用，页面纵向滚动未被永久锁定，`document.documentElement.scrollWidth === 390`，无横向溢出。

- [ ] **Step 5: 验收降级与减少动态效果**

模拟 WebGL 不可用或阻断 `card.glb`，确认九张静态原图卡、中文错误、重试和返回首页仍可见。模拟 `prefers-reduced-motion: reduce`，确认无持续漂移动画。

- [ ] **Step 6: 运行完整验证**

Run: `node --test tests/*.test.mjs`  
Expected: 记录总数和失败数，区分既有失败。  
Run: `python C:/Users/28645/.codex/skills/RuiC-card-skill/scripts/validate_assets.py card-projects/daoyou`  
Expected: exit 0。  
Run: `npm run build`  
Expected: exit 0。  
Run: `git diff --check`  
Expected: 无 whitespace error。

- [ ] **Step 7: 对照设计逐项确认并提交必要修复**

重新阅读 spec 的目标、非目标、交互、响应式、失败处理和完成判定。只有上述证据齐全才报告完成；任何浏览器问题先写可复现测试，再做最小修复和回归。修复提交使用中文信息并通过 `git commit --only` 限定本任务文件。
