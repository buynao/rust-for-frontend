import type { CSSProperties } from 'react'
import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, Quiz, Figure } from '../../components/Ui'
import Flow from '../../components/viz/Flow'
import { useLang } from '../../i18n/lang'

export default function Setup() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        好消息:Rust 的工具链设计深受 npm 时代的影响,几乎是<strong>一一对应</strong>的。
        你已经会的那套「初始化项目 → 装依赖 → 跑脚本」的肌肉记忆,直接平移过来就行。
      </p>

      <h2>一张表搞定心智迁移</h2>
      <div className="prose">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
              <th style={cell}>前端世界</th>
              <th style={cell}>Rust 世界</th>
              <th style={cell}>作用</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nvm', 'rustup', '管理语言版本(可装多个工具链)'],
              ['node / npm', 'cargo', '运行 + 包管理 + 构建,三合一'],
              ['package.json', 'Cargo.toml', '项目清单:依赖、元信息'],
              ['package-lock.json', 'Cargo.lock', '锁定精确版本'],
              ['node_modules/', 'target/ + ~/.cargo', '依赖与构建产物'],
              ['npmjs.com', 'crates.io', '公共包仓库'],
              ['npm install pkg', 'cargo add pkg', '添加依赖'],
              ['npm run dev', 'cargo run', '编译并运行'],
              ['eslint', 'cargo clippy', '静态检查 / lint'],
              ['prettier', 'cargo fmt', '代码格式化'],
              ['jest / vitest', 'cargo test', '跑测试(内置,无需额外装)'],
            ].map((r) => (
              <tr key={r[0]} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={cell}><code>{r[0]}</code></td>
                <td style={cell}><code style={{ color: 'var(--rust)' }}>{r[1]}</code></td>
                <td style={{ ...cell, color: 'var(--fg-2)' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout kind="tip" title="最大的不同">
        在 JS 里 <code>node</code>(运行)和 <code>npm</code>(包管理)是两个工具;在 Rust 里
        <strong> <code>cargo</code> 一个全包了</strong>——编译、运行、测试、发布、生成文档,都是它。
      </Callout>

      <h2>安装:一行命令</h2>
      <p>官方安装器 <code>rustup</code> 会装好编译器 <code>rustc</code>、包管理器 <code>cargo</code> 和标准库:</p>
      <CodeBlock
        lang="bash"
        title="terminal · macOS / Linux"
        code={`# 装 rustup(类似 nvm),它会拉取稳定版工具链
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 重开终端后验证
rustc --version   # rustc 1.xx.x
cargo --version   # cargo 1.xx.x`}
      />
      <Callout kind="info" title="Windows 用户">
        去 <code>rustup.rs</code> 下载 <code>rustup-init.exe</code> 双击即可;它会提示你安装
        「Visual Studio C++ Build Tools」(链接器),按提示装上就行。
      </Callout>

      <h2>创建第一个项目</h2>
      <Compare
        jsTitle="Node 项目"
        jsLang="bash"
        rustTitle="Rust 项目"
        js={`npm init -y
npm install lodash
# 在 index.js 写代码
node index.js`}
        rust={`cargo new hello
cd hello
cargo add rand    # 加个随机数依赖
cargo run         # 编译 + 运行`}
        note="cargo new 会直接生成可运行的项目骨架,连 .gitignore 和 Hello World 都给你写好了。"
      />

      <Figure title="cargo new 生成的项目结构" caption="src/main.rs 是二进制项目的入口(对应 index.js);如果做的是库,入口则是 src/lib.rs。">
        <Flow
          width={620}
          height={210}
          nodes={[
            { id: 'root', x: 20, y: 90, w: 110, label: 'hello/', tone: 'muted' },
            { id: 'toml', x: 200, y: 20, w: 170, label: 'Cargo.toml', sub: '≈ package.json', tone: 'rust' },
            { id: 'lock', x: 200, y: 90, w: 170, label: 'Cargo.lock', sub: '≈ package-lock.json', tone: 'info' },
            { id: 'src', x: 200, y: 160, w: 170, label: 'src/main.rs', sub: '入口 ≈ index.js', tone: 'ok' },
            { id: 'target', x: 440, y: 90, w: 150, label: 'target/', sub: '构建产物(自动生成)', tone: 'muted' },
          ]}
          edges={[
            { from: 'root', to: 'toml' },
            { from: 'root', to: 'lock' },
            { from: 'root', to: 'src' },
            { from: 'src', to: 'target', label: 'cargo build' },
          ]}
        />
      </Figure>

      <h2>Cargo.toml ≈ package.json</h2>
      <Compare
        jsTitle="package.json"
        jsLang="json"
        rustTitle="Cargo.toml"
        js={`{
  "name": "hello",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.0"
  }
}`}
        rust={`[package]
name = "hello"
version = "0.1.0"
edition = "2024"

[dependencies]
rand = "0.8"`}
        note='注意 Rust 用 TOML 而非 JSON;版本号 "0.8" 默认等价于 npm 的 ^0.8(兼容更新)。'
      />

      <h2>每天都会用到的几条命令</h2>
      <CodeBlock
        lang="bash"
        title="cargo 速查"
        code={`cargo run            # 编译并运行(开发时最常用)
cargo build          # 只编译,产物在 target/debug/
cargo build --release  # 优化编译,慢但快得多,产物在 target/release/
cargo check          # 只做类型/借用检查,不生成可执行文件(超快)
cargo test           # 跑所有测试
cargo fmt            # 一键格式化(= prettier)
cargo clippy         # 高级 lint,会给改进建议(= eslint,但更聪明)
cargo doc --open     # 为你的项目+所有依赖生成文档并打开`}
      />
      <Callout kind="rust" title="cargo check 是你的新朋友">
        写 Rust 时最高频的命令其实是 <code>cargo check</code>——它跳过代码生成,几秒就能告诉你
        类型和借用对不对。配合编辑器插件,几乎是「保存即检查」。
      </Callout>

      <h2>编辑器:装这一个就够了</h2>
      <p>
        在 VS Code 里搜索安装 <strong>rust-analyzer</strong> 扩展。它是 Rust 官方的语言服务器,
        提供自动补全、类型提示(把推断出来的类型直接标在变量旁)、跳转定义、内联报错——
        体验和你用 TypeScript 的 <code>tsserver</code> 一模一样,甚至更强。
      </p>

      <Quiz
        question="你想快速确认代码有没有类型/借用错误,但不需要真的运行它。最合适的命令是?"
        options={[
          { text: 'cargo build --release' },
          { text: 'cargo check', correct: true },
          { text: 'cargo run' },
          { text: 'cargo doc' },
        ]}
        explain={
          <>
            <code>cargo check</code> 跳过最耗时的「机器码生成」阶段,只做前端的类型与借用检查,
            是反馈最快的方式。<code>build --release</code> 反而最慢(要做优化)。
          </>
        }
      />

      <Callout kind="info" title="下一步">
        环境就绪!下一章我们正式进入语法,把 <code>let</code>、类型、函数、控制流和你熟悉的
        TypeScript 对着学一遍。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        Good news: Rust's toolchain was heavily shaped by the npm era, and the two
        map almost <strong>one-to-one</strong>. The muscle memory you already
        have — "init a project → install deps → run scripts" — carries straight over.
      </p>

      <h2>One table to migrate your mental model</h2>
      <div className="prose">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
              <th style={cell}>Frontend world</th>
              <th style={cell}>Rust world</th>
              <th style={cell}>What it does</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['nvm', 'rustup', 'Manages language versions (install multiple toolchains)'],
              ['node / npm', 'cargo', 'Run + package manager + build, all in one'],
              ['package.json', 'Cargo.toml', 'Project manifest: dependencies, metadata'],
              ['package-lock.json', 'Cargo.lock', 'Pins exact versions'],
              ['node_modules/', 'target/ + ~/.cargo', 'Dependencies and build artifacts'],
              ['npmjs.com', 'crates.io', 'Public package registry'],
              ['npm install pkg', 'cargo add pkg', 'Add a dependency'],
              ['npm run dev', 'cargo run', 'Compile and run'],
              ['eslint', 'cargo clippy', 'Static analysis / lint'],
              ['prettier', 'cargo fmt', 'Code formatting'],
              ['jest / vitest', 'cargo test', 'Run tests (built in, nothing extra to install)'],
            ].map((r) => (
              <tr key={r[0]} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={cell}><code>{r[0]}</code></td>
                <td style={cell}><code style={{ color: 'var(--rust)' }}>{r[1]}</code></td>
                <td style={{ ...cell, color: 'var(--fg-2)' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout kind="tip" title="The biggest difference">
        In JS, <code>node</code> (running) and <code>npm</code> (package management) are two separate tools; in Rust,
        <strong> <code>cargo</code> does it all</strong> — compiling, running, testing, publishing, generating docs, it's all cargo.
      </Callout>

      <h2>Install: a single command</h2>
      <p>The official installer <code>rustup</code> sets up the compiler <code>rustc</code>, the package manager <code>cargo</code>, and the standard library:</p>
      <CodeBlock
        lang="bash"
        title="terminal · macOS / Linux"
        code={`# Install rustup (like nvm); it pulls down the stable toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Reopen the terminal, then verify
rustc --version   # rustc 1.xx.x
cargo --version   # cargo 1.xx.x`}
      />
      <Callout kind="info" title="Windows users">
        Head to <code>rustup.rs</code>, download <code>rustup-init.exe</code>, and double-click it. It'll prompt you to install
        the "Visual Studio C++ Build Tools" (the linker) — just follow the prompts.
      </Callout>

      <h2>Create your first project</h2>
      <Compare
        jsTitle="Node project"
        jsLang="bash"
        rustTitle="Rust project"
        js={`npm init -y
npm install lodash
# write code in index.js
node index.js`}
        rust={`cargo new hello
cd hello
cargo add rand    # add a random-number dependency
cargo run         # compile + run`}
        note="cargo new generates a ready-to-run project skeleton — it even writes the .gitignore and a Hello World for you."
      />

      <Figure title="The project structure cargo new generates" caption="src/main.rs is the entry point for a binary project (the counterpart to index.js); if you're building a library, the entry point is src/lib.rs instead.">
        <Flow
          width={620}
          height={210}
          nodes={[
            { id: 'root', x: 20, y: 90, w: 110, label: 'hello/', tone: 'muted' },
            { id: 'toml', x: 200, y: 20, w: 170, label: 'Cargo.toml', sub: '≈ package.json', tone: 'rust' },
            { id: 'lock', x: 200, y: 90, w: 170, label: 'Cargo.lock', sub: '≈ package-lock.json', tone: 'info' },
            { id: 'src', x: 200, y: 160, w: 170, label: 'src/main.rs', sub: 'entry ≈ index.js', tone: 'ok' },
            { id: 'target', x: 440, y: 90, w: 150, label: 'target/', sub: 'build artifacts (auto-generated)', tone: 'muted' },
          ]}
          edges={[
            { from: 'root', to: 'toml' },
            { from: 'root', to: 'lock' },
            { from: 'root', to: 'src' },
            { from: 'src', to: 'target', label: 'cargo build' },
          ]}
        />
      </Figure>

      <h2>Cargo.toml ≈ package.json</h2>
      <Compare
        jsTitle="package.json"
        jsLang="json"
        rustTitle="Cargo.toml"
        js={`{
  "name": "hello",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "^4.17.0"
  }
}`}
        rust={`[package]
name = "hello"
version = "0.1.0"
edition = "2024"

[dependencies]
rand = "0.8"`}
        note='Note that Rust uses TOML rather than JSON; the version "0.8" defaults to the equivalent of npm&apos;s ^0.8 (compatible updates).'
      />

      <h2>The handful of commands you'll use every day</h2>
      <CodeBlock
        lang="bash"
        title="cargo cheat sheet"
        code={`cargo run            # compile and run (most-used during development)
cargo build          # compile only, output in target/debug/
cargo build --release  # optimized build, slow but much faster, output in target/release/
cargo check          # type/borrow check only, no executable produced (super fast)
cargo test           # run all tests
cargo fmt            # one-shot formatting (= prettier)
cargo clippy         # advanced lint with suggestions (= eslint, but smarter)
cargo doc --open     # generate docs for your project + all deps and open them`}
      />
      <Callout kind="rust" title="cargo check is your new best friend">
        The command you'll run most while writing Rust is actually <code>cargo check</code> — it skips code generation and tells you in seconds whether
        your types and borrows are correct. Paired with the editor plugin, it's basically "check on save."
      </Callout>

      <h2>Editor: install just this one thing</h2>
      <p>
        In VS Code, search for and install the <strong>rust-analyzer</strong> extension. It's Rust's official language server,
        providing autocomplete, type hints (it labels inferred types right next to your variables), go-to-definition, and inline errors —
        the experience is identical to using TypeScript's <code>tsserver</code>, if not better.
      </p>

      <Quiz
        question="You want to quickly confirm whether your code has type/borrow errors, without actually running it. Which command fits best?"
        options={[
          { text: 'cargo build --release' },
          { text: 'cargo check', correct: true },
          { text: 'cargo run' },
          { text: 'cargo doc' },
        ]}
        explain={
          <>
            <code>cargo check</code> skips the most time-consuming stage — machine-code generation — and only does the front-end type and borrow checks,
            making it the fastest way to get feedback. <code>build --release</code> is actually the slowest (it has to optimize).
          </>
        }
      />

      <Callout kind="info" title="Next step">
        Your environment is ready! In the next chapter we'll get into the syntax proper, learning <code>let</code>, types, functions, and control flow
        side by side with the TypeScript you already know.
      </Callout>
    </>
  )
}

const cell: CSSProperties = { padding: '8px 10px', verticalAlign: 'top' }
