import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let HomePage;

before(async () => {
  server = await createServer({
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { hmr: false, middlewareMode: true, ws: false },
  });
  ({ HomePage } = await server.ssrLoadModule("/src/pages/home/HomePage.tsx"));
});

after(async () => {
  await server?.close();
});

test("双轨影像流之后由关于页脚完成首页收束", () => {
  const html = renderToStaticMarkup(createElement(HomePage));
  const imageStream = html.match(
    /<section[^>]+id="effects"[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(imageStream);
  assert.equal((imageStream.match(/data-stream-rail=/g) ?? []).length, 2);
  assert.equal((imageStream.match(/data-stream-card=/g) ?? []).length, 18);
  assert.match(html, /<footer[^>]+id="about"[^>]+aria-label="网站页脚"/);
  assert.equal((html.match(/id="about"/g) ?? []).length, 1);
  assert.ok(html.indexOf('id="effects"') < html.indexOf('<footer id="about"'));
  assert.match(html, /<nav[^>]+aria-label="页脚导航"/);
  assert.match(html, /关于凡人/);
  assert.match(html, /alt="呐喊风格人物油画"/);
});

test("移除红区视频后，后续影像流承接特效锚点", () => {
  const html = renderToStaticMarkup(createElement(HomePage));
  const redSection = html.match(
    /<section[^>]+id="mortal-way"[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(redSection);
  assert.doesNotMatch(redSection, /<video\b/);
  assert.match(html, /<section[^>]+id="mortal-way"[\s\S]*?<\/section><section[^>]+id="effects"/);
});
