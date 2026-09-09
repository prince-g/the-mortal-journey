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

test("首页以九张图片组成的双轨影像流收尾", () => {
  const html = renderToStaticMarkup(createElement(HomePage));
  const sectionIds = [...html.matchAll(/<section[^>]+id="([^"]+)"/g)].map(
    ([, id]) => id,
  );
  const imageStream = html.match(
    /<section[^>]+id="effects"[\s\S]*?<\/section>/,
  )?.[0];

  assert.equal(sectionIds.at(-1), "effects");
  assert.ok(imageStream);
  assert.equal((imageStream.match(/data-stream-rail=/g) ?? []).length, 2);
  assert.equal((imageStream.match(/data-stream-card=/g) ?? []).length, 18);
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
