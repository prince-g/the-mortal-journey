# Art Landing 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `E:/project/front/the-mortal-journey` 新建一个两屏滚动落地页（视频 Hero + 红色第二屏 + 云层视差），技术栈为 React 19 + TypeScript + Vite + Tailwind v4 + motion/react + react-router。

**Architecture:** 单页静态站，无后端。`HomePage` 持有 `<main>` 滚动容器 `containerRef`，渲染两个 section；`RedSection` 用同一个 container 做云层视差。共享 SVG logo 抽成 `LogoMark` 组件。CSS 采用 no-preflight 方案（Tailwind v4 theme/utilities 层 + 手写 base reset）。

**Tech Stack:** React 19、TypeScript ~5.8、Vite ^6、Tailwind CSS v4（`@tailwindcss/vite`）、`motion` ^12（`motion/react`）、`react-router-dom` v7、`lucide-react`。

## Global Constraints

- 依赖版本（严格按 art-landing.md）：`react` ^19、`react-dom` ^19、`motion` ^12、`tailwindcss` ^4.1、`@tailwindcss/vite` ^4.1、`vite` ^6、`@vitejs/plugin-react` ^5、`lucide-react`、`typescript` ~5.8。
- 动画从 `motion/react` 导入（不是 `framer-motion`）。
- 字体：Manrope、Italiana、Marck Script（通过 Google Fonts 加载）。
- 背景色：第一屏黑色 `bg-black`，第二屏红色 `bg-[#FF0000]`。
- 全部外部 URL 只有 spec 里给出的几个（视频 R2 地址 + 云层 Cloudinary 地址），无 CloudFront。
- 云层视差：scroll 0→300px 映射 translateY 0→-100px（桌面）/ 0→-24px（移动）。
- git commit message 一律用中文。
- 本阶段无单元测试（无纯函数逻辑），验证方式为 `npm run build` 通过 + `npm run dev` 手动核对。

---

### Task 1: 脚手架与最小可构建工程

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `.gitignore`
- Create: `src/vite-env.d.ts`, `src/main.tsx`, `src/App.tsx`, `src/router.tsx`, `src/pages/home/HomePage.tsx`（占位版）

**Interfaces:**
- Consumes: 无（首个任务）
- Produces: `App`（默认导出，渲染 `RouterProvider`）、`router`（`createBrowserRouter` 实例）、`HomePage`（`src/pages/home/HomePage.tsx` 具名导出，后续任务替换其内部实现）

- [ ] **Step 1: 写 `package.json`**

```json
{
  "name": "the-mortal-journey",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.525.0",
    "motion": "^12.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "~5.8.3",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: 写 `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 3: 写三个 `tsconfig` 文件**

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: 写 `index.html`（含字体预连接与字体链接）**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Mortal Journey</title>
    <meta name="description" content="Intelligent daily routine automation for your business." />
    <link rel="icon" href="data:," />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Italiana&family=Manrope:wght@400;600&family=Marck+Script&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 写 `.gitignore`**

```gitignore
node_modules
dist
*.local
.DS_Store
.idea
```

- [ ] **Step 6: 写 `src/vite-env.d.ts`、`src/main.tsx`、`src/App.tsx`、`src/router.tsx`、占位 `src/pages/home/HomePage.tsx`**

