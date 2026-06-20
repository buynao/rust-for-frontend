import { useLang, type Lang } from './lang'

/**
 * 框架级 UI 文案(侧栏、首页、章节壳、教学组件标签…)。
 * 章节正文不在这里——正文在各章节组件里按语言分支渲染。
 */
export interface UIStrings {
  // Layout / 侧栏 / 顶栏
  menu: string
  brandTagline: string // 顶栏品牌副标题(目前用 "for")
  navHome: string
  playground: string
  github: string
  twitter: string
  completedOf: (done: number, total: number) => string
  sidebarFoot: (total: number) => string
  langSwitchLabel: string // 切到「另一种」语言时按钮显示的文字
  langSwitchTitle: string

  // Home
  badgeRust: string
  badgeForFrontend: string
  badgeVisual: string
  heroTitlePre: string
  heroTitleEm: string
  heroTitlePost: string
  heroSub: JSX.Element
  startChapter: (title: string) => string
  openPlayground: string
  statChapters: string
  statMinutes: string
  statDone: string
  whyCards: { ico: string; title: string; body: string }[]
  outlineTitle: string
  footGithub: string
  footMeta: string

  // ChapterPage
  notFoundTitle: string
  backHome: string
  chapterKicker: (n: number, group: string) => string
  chapterMins: (m: number) => string
  loading: string
  markDone: string
  markedDone: string
  navPrev: string
  navNext: string
  navFinished: string
  navBackHome: string

  // Ui.tsx 教学组件
  calloutLabels: Record<'tip' | 'info' | 'warn' | 'danger' | 'rust' | 'js', string>
  frontendAnalogy: string
  quizBadge: string
  quizRight: string
  quizWrong: string
  quizRetry: string

  // Lab.tsx
  drillBadge: string
  drillDefaultTitle: string
  drillCodeTitle: string
  drillErrorTag: string
  labBadge: string
  labMins: (m: number) => string
  labRunnerTitle: string
  showHint: string
  hideHint: string
  showSolution: string
  hideSolution: string
  solutionTitle: string

  // CodeBlock.tsx
  copy: string
  copied: string
  outputTag: string

  // RustRunner.tsx
  runnerEditable: string
  restore: string
  restoreTitle: string
  compiling: string
  run: string
  expectedOutput: string
  runningCloud: string
  errorTag: string
  requestFailed: string
  runnerErrHint: string
  outputOk: string
  compileFailed: string
  fromPlayground: (sec: string) => string
  noOutput: string
}

