import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const assetRoot = "card-projects/daoyou/assets";

async function readPngHeader(name) {
  const bytes = await readFile(`${assetRoot}/${name}.png`);
  const signature = bytes.subarray(0, 8).toString("hex");

  assert.equal(signature, "89504e470d0a1a0a", `${name} 必须是 PNG`);

  const colorType = bytes.readUInt8(25);
  return {
    name,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    hasAlpha: colorType === 4 || colorType === 6,
  };
}

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
  assert.deepEqual(config.runtimeComposition, {
    subjectScale: 1,
    safeScale: 1,
  });

  for (const path of [
    "card-projects/daoyou/web/card-config.json",
    "public/gallery/daoyou/card-config.json",
  ]) {
    const runtimeConfig = JSON.parse(await readFile(path, "utf8"));
    assert.deepEqual(runtimeConfig.runtimeComposition, {
      subjectScale: 1,
      safeScale: 1,
    });
  }
});

test("道友展示字体随页面部署并用于标题与卡背", async () => {
  const [font, styles, source, server] = await Promise.all([
    readFile("card-projects/daoyou/web/assets/daoyou-display.ttf"),
    readFile("card-projects/daoyou/web/style.css", "utf8"),
    readFile("card-projects/daoyou/web/app.js", "utf8"),
    readFile("card-projects/daoyou/web/server.mjs", "utf8"),
  ]);

  assert.ok(font.length > 0);
  assert.match(styles, /@font-face[\s\S]*font-family:\s*"DaoyouDisplay"/);
  assert.match(styles, /\.title-group h1[\s\S]*font-family:\s*"DaoyouDisplay"/);
  assert.match(source, /document\.fonts\.load\([\s\S]*DaoyouDisplay/);
  assert.match(source, /context\.font = "400 300px DaoyouDisplay/);
  assert.match(server, /'\.ttf':'font\/ttf'/);
});

test("四层 PNG 使用同一画布且人物层含 alpha", async () => {
  const layers = await Promise.all(
    ["background", "subject", "lineart", "text"].map(readPngHeader),
  );

  assert.equal(
    new Set(layers.map(({ width, height }) => `${width}x${height}`)).size,
    1,
  );
  assert.equal(
    layers.find(({ name }) => name === "subject")?.hasAlpha,
    true,
  );
});

test("九宫格使用九套独立且已同步的分层素材", async () => {
  const sourceRoot = "card-projects/daoyou/web";
  const publicRoot = "public/gallery/daoyou";
  const config = JSON.parse(
    await readFile(`${sourceRoot}/card-config.json`, "utf8"),
  );

  assert.equal(config.cards.length, 9);

  const hashes = { subject: new Set(), background: new Set(), lineart: new Set() };
  for (let index = 0; index < 9; index += 1) {
    const cardNumber = index + 1;
    const expectedAssets = {
      subject: `./assets/card${cardNumber}/subject.png`,
      background: `./assets/card${cardNumber}/background.png`,
      text: `./assets/card${cardNumber}/text.png`,
      lineart: `./assets/card${cardNumber}/lineart.png`,
    };
    assert.deepEqual(config.cards[index].assets, expectedAssets);

    for (const layer of Object.keys(expectedAssets)) {
      const relative = `assets/card${cardNumber}/${layer}.png`;
      const [sourceBytes, publicBytes] = await Promise.all([
        readFile(`${sourceRoot}/${relative}`),
        readFile(`${publicRoot}/${relative}`),
      ]);
      assert.deepEqual(publicBytes, sourceBytes, `${relative} 发布副本未同步`);
      assert.equal(sourceBytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(sourceBytes.readUInt32BE(16), 941);
      assert.equal(sourceBytes.readUInt32BE(20), 1672);
      if (layer in hashes) {
        hashes[layer].add(createHash("sha256").update(sourceBytes).digest("hex"));
      }
    }
  }

  assert.equal(hashes.subject.size, 9, "九张卡的人物层必须互不相同");
  assert.equal(hashes.background.size, 9, "九张卡的背景层必须互不相同");
  assert.equal(hashes.lineart.size, 9, "九张卡的线稿层必须互不相同");
});