`src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx`:

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return <RouterProvider router={router} />;
}
```

`src/router.tsx`:

```tsx
import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);
```

`src/pages/home/HomePage.tsx`（占位，Task 4/5 替换）:

```tsx
export function HomePage() {
  return <div>Home</div>;
}
```

- [ ] **Step 7: 安装依赖**

Run: `cd /e/project/front/the-mortal-journey && npm install`
Expected: 无 ERESOLVE 错误。若 `@vitejs/plugin-react@5` 或 `@tailwindcss/vite` 报 peer 冲突，将对应版本回退一档再装。

- [ ] **Step 8: 构建验证**

Run: `npm run build`
Expected: `tsc -b` 与 `vite build` 均通过，`dist/` 生成。若提示缺少 `src/styles/*.css`（main.tsx 引用了但 Task 2 才创建），先创建两个空 CSS 文件再构建。

- [ ] **Step 9: 初始化 git 并首次提交**

```bash
cd /e/project/front/the-mortal-journey
git init
git add .
git commit -m "脚手架：初始化 Vite + React + TS + Tailwind 工程"
```

---

### Task 2: 全局样式（Tailwind theme + no-preflight reset）

**Files:**
- Create: `src/styles/tailwind.css`, `src/styles/globals.css`

**Interfaces:**
- Consumes: Task 1 的 `main.tsx` 已 import 这两个文件
- Produces: `--font-manrope` / `--font-italiana` / `--font-marck` theme 变量（供 `font-manrope` 等工具类使用）；`.site-shell` 类

- [ ] **Step 1: 写 `src/styles/tailwind.css`**

```css
@layer theme, base, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@theme {
  --font-manrope: "Manrope", sans-serif;
  --font-italiana: "Italiana", serif;
  --font-marck: "Marck Script", cursive;
}
```

- [ ] **Step 2: 写 `src/styles/globals.css`**

```css
@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border-width: 0;
    border-style: solid;
    border-color: currentColor;
  }

  html {
    min-height: 100%;
    scroll-behavior: smooth;
    background: #000000;
  }

  body {
    min-height: 100%;
    overflow-x: clip;
    background: #000000;
  }

  #root {
    background: #000000;
  }

  img,
  svg,
  video,
  canvas,
  picture {
    display: block;
    max-width: 100%;
  }

  a {
    color: inherit;
    text-decoration: inherit;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
    color: inherit;
    background: none;
    cursor: pointer;
  }
}

:root {
  font-family: "Manrope", sans-serif;
  letter-spacing: 0;
}

.site-shell {
  min-height: 100vh;
  background: #000000;
  overflow-x: clip;
}
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 通过，`@theme` 与 `@layer` 语法无报错。

- [ ] **Step 4: 提交**

```bash
git add src/styles/
git commit -m "样式：Tailwind v4 主题字体与 no-preflight 基础重置"
```

---

### Task 3: 共享 Logo 组件

**Files:**
- Create: `src/components/landing/LogoMark.tsx`

**Interfaces:**
- Consumes: 无
- Produces: `LogoMark`（具名导出，props: `{ size?: number; className?: string }`）

- [ ] **Step 1: 写 `src/components/landing/LogoMark.tsx`**

```tsx
interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 48, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M60 120C26.8629 120 0 93.1371 0 60V0C22.5654 0 42.2213 12.4569 52.4662 30.8691C38.4788 34.2089 28.0787 46.7902 28.0787 61.8006V63.1443C28.0787 79.9648 41.7146 93.6006 58.5353 93.6006H59.8789L59.8785 61.8006C59.8785 79.3633 74.1159 93.6006 91.6787 93.6006L91.6787 61.8006C91.6787 44.2783 77.5071 30.0661 60 30.0008L60 0H62.5352C94.2722 0 120 25.7279 120 57.4648V60C120 93.1371 93.1371 120 60 120Z" />
    </svg>
  );
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 通过（组件暂时未被引用，仅确认类型无误）。

- [ ] **Step 3: 提交**

```bash
git add src/components/landing/LogoMark.tsx
git commit -m "组件：新增共享 SVG Logo 组件"
```

---

### Task 4: 视频 Hero 区 + 组装 HomePage

**Files:**
- Create: `src/components/landing/sections/VideoHeroSection.tsx`
- Modify: `src/pages/home/HomePage.tsx`（占位 → 渲染 VideoHeroSection，并预留 RedSection）

**Interfaces:**
- Consumes: `LogoMark`（`{ size?, className? }`）
- Produces: `VideoHeroSection`（无 props，具名导出）

- [ ] **Step 1: 写 `src/components/landing/sections/VideoHeroSection.tsx`**

```tsx
import { LogoMark } from "../LogoMark";

export function VideoHeroSection() {
  return (
    <section className="relative h-screen w-full flex-shrink-0 overflow-hidden">
      {/* 背景视频 */}
      <video
        className="absolute inset-0 z-10 h-full w-full object-cover"
        src="https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/baby-track-video_crqby5.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* 遮罩 */}
      <div className="pointer-events-none absolute inset-0 z-30" />

      {/* 左上 logo 块 */}
      <div className="pointer-events-auto absolute top-[24px] left-[20px] flex max-w-[calc(100vw-140px)] items-center gap-[16px] md:top-[64px] md:left-[64px] md:max-w-none md:gap-[24px]">
        <LogoMark size={48} className="h-[48px] w-[48px] text-white md:h-[64px] md:w-[64px]" />
        <p className="hidden text-[16px] leading-[1.2] font-semibold tracking-[0.02em] text-white md:block">
          Effortless Growth / Operations.
          <br />
          We Handle All Tasks.
          <br />
          Stay Calm.
        </p>
        <p className="block w-[112px] text-[11px] leading-[1.2] font-semibold tracking-[0.02em] text-white md:hidden">
          Complete Business / Automation. We Handle All / Tasks. You Relax.
        </p>
      </div>

      {/* 左上描述（仅桌面） */}
      <div className="mt-[400px] hidden w-full max-w-[320px] flex-col gap-[24px] text-[14px] leading-relaxed font-normal text-white md:flex">
        <p>
          Our automation platform handles your recurring operational tasks —
          scheduling, reporting, and follow-ups — so your team can focus on
          growth instead of busywork.
        </p>
        <p>
          Built for small teams and growing businesses, it runs quietly in the
          background and gives back the hours you used to lose to manual
          processes.
        </p>
      </div>

      {/* 右上 CTA 按钮 */}
      <button className="absolute top-[24px] right-[20px] cursor-pointer rounded-[100%] border border-white bg-black/10 px-5 py-3 text-[12px] font-italiana tracking-widest text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-[48px] md:top-[64px] md:right-[64px] md:bg-transparent md:px-10 md:py-7 md:text-[18px] md:backdrop-blur-none">
        Get started
      </button>

      {/* 底部标题容器 */}
      <div className="absolute bottom-[32px] left-[20px] right-[20px] text-left md:right-[64px] md:bottom-[64px] md:left-auto md:max-w-[1200px] md:text-right">
        <div className="mb-[32px] flex max-w-[280px] flex-col gap-[16px] text-[12px] font-normal text-white md:hidden">
          <p>Complete business automation. We handle all tasks. You relax.</p>
        </div>
        <h1 className="text-[36px] leading-[1.1] font-italiana text-white md:text-[96px] md:leading-[88px]">
          <span className="hidden md:block">
            Intelligent Daily / Routine Automation / For Your Business. / You Relax
          </span>
          <span className="block text-[32px] md:hidden">
            Intelligent Daily Routine / Automation For Your / Business. You Relax
          </span>
        </h1>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 更新 `src/pages/home/HomePage.tsx`**