const zh: UIStrings = {
  menu: '菜单',
  brandTagline: 'for',
  navHome: '🏠 课程首页',
  playground: 'Rust Playground ↗',
  github: 'GitHub 仓库',
  twitter: 'X / Twitter',
  completedOf: (d, t) => `已完成 ${d}/${t}`,
  sidebarFoot: (t) => `为前端而写 · 共 ${t} 章`,
  langSwitchLabel: 'EN',
  langSwitchTitle: '切换到英文',

  badgeRust: '🦀 Rust',
  badgeForFrontend: '面向前端工程师',
  badgeVisual: '可视化 · 可交互',
  heroTitlePre: '用',
  heroTitleEm: '前端的心智模型',
  heroTitlePost: '把 Rust 学进去',
  heroSub: (
    <>
      你已经会 JavaScript / TypeScript 了。这门课不从零讲编程,而是把 Rust
      的每个概念都翻译成你熟悉的语言 —— 所有权对应什么、<code>Result</code>{' '}
      取代了哪种 <code>try/catch</code>、Wasm 怎么和你的 React
      应用对话。配合可交互的动画一眼看懂。
    </>
  ),
  startChapter: (title) => `开始第 1 章 · ${title} →`,
  openPlayground: '打开 Rust Playground',
  statChapters: '章节',
  statMinutes: '分钟',
  statDone: '已完成',
  whyCards: [
    {
      ico: '🧠',
      title: '对照式讲解',
      body: '每个语法点都给出 JS/TS 与 Rust 的并排代码,你看一眼就知道差异在哪。',
    },
    {
      ico: '🎞️',
      title: '可视化核心难点',
      body: '所有权 move、借用检查、栈与堆、迭代器管道 —— 用 SVG 动画让抽象变具体。',
    },
    {
      ico: '🛠️',
      title: '动手做小工具',
      body: '从环境搭建到一个能跑的 CLI 工具,再到编译成 WebAssembly 嵌进网页。',
    },
  ],
  outlineTitle: '课程大纲',
  footGithub: '在 GitHub 查看源码',
  footMeta: '用 Vite · React · SVG 构建 · 一门为前端而生的 Rust 教程 🦀',

  notFoundTitle: '找不到这一章 🤔',
  backHome: '返回首页',
  chapterKicker: (n, group) => `第 ${String(n).padStart(2, '0')} 章 · ${group}`,
  chapterMins: (m) => `⏱ 约 ${m} 分钟`,
  loading: '加载中…',
  markDone: '标记为已学完',
  markedDone: '✓ 已学完这一章',
  navPrev: '← 上一章',
  navNext: '下一章 →',
  navFinished: '完结 🎉',
  navBackHome: '回到首页',

  calloutLabels: {
    tip: '小贴士',
    info: '说明',
    warn: '注意',
    danger: '陷阱',
    rust: 'Rust 视角',
    js: 'JS 类比',
  },
  frontendAnalogy: '前端类比：',
  quizBadge: '🧠 自测',
  quizRight: '✅ 正确!',
  quizWrong: '❌ 再想想',
  quizRetry: '重试',

  drillBadge: '🔍 报错训练',
  drillDefaultTitle: '读懂下面的编译错误',
  drillCodeTitle: '编译不过的代码',
  drillErrorTag: 'rustc 报错',
  labBadge: '🔧 动手练习',
  labMins: (m) => `⏱ ${m} 分钟`,
  labRunnerTitle: 'lab.rs · 改我 → 运行',
  showHint: '看提示',
  hideHint: '收起提示',
  showSolution: '看参考答案',
  hideSolution: '收起参考答案',
  solutionTitle: '参考答案(可复制进上方运行)',

  copy: '复制',
  copied: '✓ 已复制',
  outputTag: '输出',

  runnerEditable: 'rust · 可编辑',
  restore: '↺ 还原',
  restoreTitle: '还原为初始代码',
  compiling: '编译中…',
  run: '▶ 运行',
  expectedOutput: '预期输出',
  runningCloud: '正在云端编译并运行…',
  errorTag: '出错',
  requestFailed: '请求失败',
  runnerErrHint:
    '(网络问题或 Playground 暂不可用,可点右上角 Playground ↗ 重试)',
  outputOk: '输出',
  compileFailed: '编译失败',
  fromPlayground: (sec) => ` · ${sec}s · 来自 play.rust-lang.org`,
  noOutput: '(程序没有输出)',
}

