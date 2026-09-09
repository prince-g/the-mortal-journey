import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let HomePage;
let claimStartupForSession;
let getStartupProgress;

before(async () => {
  server = await createServer({
    appType: "custom",
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });
  ({ HomePage } = await server.ssrLoadModule("/src/pages/home/HomePage.tsx"));
  ({ claimStartupForSession, getStartupProgress } = await server.ssrLoadModule(
    "/src/components/landing/StartupLoader.tsx",
  ));
});

after(async () => {
  await server?.close();
});

test("首页首次进入时渲染掌天瓶启动页和可访问进度", () => {
  const html = renderToStaticMarkup(createElement(HomePage));

  assert.match(html, /role="status"/);
  assert.match(html, /alt="掌天瓶"/);
  assert.match(html, /The Immortal Ascension/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="0"/);
});

test("同一浏览器会话首次进入显示，普通刷新跳过", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  assert.equal(typeof claimStartupForSession, "function");
  assert.equal(claimStartupForSession(storage), true);
  assert.equal(claimStartupForSession(storage), false);
  assert.equal(values.size, 1);
});

test("启动进度随时间单调增加并最终到达 100", () => {
  assert.equal(typeof getStartupProgress, "function");

  const samples = [0, 400, 900, 1600, 2300].map(getStartupProgress);
  assert.equal(samples[0], 0);
  assert.equal(samples.at(-1), 100);
  assert.ok(samples.every((value) => value >= 0 && value <= 100));
  assert.ok(samples.every((value, index) => index === 0 || value >= samples[index - 1]));
});