```tsx
import { useRef } from "react";
import { VideoHeroSection } from "../../components/landing/sections/VideoHeroSection";

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden bg-black font-manrope"
    >
      <VideoHeroSection />
      {/* RedSection 在 Task 5 加入 */}
    </main>
  );
}
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 通过。`font-italiana`、`font-manrope` 等工具类由 Task 2 的 `@theme` 生成，无报错。

- [ ] **Step 4: 提交**

```bash
git add src/components/landing/sections/VideoHeroSection.tsx src/pages/home/HomePage.tsx
git commit -m "页面：实现视频 Hero 区并组装 HomePage"
```

---

### Task 5: 红色第二屏 + 云层视差

**Files:**
- Create: `src/components/landing/sections/RedSection.tsx`
- Modify: `src/pages/home/HomePage.tsx`（加入 RedSection 并传 containerRef）

**Interfaces:**
- Consumes: `LogoMark`（`{ size?, className? }`）；`HomePage` 的 `containerRef`（类型 `RefObject<HTMLDivElement>`）
- Produces: `RedSection`（具名导出，props: `{ containerRef: RefObject<HTMLDivElement> }`）

- [ ] **Step 1: 写 `src/components/landing/sections/RedSection.tsx`**

```tsx
import type { RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LogoMark } from "../LogoMark";

interface RedSectionProps {
  containerRef: RefObject<HTMLDivElement>;
}

