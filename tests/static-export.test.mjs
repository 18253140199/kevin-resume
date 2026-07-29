import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("exports a complete GitHub Pages site", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<title>请点燃我｜杨泽存 · Agent 产品经理<\/title>/);
  assert.match(html, /点燃一根火柴/);
  assert.match(html, /character-intro3d\.png/);
  assert.match(html, /Radar Agent 评测体系/);

  await Promise.all([
    access(new URL("../out/character-intro3d.png", import.meta.url)),
    access(new URL("../out/og.png", import.meta.url)),
  ]);
});
