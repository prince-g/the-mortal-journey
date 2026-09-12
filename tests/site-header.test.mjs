import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let SiteHeader;

before(async () => {
  server = await createServer({
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });
  ({ SiteHeader } = await server.ssrLoadModule(
    "/src/components/landing/SiteHeader.tsx",
  ));
});

after(async () => {
  await server?.close();
});

test("首页导航完整呈现品牌、五个锚点和用户入口", () => {
  const html = renderToStaticMarkup(SiteHeader());

  assert.match(html, /aria-label="主导航"/);
  assert.match(html, /alt="凡人修仙传"/);
  assert.match(html, /href="#home"[^>]*>首页</);
  assert.match(html, /href="#mortal-way"[^>]*>凡人之道</);
  assert.match(html, /href="#wallpapers"[^>]*>壁纸合集</);
  assert.match(html, /href="#effects"[^>]*>特效动图</);
  assert.match(html, /href="#about"[^>]*>关于社民党</);
  assert.match(html, /aria-label="前往社民党介绍"/);
});
