import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("exports a complete GitHub Pages site", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /<title>Kevin Shell｜杨泽存 · Agent 产品经理<\/title>/);
  assert.match(html, /KEVIN SHELL/);
  assert.match(html, /Version 2\.1\.0/);
  assert.match(html, /Radar Agent/);
  assert.match(
    html,
    /https:\/\/18253140199\.github\.io\/kevin-resume\/og\.png/,
  );
  assert.doesNotMatch(html, /kevin-resume\/kevin-resume/);

  await Promise.all([
    access(
      new URL("../out/assets/skills-keyboard.splinecode", import.meta.url),
    ),
    access(new URL("../out/assets/avatar/avatar-pixel.png", import.meta.url)),
    access(new URL("../out/og.png", import.meta.url)),
  ]);
});
