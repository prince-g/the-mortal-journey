import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("桌面九张卡严格排列为三列三行", async () => {
  const { createCardSlots, getGalleryLayout } = await import(
    "../card-projects/daoyou/web/gallery-layout.mjs"
  );
  const layout = getGalleryLayout(1280);
  const slots = createCardSlots(9, layout.columns);

  assert.equal(layout.columns, 3);
  assert.equal(slots.length, 9);
  assert.deepEqual([...new Set(slots.map(({ row }) => row))], [0, 1, 2]);
});

test("中屏两列且 390px 为单列", async () => {
  const { getGalleryLayout } = await import(
    "../card-projects/daoyou/web/gallery-layout.mjs"
  );

  assert.equal(getGalleryLayout(800).columns, 2);
  assert.equal(getGalleryLayout(390).columns, 1);
});

test("导出模型保留 RuiC 网页材质合同", async () => {
  const model = await readFile(
    "card-projects/daoyou/web/assets/card.glb",
  );
  const modelText = model.toString("latin1");

  for (const material of [
    "web_front",
    "web_edge",
    "web_back",
    "web_gold",
  ]) {
    assert.match(modelText, new RegExp(material));
  }
});

test("九张闪卡提供返回、键盘与静态降级语义", async () => {
  const [html, styles, source] = await Promise.all([
    readFile("card-projects/daoyou/web/index.html", "utf8"),
    readFile("card-projects/daoyou/web/style.css", "utf8"),
    readFile("card-projects/daoyou/web/app.js", "utf8"),
  ]);

  assert.match(html, /href="\/"[^>]*>\s*返回首页\s*</);
  assert.equal((html.match(/class="card-control"/g) ?? []).length, 9);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /class="fallback-grid"/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(source, /Enter/);
  assert.match(source, /Space/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /webglcontextlost/);
});

test("九张卡共享一个渲染器并公开可验证状态", async () => {
  const source = await readFile(
    "card-projects/daoyou/web/app.js",
    "utf8",
  );

  assert.equal(
    (source.match(/new THREE\.WebGLRenderer\(/g) ?? []).length,
    1,
  );
  assert.match(source, /CARD_COUNT/);
  assert.match(source, /cardCount:\s*CARD_COUNT/);
  assert.match(source, /renderer\.render\(scene, camera\)/);
  assert.match(source, /runtimeComposition\.subjectScale \?\? 1/);
  assert.match(source, /runtimeComposition\.safeScale \?\? 1/);
});