export function RedSection({ containerRef }: RedSectionProps) {
  const { scrollY } = useScroll({ container: containerRef });
  const cloudYDesktop = useTransform(scrollY, [0, 300], [0, -100]);
  const cloudYMobile = useTransform(scrollY, [0, 300], [0, -24]);

  return (
    <section className="relative z-10 flex min-h-screen w-full flex-col bg-[#FF0000]">
      {/* 桌面云层 */}
      <motion.div
        style={{ y: cloudYDesktop }}
        className="pointer-events-none absolute top-0 left-0 z-[100] hidden w-full -translate-y-1/2 md:block"
      >
        <img
          src="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1781500777/cloude_vj4pjv.png"
          className="block h-auto w-full"
          referrerPolicy="no-referrer"
          alt=""
        />
      </motion.div>

      {/* 移动云层 */}
      <motion.div
        style={{ y: cloudYMobile }}
        className="pointer-events-none absolute top-0 left-0 z-[100] w-full -translate-y-1/2 md:hidden"
      >
        <img
          src="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1781500777/cloude_vj4pjv.png"
          className="block h-auto w-full"
          referrerPolicy="no-referrer"
          alt=""
        />
      </motion.div>

      {/* 内容区 */}
      <div className="flex w-full flex-1 flex-col items-center pt-[100px] md:pt-[400px]">
        <div className="relative z-20 mx-auto flex h-auto w-full max-w-[900px] flex-col items-center px-8 text-center md:h-[620px]">
          <LogoMark size={80} className="h-[80px] w-[80px] text-white" />
          <p className="mx-auto mb-[40px] h-[100px] max-w-[400px] text-[16px] leading-[1.6] tracking-wider text-white uppercase">
            We built this platform with a single purpose to eliminate operational
            chaos and restore balance to your daily business routine
          </p>
          <p className="mb-[32px] font-marck text-[120px] leading-none text-white">
            S.P.D
          </p>
          <div className="mb-[100px] md:mb-24">
            <p className="mb-[24px] w-[400px] max-w-full text-[16px] font-light text-white">
              Everything your business runs on — schedules, tasks, and follow-ups —
              comes together in one quiet, automatic flow.
            </p>
            <p className="w-[400px] max-w-full text-[16px] font-light text-white">
              No more chasing details by hand. Set it once, and let the routine
              carry itself while you stay calm.
            </p>
          </div>
        </div>
      </div>

      {/* 底部视频块 */}
      <div className="relative w-full shrink-0">
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-[100px] w-full bg-gradient-to-b from-[#FF0000] to-transparent" />
        <video
          className="block h-auto w-full object-contain"
          src="https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/track-video_2_haxdch.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 更新 `src/pages/home/HomePage.tsx`**

```tsx
import { useRef } from "react";
import { VideoHeroSection } from "../../components/landing/sections/VideoHeroSection";
import { RedSection } from "../../components/landing/sections/RedSection";

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden bg-black font-manrope"
    >
      <VideoHeroSection />
      <RedSection containerRef={containerRef} />
    </main>
  );
}
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 通过。`motion/react` 的 `useScroll`/`useTransform`/`motion.div` 类型均可用。

- [ ] **Step 4: 手动核对（可选但建议）**

Run: `npm run dev`
Expected: 打开本地地址，确认第一屏视频、红色第二屏、云层滚动视差、移动端断点均正常。

- [ ] **Step 5: 提交**

```bash
git add src/components/landing/sections/RedSection.tsx src/pages/home/HomePage.tsx
git commit -m "页面：实现红色第二屏与云层视差动画"
```

---

## Self-Review 结果

- **Spec 覆盖**：art-landing.md 的两段结构、字体、视频 URL、云层视差、logo SVG path、CTA 按钮、`S.P.D` 签名、底部视频、渐变遮罩均已对应到 Task 1–5；`lucide-react` 作为 spec 声明的依赖已列入（当前未使用，符合 spec 清单）。
- **占位符扫描**：无 TBD/TODO；两处 spec 未给文案的段落已在设计中明确为英文占位并在 Task 4/5 里写了具体文案。
- **类型一致性**：`LogoMark` 的 props、`RedSection` 的 `containerRef` 类型、`HomePage` 的组装在 Task 3/4/5 中一致。
