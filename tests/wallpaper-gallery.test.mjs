import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let WallpaperGallerySection;

before(async () => {
  server = await createServer({
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });
  ({ WallpaperGallerySection } = await server.ssrLoadModule(
    "/src/components/landing/sections/WallpaperGallerySection.tsx",
  ));
});

after(async () => {
  await server?.close();
});

test("壁纸合集渲染三张 GSAP 字标卡片且不再使用图片", () => {
  const html = renderToStaticMarkup(createElement(WallpaperGallerySection));

  assert.match(html, /<section[^>]+id="wallpapers"/);
  assert.match(html, /aria-label="壁纸合集"/);
  assert.equal((html.match(/class="wallpaper-card"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-label="GSAP"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<img/);
  assert.doesNotMatch(html, /wallpaper-gallery__mist/);
});

test("首页滚动条使用墨青主题而不是系统白色轨道", async () => {
  const [homePage, globalStyles] = await Promise.all([
    readFile("src/pages/home/HomePage.tsx", "utf8"),
    readFile("src/styles/globals.css", "utf8"),
  ]);

  assert.match(homePage, /className="[^"]*home-scroll/);
  assert.match(globalStyles, /\.home-scroll\s*\{[^}]*scrollbar-color:/s);
  assert.match(globalStyles, /\.home-scroll::\-webkit-scrollbar-track/);
});
