import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished interactive resume", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>请点燃我｜杨泽存 · Agent 产品经理<\/title>/);
  assert.match(html, /点燃一根火柴/);
  assert.match(html, /Agent PM/);
  assert.match(html, /跳过动画/);
  assert.match(html, /character-intro3d\.png/);
  assert.match(html, /Radar Agent 评测体系/);
  assert.match(html, /18253140199@163\.com/);
  assert.equal((html.match(/尚未点亮/g) ?? []).length, 12);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("keeps interaction, accessibility, and sharing assets wired", async () => {
  const [intro, portfolio, css, layout] = await Promise.all([
    readFile(new URL("../components/IntroScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/Portfolio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(intro, /window\.addEventListener\("pointermove"/);
  assert.match(intro, /event\.pointerType === "touch"/);
  assert.match(intro, /aria-label="沿磷面划动火柴/);
  assert.match(intro, /setUnlocked/);
  assert.match(intro, /character-intro3d\.png/);
  assert.match(portfolio, /window\.print\(\)/);
  assert.match(portfolio, /mailto:18253140199@163\.com/);
  assert.match(css, /mask-image:\s*radial-gradient/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /\/og\.png/);

  await Promise.all([
    access(new URL("../public/character-intro3d.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