const en: UIStrings = {
  menu: 'Menu',
  brandTagline: 'for',
  navHome: '🏠 Course Home',
  playground: 'Rust Playground ↗',
  github: 'GitHub repo',
  twitter: 'X / Twitter',
  completedOf: (d, t) => `Completed ${d}/${t}`,
  sidebarFoot: (t) => `Written for frontend devs · ${t} chapters`,
  langSwitchLabel: '中文',
  langSwitchTitle: 'Switch to Chinese',

  badgeRust: '🦀 Rust',
  badgeForFrontend: 'For Frontend Engineers',
  badgeVisual: 'Visual · Interactive',
  heroTitlePre: 'Learn Rust through a',
  heroTitleEm: 'frontend mental model',
  heroTitlePost: '',
  heroSub: (
    <>
      You already know JavaScript / TypeScript. This course doesn't teach
      programming from scratch — it translates every Rust concept into ideas
      you already own: what ownership maps to, which kind of{' '}
      <code>try/catch</code> a <code>Result</code> replaces, and how Wasm talks
      to your React app. Interactive animations make the hard parts click at a
      glance.
    </>
  ),
  startChapter: (title) => `Start Chapter 1 · ${title} →`,
  openPlayground: 'Open the Rust Playground',
  statChapters: 'chapters',
  statMinutes: 'minutes',
  statDone: 'done',
  whyCards: [
    {
      ico: '🧠',
      title: 'Side-by-side teaching',
      body: 'Every concept comes with JS/TS and Rust code side by side, so the difference jumps out at a glance.',
    },
    {
      ico: '🎞️',
      title: 'The hard parts, visualized',
      body: 'Ownership moves, the borrow checker, stack vs. heap, iterator pipelines — SVG animations make the abstract concrete.',
    },
    {
      ico: '🛠️',
      title: 'Build real little tools',
      body: 'From setting up your toolchain to a working CLI, all the way to compiling Rust into WebAssembly for the web.',
    },
  ],
  outlineTitle: 'Course Outline',
  footGithub: 'View source on GitHub',
  footMeta: 'Built with Vite · React · SVG — a Rust course made for frontend devs 🦀',

  notFoundTitle: 'Chapter not found 🤔',
  backHome: 'Back to home',
  chapterKicker: (n, group) => `Chapter ${String(n).padStart(2, '0')} · ${group}`,
  chapterMins: (m) => `⏱ ~${m} min`,
  loading: 'Loading…',
  markDone: 'Mark as complete',
  markedDone: '✓ Chapter complete',
  navPrev: '← Previous',
  navNext: 'Next →',
  navFinished: 'Finished 🎉',
  navBackHome: 'Back to home',

  calloutLabels: {
    tip: 'Tip',
    info: 'Note',
    warn: 'Heads-up',
    danger: 'Pitfall',
    rust: 'Rust view',
    js: 'JS analogy',
  },
  frontendAnalogy: 'Frontend analogy: ',
  quizBadge: '🧠 Quiz',
  quizRight: '✅ Correct!',
  quizWrong: '❌ Not quite',
  quizRetry: 'Retry',

  drillBadge: '🔍 Error Drill',
  drillDefaultTitle: 'Read the compiler error below',
  drillCodeTitle: "Code that won't compile",
  drillErrorTag: 'rustc error',
  labBadge: '🔧 Hands-on',
  labMins: (m) => `⏱ ${m} min`,
  labRunnerTitle: 'lab.rs · fix me → run',
  showHint: 'Show hint',
  hideHint: 'Hide hint',
  showSolution: 'Show solution',
  hideSolution: 'Hide solution',
  solutionTitle: 'Solution (copy it into the runner above)',

  copy: 'Copy',
  copied: '✓ Copied',
  outputTag: 'Output',

  runnerEditable: 'rust · editable',
  restore: '↺ Reset',
  restoreTitle: 'Reset to the original code',
  compiling: 'Compiling…',
  run: '▶ Run',
  expectedOutput: 'Expected output',
  runningCloud: 'Compiling and running in the cloud…',
  errorTag: 'Error',
  requestFailed: 'Request failed',
  runnerErrHint:
    " (network issue or the Playground is unavailable — click Playground ↗ at the top right to retry)",
  outputOk: 'Output',
  compileFailed: 'Compile failed',
  fromPlayground: (sec) => ` · ${sec}s · from play.rust-lang.org`,
  noOutput: '(the program produced no output)',
}

const STRINGS: Record<Lang, UIStrings> = { zh, en }

/** 取当前语言的框架文案 */
export function useUI(): UIStrings {
  return STRINGS[useLang()]
}

export function uiFor(lang: Lang): UIStrings {
  return STRINGS[lang]
}
