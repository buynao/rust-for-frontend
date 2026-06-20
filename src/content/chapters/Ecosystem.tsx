import { Callout, Quiz, Figure, Pill } from '../../components/Ui'
import CodeBlock from '../../components/CodeBlock'
import Flow from '../../components/viz/Flow'
import { useLang } from '../../i18n/lang'

interface Crate {
  name: string
  desc: string
  npm: string
}
const groups: { title: string; icon: string; crates: Crate[] }[] = [
  {
    title: '序列化 / 数据',
    icon: '🔄',
    crates: [
      { name: 'serde + serde_json', desc: 'JSON/YAML/TOML 等序列化反序列化,事实标准', npm: 'JSON.parse + zod' },
      { name: 'csv', desc: '读写 CSV', npm: 'papaparse' },
      { name: 'regex', desc: '正则表达式', npm: '内置 RegExp' },
    ],
  },
  {
    title: 'Web 后端 / 网络',
    icon: '🌐',
    crates: [
      { name: 'axum / actix-web', desc: 'Web 框架(路由、中间件、提取器)', npm: 'express / fastify' },
      { name: 'reqwest', desc: 'HTTP 客户端', npm: 'axios / fetch' },
      { name: 'tokio', desc: '异步运行时(事件循环、定时器、IO)', npm: 'Node 的事件循环' },
      { name: 'sqlx / diesel', desc: '数据库访问(编译期校验 SQL)', npm: 'prisma / knex' },
    ],
  },
  {
    title: '命令行工具',
    icon: '⌨️',
    crates: [
      { name: 'clap', desc: '参数解析(子命令、帮助、补全)', npm: 'commander / yargs' },
      { name: 'indicatif', desc: '进度条与 spinner', npm: 'ora / cli-progress' },
      { name: 'anyhow / thiserror', desc: '错误处理(应用用 anyhow,库用 thiserror)', npm: '自定义 Error 类' },
    ],
  },
  {
    title: '前端 / Wasm / 桌面',
    icon: '🕸️',
    crates: [
      { name: 'wasm-bindgen / wasm-pack', desc: 'Rust ↔ JS 绑定与打包', npm: '——(Rust 独有)' },
      { name: 'tauri', desc: '用前端写 UI 的桌面应用框架', npm: 'electron' },
      { name: 'leptos / yew', desc: 'Rust 写的前端框架(细粒度响应式 / 类 React)', npm: 'solid / react' },
    ],
  },
  {
    title: '通用工具',
    icon: '🧰',
    crates: [
      { name: 'rayon', desc: '一行把迭代器变并行:par_iter()', npm: '——(JS 难以做到)' },
      { name: 'chrono / time', desc: '日期时间', npm: 'date-fns / dayjs' },
      { name: 'rand', desc: '随机数', npm: 'Math.random 的强化版' },
      { name: 'itertools', desc: '更多迭代器适配器', npm: 'lodash 的迭代部分' },
    ],
  },
]

const groupsEn: { title: string; icon: string; crates: Crate[] }[] = [
  {
    title: 'Serialization / Data',
    icon: '🔄',
    crates: [
      { name: 'serde + serde_json', desc: 'Serialize/deserialize JSON, YAML, TOML, etc. — the de facto standard', npm: 'JSON.parse + zod' },
      { name: 'csv', desc: 'Read/write CSV', npm: 'papaparse' },
      { name: 'regex', desc: 'Regular expressions', npm: 'built-in RegExp' },
    ],
  },
  {
    title: 'Web backend / Networking',
    icon: '🌐',
    crates: [
      { name: 'axum / actix-web', desc: 'Web frameworks (routing, middleware, extractors)', npm: 'express / fastify' },
      { name: 'reqwest', desc: 'HTTP client', npm: 'axios / fetch' },
      { name: 'tokio', desc: 'Async runtime (event loop, timers, IO)', npm: "Node's event loop" },
      { name: 'sqlx / diesel', desc: 'Database access (compile-time-checked SQL)', npm: 'prisma / knex' },
    ],
  },
  {
    title: 'Command-line tools',
    icon: '⌨️',
    crates: [
      { name: 'clap', desc: 'Argument parsing (subcommands, help, completions)', npm: 'commander / yargs' },
      { name: 'indicatif', desc: 'Progress bars and spinners', npm: 'ora / cli-progress' },
      { name: 'anyhow / thiserror', desc: 'Error handling (anyhow for apps, thiserror for libraries)', npm: 'custom Error classes' },
    ],
  },
  {
    title: 'Frontend / Wasm / Desktop',
    icon: '🕸️',
    crates: [
      { name: 'wasm-bindgen / wasm-pack', desc: 'Rust ↔ JS bindings and bundling', npm: '— (Rust-specific)' },
      { name: 'tauri', desc: 'Desktop app framework with a frontend-built UI', npm: 'electron' },
      { name: 'leptos / yew', desc: 'Rust frontend frameworks (fine-grained reactive / React-like)', npm: 'solid / react' },
    ],
  },
  {
    title: 'General-purpose utilities',
    icon: '🧰',
    crates: [
      { name: 'rayon', desc: 'Parallelize an iterator in one line: par_iter()', npm: '— (hard to do in JS)' },
      { name: 'chrono / time', desc: 'Date and time', npm: 'date-fns / dayjs' },
      { name: 'rand', desc: 'Random numbers', npm: 'a beefed-up Math.random' },
      { name: 'itertools', desc: 'More iterator adapters', npm: "lodash's iteration helpers" },
    ],
  },
]

