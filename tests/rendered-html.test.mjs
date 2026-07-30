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
  assert.match(html, /<title>Kevin Shell｜杨泽存 · Agent 产品经理<\/title>/);
  assert.match(html, /KEVIN SHELL/);
  assert.match(html, /INTERACTIVE RESUME OS/);
  assert.match(html, /跳过启动/);
  assert.match(html, /Radar Agent/);
  assert.match(html, /18253140199@163\.com/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("keeps interaction, accessibility, and sharing assets wired", async () => {
  const [stage, keyboard, keyboardConfig, typing, engine, shell, css, layout] =
    await Promise.all([
    readFile(
      new URL("../components/portfolio/PortfolioStage.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/keyboard/KeyboardScene.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/keyboard/keyboard-config.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../hooks/use-keyboard-typing-sequence.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../hooks/use-command-engine.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/portfolio/ShellContent.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(stage, /window\.addEventListener\("keydown"/);
  assert.match(stage, /onCompositionStart/);
  assert.match(stage, /experience --open meituan/);
  assert.match(stage, /project radar-eval/);
  assert.match(stage, /"eval"/);
  assert.match(stage, /StaticKeyboard/);
  assert.match(stage, /window\.print\(\)/);
  assert.match(keyboard, /addEventListener\("mouseHover"/);
  assert.match(keyboard, /event\.target\.id/);
  assert.match(keyboard, /getSplineEvents\(\)\.mouseHover/);
  assert.match(keyboard, /objectByIdRef/);
  assert.match(keyboard, /pointerKeyObjectsRef/);
  assert.match(keyboard, /disableSplineHoverTransitions/);
  assert.match(keyboard, /event\.actions\.Transition\.length = 0/);
  assert.match(keyboard, /addEventListener\("pointerdown"/);
  assert.doesNotMatch(keyboard, /addEventListener\("keyDown"/);
  assert.match(keyboard, /assets\/skills-keyboard\.splinecode/);
  assert.match(keyboard, /visibilitychange/);
  assert.match(keyboard, /setPixelRatio/);
  assert.match(keyboard, /LEGACY_KEY_OBJECTS/);
  assert.match(keyboardConfig, /cmd-whoami/);
  assert.match(keyboardConfig, /cmd-resume/);
  assert.match(keyboardConfig, /"cmd-whoami": \["js"\]/);
  assert.match(typing, /AbortController/);
  assert.match(typing, /onInput\(text\.slice/);
  assert.match(engine, /AbortController/);
  assert.match(engine, /command not found/);
  assert.match(css, /height:\s*100dvh/);
  assert.match(css, /overflow:\s*hidden/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /height:\s*clamp\(310px,\s*44dvh,\s*440px\)/);
  assert.match(css, /\.keyboard-zone\s*{[\s\S]*?top:\s*43dvh/);
  assert.match(shell, /home-command-list/);
  assert.doesNotMatch(shell, /home-command-grid/);
  assert.match(shell, /aria-expanded/);
  assert.match(shell, /loop-row-forward/);
  assert.match(shell, /loop-row-return/);
  assert.match(layout, /openGraph:/);
  assert.match(layout, /\/og\.png/);

  await Promise.all([
    access(
      new URL("../public/assets/skills-keyboard.splinecode", import.meta.url),
    ),
    access(new URL("../public/assets/avatar/avatar-pixel.png", import.meta.url)),
    access(new URL("../public/assets/keycap-sounds/press.mp3", import.meta.url)),
    access(new URL("../public/assets/keycap-sounds/release.mp3", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
