# Kevin Shell

杨泽存的单屏 3D 交互简历。它不是一份需要从上到下阅读的长页面，而是一套可以运行的 Resume OS：点击 3D 键帽、按下 F1-F8，或直接输入命令，查看经历、项目、能力证据、Agent Eval 与 AI Native Loop。

在线预览：<https://18253140199.github.io/kevin-resume/>

## 项目亮点

- **Shell 式简历交互**：`whoami`、`projects`、`eval`、`loop` 等命令把个人经历、项目证据和联系方式组织成可探索界面。
- **3D + DOM 双路径**：桌面端使用 Spline 3D 键盘，移动端、Reduced Motion 和 Data Saver 环境自动切换为 HTML 宏键盘，核心内容始终保留在 DOM 中。
- **可访问与可部署**：支持键盘操作、静态导出、打印简历和 GitHub Pages 自动发布。
- **可验证工程**：构建、静态导出、渲染 HTML 检查和 ESLint 都有明确脚本，便于复现。

## 技术栈

- Next.js + React + TypeScript
- Spline Runtime
- GSAP + Motion
- Web Audio API
- GitHub Pages

## 命令

```text
whoami     experience   projects   skills
eval       loop         contact    resume
help       demo         home       clear
```

桌面端使用 Spline 3D 键盘；移动端、Reduced Motion 和 Data Saver 环境自动切换为 HTML 宏键盘。所有核心内容均保留 DOM 版本，支持键盘操作、静态导出和完整简历打印。

## Spline 对象名

2.1 代码使用 `cmd-whoami`、`cmd-experience`、`cmd-projects`、`cmd-skills`、`cmd-eval`、`cmd-loop`、`cmd-contact`、`cmd-resume` 作为标准对象名。当前 Spline 二进制保持不变，运行时会自动兼容原来的 `js`、`react`、`nextjs`、`ts`、`docker`、`git`、`github`、`vercel`。

下次在 Spline 编辑器中维护场景时，可按上述顺序重命名键帽对象；发布前逐个检查 Key Down、Key Up 和 Hover 事件，不需要修改网页代码。

## 本地运行

```bash
npm install
npm run dev
```

## 验证

```bash
npm test
npm run test:pages
npm run lint
```

`main` 分支更新后，GitHub Actions 会自动构建并发布 GitHub Pages。
