# Kevin Shell

杨泽存的单屏 3D 交互简历。它不是一份需要从上到下阅读的长页面，而是一套可以运行的 Resume OS：点击 3D 键帽、按下 F1-F8，或直接输入命令，查看经历、项目、能力证据、Agent Eval 与 AI Native Loop。

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
