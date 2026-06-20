import { lazy, type ComponentType } from 'react'
import type { Localized } from '../i18n/lang'

export interface Chapter {
  /** URL slug, e.g. "ownership" → /learn/ownership */
  slug: string
  /** 章节标题(中英) */
  title: Localized
  /** 一句话副标题(中英) */
  subtitle: Localized
  /** 侧栏分组(中英)。以 zh 作为稳定分组键。 */
  group: Localized
  /** 预计阅读分钟 */
  minutes: number
  /** emoji 图标 */
  icon: string
  /** 懒加载的章节组件 */
  Component: ComponentType
}

const G = {
  start: { zh: '起步', en: 'Getting Started' },
  core: { zh: '语言核心', en: 'Language Core' },
  advanced: { zh: '进阶', en: 'Going Deeper' },
  frontend: { zh: '前端实战', en: 'Frontend in Practice' },
} satisfies Record<string, Localized>

/**
 * 课程大纲 —— 以「前端工程师」为读者画像组织。
 * 顺序即学习路径,侧栏与上一章/下一章导航都从这里派生。
 */
export const chapters: Chapter[] = [
  {
    slug: 'why-rust',
    title: { zh: '为什么前端要学 Rust', en: 'Why Frontend Devs Should Learn Rust' },
    subtitle: {
      zh: '从 JS 引擎、构建工具到 Wasm,Rust 早已在你身边',
      en: 'From JS engines to build tools to Wasm — Rust is already all around you',
    },
    group: G.start,
    minutes: 10,
    icon: '🧭',
    Component: lazy(() => import('./chapters/WhyRust')),
  },
  {
    slug: 'setup',
    title: { zh: '安装工具链 · cargo vs npm', en: 'Toolchain Setup · cargo vs npm' },
    subtitle: {
      zh: 'rustup / cargo / crates.io,用 npm 的心智一一对应',
      en: 'rustup / cargo / crates.io, mapped one-to-one onto your npm instincts',
    },
    group: G.start,
    minutes: 9,
    icon: '🛠️',
    Component: lazy(() => import('./chapters/Setup')),
  },
  {
    slug: 'syntax',
    title: { zh: '基础语法速通', en: 'Syntax Crash Course' },
    subtitle: {
      zh: '变量、类型、函数、控制流 —— 和 TS 比着学',
      en: 'Variables, types, functions, control flow — learned side by side with TS',
    },
    group: G.core,
    minutes: 16,
    icon: '📝',
    Component: lazy(() => import('./chapters/Syntax')),
  },
  {
    slug: 'ownership',
    title: { zh: '所有权 · Rust 的灵魂', en: 'Ownership · The Soul of Rust' },
    subtitle: {
      zh: '没有 GC 也没有手动 free,可视化看清 move 与 drop',
      en: 'No GC, no manual free — see move and drop, visualized',
    },
    group: G.core,
    minutes: 20,
    icon: '🔑',
    Component: lazy(() => import('./chapters/Ownership')),
  },
  {
    slug: 'borrowing',
    title: { zh: '借用与引用 · 借用检查器', en: 'Borrowing & References · The Borrow Checker' },
    subtitle: {
      zh: '& 与 &mut,编译期就杜绝数据竞争',
      en: '& and &mut — data races ruled out at compile time',
    },
    group: G.core,
    minutes: 18,
    icon: '🤝',
    Component: lazy(() => import('./chapters/Borrowing')),
  },
  {
    slug: 'structs-enums',
    title: { zh: '结构体 · 枚举 · 模式匹配', en: 'Structs · Enums · Pattern Matching' },
    subtitle: {
      zh: 'interface/union 的强化版,match 比 switch 香',
      en: 'interface/union on steroids, and match beats switch',
    },
    group: G.core,
    minutes: 16,
    icon: '🧩',
    Component: lazy(() => import('./chapters/StructsEnums')),
  },
  {
    slug: 'error-handling',
    title: { zh: '错误处理 · Result 与 Option', en: 'Error Handling · Result and Option' },
    subtitle: {
      zh: '告别 try/catch 与 undefined,错误是值',
      en: 'No more try/catch or undefined — errors are values',
    },
    group: G.core,
    minutes: 15,
    icon: '🚦',
    Component: lazy(() => import('./chapters/ErrorHandling')),
  },
  {
    slug: 'traits-generics',
    title: { zh: 'Trait 与泛型', en: 'Traits & Generics' },
    subtitle: {
      zh: 'interface + 类型类,零成本抽象',
      en: 'interface + typeclasses, abstraction at zero cost',
    },
    group: G.core,
    minutes: 17,
    icon: '🧬',
    Component: lazy(() => import('./chapters/TraitsGenerics')),
  },
  {
    slug: 'closures',
    title: { zh: '闭包 · Fn / FnMut / FnOnce', en: 'Closures · Fn / FnMut / FnOnce' },
    subtitle: {
      zh: '箭头函数你天天写,这次看清它「捕获」了什么',
      en: "You write arrow functions every day — now see what they actually capture",
    },
    group: G.core,
    minutes: 16,
    icon: '🎯',
    Component: lazy(() => import('./chapters/Closures')),
  },
  {
    slug: 'iterators',
    title: { zh: '集合与迭代器', en: 'Collections & Iterators' },
    subtitle: {
      zh: 'map/filter/reduce 你早会了,这次它们零成本',
      en: "You already know map/filter/reduce — this time they're free",
    },
    group: G.core,
    minutes: 14,
    icon: '🔁',
    Component: lazy(() => import('./chapters/Iterators')),
  },
  {
    slug: 'collections',
    title: { zh: '常用集合 · HashMap / HashSet', en: 'Common Collections · HashMap / HashSet' },
    subtitle: {
      zh: 'Map、Set、Object 在 Rust 里长什么样',
      en: 'What Map, Set, and Object look like over in Rust',
    },
    group: G.core,
    minutes: 15,
    icon: '🗂️',
    Component: lazy(() => import('./chapters/Collections')),
  },
  {
    slug: 'smart-pointers',
    title: { zh: '智能指针 · Box / Rc / RefCell', en: 'Smart Pointers · Box / Rc / RefCell' },
    subtitle: {
      zh: '当所有权不够用:共享、递归与内部可变性',
      en: "When ownership isn't enough: sharing, recursion, interior mutability",
    },
    group: G.advanced,
    minutes: 19,
    icon: '📦',
    Component: lazy(() => import('./chapters/SmartPointers')),
  },
  {
    slug: 'lifetimes',
    title: { zh: '生命周期进阶', en: 'Lifetimes, Deeper' },
    subtitle: {
      zh: "看懂 &'a,理解引用「能活多久」的契约",
      en: "Read &'a and grasp the contract for how long a reference may live",
    },
    group: G.advanced,
    minutes: 16,
    icon: '⏳',
    Component: lazy(() => import('./chapters/Lifetimes')),
  },
  {
    slug: 'async',
    title: { zh: '异步与并发', en: 'Async & Concurrency' },
    subtitle: {
      zh: 'async/await 似曾相识,但没有数据竞争',
      en: 'async/await looks familiar — but here there are no data races',
    },
    group: G.advanced,
    minutes: 15,
    icon: '⚡',
    Component: lazy(() => import('./chapters/AsyncConcurrency')),
  },
  {
    slug: 'modules',
    title: { zh: '模块系统 · 测试 · 文档', en: 'Modules · Tests · Docs' },
    subtitle: {
      zh: 'mod / crate / workspace,以及内置测试与文档',
      en: 'mod / crate / workspace, plus built-in testing and documentation',
    },
    group: G.advanced,
    minutes: 17,
    icon: '🏗️',
    Component: lazy(() => import('./chapters/Modules')),
  },
  {
    slug: 'macros',
    title: { zh: '宏 · 元编程入门', en: 'Macros · A Taste of Metaprogramming' },
    subtitle: {
      zh: 'println! 后面那个 ! 到底是什么',
      en: 'What is that ! after println! really doing?',
    },
    group: G.advanced,
    minutes: 14,
    icon: '🪄',
    Component: lazy(() => import('./chapters/Macros')),
  },
  {
    slug: 'wasm',
    title: { zh: 'WebAssembly · 前端的主场', en: "WebAssembly · The Frontend's Home Turf" },
    subtitle: {
      zh: '把 Rust 编译进浏览器,和 JS 双向调用',
      en: 'Compile Rust into the browser and call back and forth with JS',
    },
    group: G.frontend,
    minutes: 18,
    icon: '🕸️',
    Component: lazy(() => import('./chapters/Wasm')),
  },
  {
    slug: 'ecosystem',
    title: { zh: 'Rust 生态地图', en: 'A Map of the Rust Ecosystem' },
    subtitle: {
      zh: '常用 crate 速查:serde、tokio、axum、clap…',
      en: "A quick tour of the crates you'll reach for: serde, tokio, axum, clap…",
    },
    group: G.frontend,
    minutes: 13,
    icon: '🗺️',
    Component: lazy(() => import('./chapters/Ecosystem')),
  },
  {
    slug: 'showcase',
    title: { zh: '明星项目巡礼', en: 'A Tour of Star Projects' },
    subtitle: {
      zh: '前端有 React/Vue,Rust 的名人堂是谁',
      en: "Frontend has React and Vue — who's in Rust's hall of fame?",
    },
    group: G.frontend,
    minutes: 12,
    icon: '⭐',
    Component: lazy(() => import('./chapters/Showcase')),
  },
  {
    slug: 'project',
    title: { zh: '实战 · 写一个 CLI 小工具', en: 'Build It · A Little CLI Tool' },
    subtitle: {
      zh: '从零做一个 Markdown 字数统计器,跑起来',
      en: 'Build a Markdown word counter from scratch and actually run it',
    },
    group: G.frontend,
    minutes: 20,
    icon: '🚀',
    Component: lazy(() => import('./chapters/Project')),
  },
]

export const chapterBySlug = (slug: string): Chapter | undefined =>
  chapters.find((c) => c.slug === slug)

export const chapterIndex = (slug: string): number =>
  chapters.findIndex((c) => c.slug === slug)

/** 按 group 聚合,供侧栏渲染。以 group.zh 作为稳定分组键。 */
export function groupedChapters(): { group: Localized; items: Chapter[] }[] {
  const out: { group: Localized; items: Chapter[] }[] = []
  for (const ch of chapters) {
    let bucket = out.find((b) => b.group.zh === ch.group.zh)
    if (!bucket) {
      bucket = { group: ch.group, items: [] }
      out.push(bucket)
    }
    bucket.items.push(ch)
  }
  return out
}