export default function Ecosystem() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        语言学完了,真正干活靠生态。Rust 的包叫 <strong>crate</strong>,都托管在
        <strong>crates.io</strong>(≈ npmjs.com)。这一章是一张<strong>速查地图</strong>:
        把最主流的 crate 按用途分类,并标出它在前端世界里的「对应物」,方便你按图索骥。
      </p>

      <Callout kind="rust" title="怎么找 & 怎么加">
        找包上 <strong>crates.io</strong> 或 <strong>lib.rs</strong>(更好的分类浏览);看文档上
        <strong>docs.rs</strong>(每个 crate 自动生成,质量极高)。添加依赖就一句
        <code>cargo add 包名</code>(≈ <code>npm install</code>)。
      </Callout>

      <Figure title="Rust 生态全景:从一个 crate 出发" caption="一份核心逻辑(core crate),可以被命令行、Web 服务、Wasm 三种「外壳」复用——这正是 Rust 在前端基建里的典型角色。">
        <Flow
          width={700}
          height={210}
          nodes={[
            { id: 'core', x: 270, y: 90, w: 160, label: '你的核心逻辑', sub: 'core crate', tone: 'rust' },
            { id: 'cli', x: 30, y: 20, w: 150, label: 'CLI 工具', sub: 'clap + anyhow', tone: 'info' },
            { id: 'web', x: 30, y: 160, w: 150, label: 'Web 服务', sub: 'axum + tokio', tone: 'ok' },
            { id: 'wasm', x: 520, y: 20, w: 160, label: '浏览器 Wasm', sub: 'wasm-bindgen', tone: 'ok' },
            { id: 'desktop', x: 520, y: 160, w: 160, label: '桌面应用', sub: 'tauri', tone: 'warn' },
          ]}
          edges={[
            { from: 'core', to: 'cli', side: 'h' },
            { from: 'core', to: 'web', side: 'h' },
            { from: 'core', to: 'wasm', side: 'h' },
            { from: 'core', to: 'desktop', side: 'h' },
          ]}
        />
      </Figure>

      <h2>分类速查表</h2>
      {groups.map((g) => (
        <div key={g.title} style={{ margin: '1.6rem 0' }}>
          <h3 style={{ marginBottom: 10 }}>{g.icon} {g.title}</h3>
          <div className="prose">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
                  <th style={cell}>crate</th>
                  <th style={cell}>作用</th>
                  <th style={cell}>前端类比</th>
                </tr>
              </thead>
              <tbody>
                {g.crates.map((cr) => (
                  <tr key={cr.name} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={cell}><code style={{ color: 'var(--rust)' }}>{cr.name}</code></td>
                    <td style={{ ...cell, color: 'var(--fg-1)' }}>{cr.desc}</td>
                    <td style={{ ...cell, color: 'var(--fg-3)' }}>{cr.npm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <h2>两个最该先认识的:serde 与 rayon</h2>
      <p>
        <Pill>serde</Pill> 是 Rust 生态的「水电煤」,几乎所有项目都用它做序列化。配合 <code>#[derive]</code>,
        把结构体和 JSON 互转只要几行:
      </p>
      <CodeBlock
        runnable
        title="serde:结构体 ↔ JSON"
        code={`// Cargo.toml: serde = { version = "1", features = ["derive"] }
//             serde_json = "1"
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct User { name: String, age: u32 }

fn main() {
    let json = r#"{"name":"Ada","age":36}"#;
    // JSON → 结构体(像 JSON.parse,但类型安全)
    let user: User = serde_json::from_str(json).unwrap();
    println!("{} 今年 {} 岁", user.name, user.age);

    // 结构体 → JSON(像 JSON.stringify)
    let back = serde_json::to_string(&user).unwrap();
    println!("{back}");
}`}
        output={`Ada 今年 36 岁
{"name":"Ada","age":36}`}
      />
      <p>
        <Pill>rayon</Pill> 展示了 Rust 并发的魔力:把 <code>.iter()</code> 换成 <code>.par_iter()</code>,
        一个串行迭代器就变成<strong>多核并行</strong>,而且因为所有权规则,编译器保证它<strong>没有数据竞争</strong>:
      </p>
      <CodeBlock
        title="rayon:一行并行化"
        code={`use rayon::prelude::*;

// 串行:.iter()
let sum: i64 = (0..1_000_000).map(|x| x * 2).sum();

// 并行:仅把 .iter 换成 .par_iter,自动用满所有 CPU 核心
let sum: i64 = (0..1_000_000_i64).into_par_iter().map(|x| x * 2).sum();
// JS 想这么干?得开 Worker、postMessage、手动分片…… Rust 一个词搞定`}
      />

      <Callout kind="tip" title="选 crate 的经验">
        看 ① 近期是否维护、② 下载量(crates.io 有显示)、③ 文档是否完善(docs.rs)。
        「应用程序」用 <code>anyhow</code> 处理错误省事;「写库给别人用」则用 <code>thiserror</code> 定义清晰的错误类型。
        Web 选 <code>axum</code>(背靠 tokio 团队,生态新主流)。
      </Callout>

      <Quiz
        question="你想把一个已有的串行迭代器计算改成充分利用多核 CPU,最省事的 Rust 方案是?"
        options={[
          { text: '手动 std::thread::spawn 开一堆线程并自己分片' },
          { text: '引入 rayon,把 .iter() 换成 .par_iter(),其余代码几乎不变', correct: true },
          { text: 'Rust 无法并行,只能串行' },
          { text: '改用 async/await' },
        ]}
        explain={
          <>
            <code>rayon</code> 提供「并行迭代器」:大多数情况只需把 <code>iter()</code>/<code>into_iter()</code> 换成
            <code>par_iter()</code>/<code>into_par_iter()</code>,它自动把工作分配到线程池跑满多核。而所有权与
            <code>Send</code>/<code>Sync</code> 规则保证这一切没有数据竞争——这是 JS 很难轻松做到的。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① crate 在 crates.io,<code>cargo add</code> 安装,docs.rs 看文档;② 按用途记住几个主力:
        serde(序列化)、tokio/axum(异步/Web)、clap(CLI)、rayon(并行)、wasm-bindgen/tauri(前端/桌面);
        ③ 一份核心逻辑可被 CLI / Web / Wasm 复用。下一章先逛逛 Rust 的"名人堂"——那些你可能天天在用的明星开源项目。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        Now that the language is under your belt, getting real work done comes down to the ecosystem. Rust packages are
        called <strong>crates</strong>, and they all live on <strong>crates.io</strong> (≈ npmjs.com). This chapter is a
        <strong> cheat-sheet map</strong>: it sorts the most popular crates by purpose and points out their
        counterparts in the frontend world, so you always know where to look.
      </p>

      <Callout kind="rust" title="How to find &amp; how to add">
        To find packages, browse <strong>crates.io</strong> or <strong>lib.rs</strong> (which has nicer category
        browsing); for docs, go to <strong>docs.rs</strong> (auto-generated for every crate, and the quality is
        excellent). Adding a dependency is a one-liner: <code>cargo add package-name</code> (≈ <code>npm install</code>).
      </Callout>

      <Figure title="The Rust ecosystem at a glance: starting from a single crate" caption="One piece of core logic (a core crate) can be reused across three different 'shells' — a command-line tool, a web service, and Wasm. This is exactly the role Rust plays in frontend infrastructure.">
        <Flow
          width={700}
          height={210}
          nodes={[
            { id: 'core', x: 270, y: 90, w: 160, label: 'Your core logic', sub: 'core crate', tone: 'rust' },
            { id: 'cli', x: 30, y: 20, w: 150, label: 'CLI tool', sub: 'clap + anyhow', tone: 'info' },
            { id: 'web', x: 30, y: 160, w: 150, label: 'Web service', sub: 'axum + tokio', tone: 'ok' },
            { id: 'wasm', x: 520, y: 20, w: 160, label: 'Browser Wasm', sub: 'wasm-bindgen', tone: 'ok' },
            { id: 'desktop', x: 520, y: 160, w: 160, label: 'Desktop app', sub: 'tauri', tone: 'warn' },
          ]}
          edges={[
            { from: 'core', to: 'cli', side: 'h' },
            { from: 'core', to: 'web', side: 'h' },
            { from: 'core', to: 'wasm', side: 'h' },
            { from: 'core', to: 'desktop', side: 'h' },
          ]}
        />
      </Figure>

      <h2>Category cheat sheet</h2>
      {groupsEn.map((g) => (
        <div key={g.title} style={{ margin: '1.6rem 0' }}>
          <h3 style={{ marginBottom: 10 }}>{g.icon} {g.title}</h3>
          <div className="prose">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
                  <th style={cell}>crate</th>
                  <th style={cell}>What it does</th>
                  <th style={cell}>Frontend analogy</th>
                </tr>
              </thead>
              <tbody>
                {g.crates.map((cr) => (
                  <tr key={cr.name} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={cell}><code style={{ color: 'var(--rust)' }}>{cr.name}</code></td>
                    <td style={{ ...cell, color: 'var(--fg-1)' }}>{cr.desc}</td>
                    <td style={{ ...cell, color: 'var(--fg-3)' }}>{cr.npm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <h2>The two to meet first: serde and rayon</h2>
      <p>
        <Pill>serde</Pill> is the "plumbing" of the Rust ecosystem — almost every project uses it for serialization.
        Paired with <code>#[derive]</code>, converting between a struct and JSON takes just a few lines:
      </p>
      <CodeBlock
        runnable
        title="serde: struct ↔ JSON"
        code={`// Cargo.toml: serde = { version = "1", features = ["derive"] }
//             serde_json = "1"
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct User { name: String, age: u32 }

fn main() {
    let json = r#"{"name":"Ada","age":36}"#;
    // JSON → struct (like JSON.parse, but type-safe)
    let user: User = serde_json::from_str(json).unwrap();
    println!("{} is {} years old", user.name, user.age);

    // struct → JSON (like JSON.stringify)
    let back = serde_json::to_string(&user).unwrap();
    println!("{back}");
}`}
        output={`Ada is 36 years old
{"name":"Ada","age":36}`}
      />
      <p>
        <Pill>rayon</Pill> shows off the magic of Rust concurrency: swap <code>.iter()</code> for <code>.par_iter()</code>
        and a sequential iterator turns into <strong>multi-core parallelism</strong>. And thanks to the ownership rules,
        the compiler guarantees there are <strong>no data races</strong>:
      </p>
      <CodeBlock
        title="rayon: parallelize in one line"
        code={`use rayon::prelude::*;

// Sequential: .iter()
let sum: i64 = (0..1_000_000).map(|x| x * 2).sum();

// Parallel: just swap .iter for .par_iter to saturate every CPU core
let sum: i64 = (0..1_000_000_i64).into_par_iter().map(|x| x * 2).sum();
// Want to do this in JS? You'd spin up Workers, postMessage, manually shard... Rust does it in one word`}
      />

      <Callout kind="tip" title="Tips for picking a crate">
        Check: ① is it actively maintained, ② its download count (crates.io shows it), and ③ are the docs solid
        (docs.rs). For an <strong>application</strong>, <code>anyhow</code> makes error handling easy; for a
        <strong> library you ship to others</strong>, use <code>thiserror</code> to define clear error types. For the
        web, go with <code>axum</code> (backed by the tokio team, and the new mainstream of the ecosystem).
      </Callout>

      <Quiz
        question="You want to turn an existing sequential iterator computation into one that fully uses your multi-core CPU. What's the easiest Rust approach?"
        options={[
          { text: 'Manually spawn a bunch of threads with std::thread::spawn and shard the work yourself' },
          { text: 'Pull in rayon, swap .iter() for .par_iter(), and leave the rest of the code basically unchanged', correct: true },
          { text: 'Rust cannot do parallelism — you have to stay sequential' },
          { text: 'Switch to async/await' },
        ]}
        explain={
          <>
            <code>rayon</code> provides "parallel iterators": in most cases you just swap
            <code>iter()</code>/<code>into_iter()</code> for <code>par_iter()</code>/<code>into_par_iter()</code>, and it
            automatically distributes the work across a thread pool to saturate every core. Meanwhile, the ownership and
            <code>Send</code>/<code>Sync</code> rules guarantee none of this has data races — something JS can't pull off
            nearly as easily.
          </>
        }
      />

      <Callout kind="info" title="Key points &amp; what's next">
        ① Crates live on crates.io, <code>cargo add</code> installs them, and docs.rs has the documentation. ② Remember a
        few workhorses by purpose: serde (serialization), tokio/axum (async/web), clap (CLI), rayon (parallelism),
        wasm-bindgen/tauri (frontend/desktop). ③ A single piece of core logic can be reused across CLI / Web / Wasm. The
        next chapter takes a stroll through Rust's "hall of fame" — the star open-source projects you may well be using
        every day.
      </Callout>
    </>
  )
}

const cell = { padding: '8px 10px', verticalAlign: 'top' } as const
