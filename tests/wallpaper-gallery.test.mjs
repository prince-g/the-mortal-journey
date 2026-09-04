import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let WallpaperGallerySection;
let clampGalleryIndex;

before(async () => {
  server = await createServer({
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });
  ({ WallpaperGallerySection, clampGalleryIndex } =
    await server.ssrLoadModule(
      "/src/components/landing/sections/WallpaperGallerySection.tsx",
    ));
});

after(async () => {
  await server?.close();
});

test("壁纸合集渲染三张 GSAP 字标卡片", () => {
  const html = renderToStaticMarkup(createElement(WallpaperGallerySection));

  assert.match(html, /<section[^>]+id="wallpapers"/);
  assert.match(html, /aria-label="壁纸合集"/);
  assert.equal((html.match(/class="wallpaper-card"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-label="GSAP"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /wallpaper-gallery__mist/);
});

test("凡人修仙标题下方渲染九项图片滚轮和首张选中图片", () => {
  const html = renderToStaticMarkup(createElement(WallpaperGallerySection));
  const expectedLabels = [
    "仙影画壁",
    "刹那仙踪",
    "惊鸿名场面",
    "光影忆仙途",
    "术法流光",
    "剑阵光影",
    "众生群像",
    "仙门人物志",
    "山海仙途",
  ];

  assert.match(html, /class="immortal-gallery__title"/);
  assert.match(html, /alt="凡人修仙"/);
  assert.match(html, /role="listbox"/);
  assert.equal((html.match(/role="option"/g) ?? []).length, 9);
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
  expectedLabels.forEach((label) => assert.match(html, new RegExp(label)));
  assert.doesNotMatch(html, /宗门秘境录|道友留步|仙友佳作/);
  assert.match(html, /class="immortal-gallery__image"/);
});

test("图片滚轮在首尾边界停止而不是循环", () => {
  assert.equal(clampGalleryIndex(-1, 9), 0);
  assert.equal(clampGalleryIndex(0, 9), 0);
  assert.equal(clampGalleryIndex(8, 9), 8);
  assert.equal(clampGalleryIndex(9, 9), 8);
});

test("人物卡片使用两段不同的本地视频且不渲染文字信息层", () => {
  const html = renderToStaticMarkup(createElement(WallpaperGallerySection));
  const videoSources = [...html.matchAll(/<video[^>]+src="([^"]+)"/g)].map(
    ([, source]) => source,
  );

  assert.equal(videoSources.length, 2);
  assert.equal(new Set(videoSources).size, 2);
  assert.equal((html.match(/autoPlay=""/g) ?? []).length, 2);
  assert.equal((html.match(/loop=""/g) ?? []).length, 2);
  assert.doesNotMatch(html, /pc-details|pc-user-info|pc-contact-btn/);
});

test("人物卡片将彩虹纹理限制在代码符号中并与上方卡片组等宽", async () => {
  const html = renderToStaticMarkup(createElement(WallpaperGallerySection));
  const [cardStyles, galleryStyles] = await Promise.all([
    readFile("src/components/landing/VideoProfileCard.css", "utf8"),
    readFile(
      "src/components/landing/sections/WallpaperGallerySection.css",
      "utf8",
    ),
  ]);

  assert.equal(
    (html.match(/class="video-profile-card__code-mark"/g) ?? []).length,
    14,
  );
  assert.match(cardStyles, /\.video-profile-card__code-mark::before\s*\{/);
  assert.equal(
    (galleryStyles.match(/width:\s*var\(--gallery-content-width\)/g) ?? [])
      .length,
    3,
  );
  assert.match(cardStyles, /content:\s*"<\/>"/);
  assert.match(
    galleryStyles,
    /--gallery-content-width:\s*min\(100%,\s*100rem\)/,
  );
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
