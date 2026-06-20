import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import Flow from '../../components/viz/Flow'
import { useLang } from '../../i18n/lang'

export default function Modules() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        到目前为止我们的代码都挤在一个文件里。真实项目需要<strong>拆分、组织、测试、写文档</strong>。
        这一章讲 Rust 的工程化:模块系统(对应你熟悉的 <code>import/export</code>)、内置测试框架,
        以及「文档即测试」这个惊艳的特性。
      </p>

      <h2>模块系统:import / export 的对应物</h2>
      <Compare
        jsTitle="JS / TS 模块"
        rustTitle="Rust 模块"
        js={`// math.ts
export function add(a, b) { return a + b; }
function helper() {}  // 不 export = 私有

// main.ts
import { add } from "./math";
add(1, 2);`}
        rust={`// 同一文件内的模块
mod math {
    pub fn add(a: i32, b: i32) -> i32 { a + b }
    fn helper() {}   // 默认私有(没有 pub)
}

use math::add;       // 引入
add(1, 2);`}
        note="对应关系:mod ≈ 一个模块/文件;pub ≈ export;use ≈ import;默认私有 ≈ 不写 export。Rust 默认私有,要对外暴露才加 pub。"
      />

      <KeyTerm term="crate / module / path" en="包、模块、路径" analogy="crate ≈ 一个 npm 包;mod ≈ 包内的文件/目录;use 路径里的 :: ≈ import 路径里的 /。">
        <ul style={{ marginTop: 8 }}>
          <li><b>crate</b> —— 编译单元,一个库或一个可执行程序(≈ 一个 npm 包)。</li>
          <li><b>module(mod)</b> —— crate 内部的命名空间,用来分组代码。</li>
          <li><b>path</b> —— 用 <code>::</code> 定位项,如 <code>std::collections::HashMap</code>。</li>
        </ul>
      </KeyTerm>

      <h2>多文件项目的布局</h2>
      <p>当代码变多,把模块拆成文件。Rust 用文件名/目录名建立模块树:</p>
      <Figure title="一个典型的库项目布局" caption="src/lib.rs 是库的根,用 mod 声明子模块;每个子模块对应一个同名 .rs 文件。和 Node 的目录式模块很像。">
        <Flow
          width={680}
          height={210}
          nodes={[
            { id: 'lib', x: 20, y: 90, w: 150, label: 'src/lib.rs', sub: 'crate 根', tone: 'rust' },
            { id: 'parser', x: 240, y: 25, w: 150, label: 'src/parser.rs', sub: 'mod parser', tone: 'info' },
            { id: 'utils', x: 240, y: 95, w: 150, label: 'src/utils.rs', sub: 'mod utils', tone: 'info' },
            { id: 'models', x: 240, y: 165, w: 150, label: 'src/models/', sub: 'mod models', tone: 'info' },
            { id: 'mod', x: 460, y: 165, w: 180, label: 'models/mod.rs', sub: '目录模块入口', tone: 'ok' },
          ]}
          edges={[
            { from: 'lib', to: 'parser', label: 'mod parser;' },
            { from: 'lib', to: 'utils', label: 'mod utils;' },
            { from: 'lib', to: 'models', label: 'mod models;' },
            { from: 'models', to: 'mod' },
          ]}
        />
      </Figure>
      <CodeBlock
        title="src/lib.rs"
        code={`mod parser;          // 声明:去找 src/parser.rs
mod utils;           // 去找 src/utils.rs
pub mod models;      // 公开这个模块给外部使用

use parser::parse;   // 引入子模块里的函数

pub fn run(input: &str) {
    let ast = parse(input);
    // ...
}`}
      />
      <Callout kind="tip" title="main.rs vs lib.rs">
        <code>src/main.rs</code> = 可执行程序入口(<code>cargo run</code>);<code>src/lib.rs</code> = 库入口(给别人 <code>use</code>)。
        很多项目两者都有:lib 写核心逻辑(可测试、可复用),main 只做命令行外壳。我们的实战章就是这个结构。
      </Callout>

      <h2>内置测试:不用装 jest</h2>
      <p>
        Rust <strong>自带</strong>测试框架,不需要任何依赖。给函数加 <code>#[test]</code>,
        <code>cargo test</code> 就会跑它。测试通常和被测代码放同一文件:
      </p>
      <CodeBlock
        runnable
        title="src/lib.rs(含测试)"
        code={`pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// #[cfg(test)] 表示这块只在测试时编译,不进入正式产物
#[cfg(test)]
mod tests {
    use super::*;   // 引入父模块的 add

    #[test]
    fn add_works() {
        assert_eq!(add(2, 3), 5);          // 断言相等
        assert_eq!(add(-1, 1), 0);
        assert!(add(2, 2) == 4);           // 断言为真
    }

    #[test]
    fn add_negative() {
        assert_eq!(add(-2, -3), -5);
    }
}`}
        output={`running 2 tests
test tests::add_works ... ok
test tests::add_negative ... ok

test result: ok. 2 passed; 0 failed`}
      />
      <Compare
        jsTitle="Vitest / Jest(需安装)"
        rustTitle="cargo test(内置)"
        js={`import { test, expect } from "vitest";
import { add } from "./math";

test("add works", () => {
  expect(add(2, 3)).toBe(5);
});
// 还要配 vitest.config、装依赖`}
        rust={`#[test]
fn add_works() {
    assert_eq!(add(2, 3), 5);
}
// 零配置,cargo test 直接跑`}
        note="常用断言:assert_eq!(左, 右)、assert_ne!、assert!(条件)。测试失败会打印漂亮的左右值对比。"
      />

      <h2>文档注释 = 文档 + 测试(神来之笔)</h2>
      <p>
        用 <code>///</code> 写的文档注释支持 Markdown,<code>cargo doc</code> 能生成一个和官方文档同款的网站。
        更妙的是:<strong>文档里的代码示例会被 <code>cargo test</code> 当成测试运行</strong>——你的文档永远不会过时:
      </p>
      <CodeBlock
        title="文档注释 + 文档测试"
        code={`/// 计算两个数的和。
///
/// # 示例
///
/// \`\`\`
/// use mycrate::add;
/// assert_eq!(add(2, 3), 5);
/// \`\`\`
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// cargo doc --open  → 生成并打开 HTML 文档
// cargo test        → 上面示例里的 assert_eq! 也会被执行!`}
      />
      <Callout kind="rust" title="为什么这个特性了不起">
        前端世界里文档和代码经常脱节(README 里的示例早就跑不通了)。Rust 把文档示例变成<strong>真实测试</strong>:
        示例错了,CI 就红。这强制你的文档始终可用,是 Rust 生态文档质量普遍很高的原因之一。
      </Callout>

      <h2>Workspace:Monorepo 的对应物</h2>
      <p>
        多个相关 crate 放一起开发(像前端的 pnpm/turbo monorepo),用 <strong>workspace</strong>:
      </p>
      <CodeBlock
        lang="toml"
        title="根目录 Cargo.toml"
        code={`[workspace]
members = [
    "core",      # 核心库 crate
    "cli",       # 命令行 crate(依赖 core)
    "wasm",      # wasm 绑定 crate(依赖 core)
]
resolver = "2"`}
      />
      <Callout kind="tip" title="对照前端">
        workspace ≈ pnpm-workspace.yaml / npm workspaces。共享一个 <code>Cargo.lock</code> 和 <code>target/</code>,
        crate 之间可以直接互相依赖。适合「核心逻辑 + 多个外壳(CLI / Web / Wasm)」的项目结构。
      </Callout>

      <Quiz
        question="Rust 的「文档测试(doc test)」指的是什么?"
        options={[
          { text: '测试文档的拼写和语法' },
          { text: '写在 /// 文档注释里的代码示例,会被 cargo test 当作真实测试执行,确保示例始终可运行', correct: true },
          { text: '一种生成 PDF 文档的工具' },
          { text: '只能用于私有函数的测试' },
        ]}
        explain={
          <>
            文档注释(<code>///</code>)中用 ```` ``` ```` 包起来的示例代码,<code>cargo test</code> 会真的编译并运行它们。
            这保证了「文档里的示例」和「实际代码行为」永远一致——示例过时了,测试就会失败。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① <code>mod</code>/<code>pub</code>/<code>use</code> ≈ 模块/export/import,默认私有;② 多文件靠模块树组织;
        ③ <code>cargo test</code> + <code>#[test]</code> 零配置测试;④ <code>///</code> 文档注释还能当测试跑;
        ⑤ workspace ≈ monorepo。下一章揭开那个一直跟着我们的 <code>!</code>——宏。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        So far all our code has been crammed into a single file. Real projects need to be
        <strong> split up, organized, tested, and documented</strong>. This chapter covers Rust's
        engineering side: the module system (the counterpart to the <code>import/export</code> you
        already know), a built-in test framework, and the stunning "documentation as tests" feature.
      </p>

      <h2>The module system: the counterpart to import / export</h2>
      <Compare
        jsTitle="JS / TS modules"
        rustTitle="Rust modules"
        js={`// math.ts
export function add(a, b) { return a + b; }
function helper() {}  // not exported = private

// main.ts
import { add } from "./math";
add(1, 2);`}
        rust={`// a module inside the same file
mod math {
    pub fn add(a: i32, b: i32) -> i32 { a + b }
    fn helper() {}   // private by default (no pub)
}

use math::add;       // bring it into scope
add(1, 2);`}
        note="The mapping: mod ≈ a module/file; pub ≈ export; use ≈ import; private by default ≈ leaving off export. Rust is private by default — you add pub to expose something."
      />

      <KeyTerm term="crate / module / path" en="package · module · path" analogy="crate ≈ an npm package; mod ≈ a file/directory within the package; the :: in a use path ≈ the / in an import path.">
        <ul style={{ marginTop: 8 }}>
          <li><b>crate</b> — the unit of compilation, a single library or executable (≈ one npm package).</li>
          <li><b>module (mod)</b> — a namespace inside a crate, used to group code.</li>
          <li><b>path</b> — locates an item with <code>::</code>, e.g. <code>std::collections::HashMap</code>.</li>
        </ul>
      </KeyTerm>

      <h2>Laying out a multi-file project</h2>
      <p>As the code grows, split modules into files. Rust builds the module tree from file and directory names:</p>
      <Figure title="A typical library project layout" caption="src/lib.rs is the library root; it declares submodules with mod, and each submodule maps to a .rs file of the same name. Much like Node's directory-based modules.">
        <Flow
          width={680}
          height={210}
          nodes={[
            { id: 'lib', x: 20, y: 90, w: 150, label: 'src/lib.rs', sub: 'crate root', tone: 'rust' },
            { id: 'parser', x: 240, y: 25, w: 150, label: 'src/parser.rs', sub: 'mod parser', tone: 'info' },
            { id: 'utils', x: 240, y: 95, w: 150, label: 'src/utils.rs', sub: 'mod utils', tone: 'info' },
            { id: 'models', x: 240, y: 165, w: 150, label: 'src/models/', sub: 'mod models', tone: 'info' },
            { id: 'mod', x: 460, y: 165, w: 180, label: 'models/mod.rs', sub: 'directory module entry', tone: 'ok' },
          ]}
          edges={[
            { from: 'lib', to: 'parser', label: 'mod parser;' },
            { from: 'lib', to: 'utils', label: 'mod utils;' },
            { from: 'lib', to: 'models', label: 'mod models;' },
            { from: 'models', to: 'mod' },
          ]}
        />
      </Figure>
      <CodeBlock
        title="src/lib.rs"
        code={`mod parser;          // declaration: go find src/parser.rs
mod utils;           // go find src/utils.rs
pub mod models;      // expose this module to the outside world

use parser::parse;   // bring in a function from a submodule

pub fn run(input: &str) {
    let ast = parse(input);
    // ...
}`}
      />
      <Callout kind="tip" title="main.rs vs lib.rs">
        <code>src/main.rs</code> = the executable's entry point (<code>cargo run</code>); <code>src/lib.rs</code> = the library entry point (for others to <code>use</code>).
        Many projects have both: the lib holds the core logic (testable, reusable), and main is just a command-line shell. Our hands-on chapter uses exactly this structure.
      </Callout>

      <h2>Built-in testing: no jest to install</h2>
      <p>
        Rust <strong>ships with</strong> a test framework — no dependencies needed. Annotate a function with <code>#[test]</code>,
        and <code>cargo test</code> will run it. Tests usually live in the same file as the code they test:
      </p>
      <CodeBlock
        runnable
        title="src/lib.rs (with tests)"
        code={`pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// #[cfg(test)] means this block is compiled only during testing, never in the release build
#[cfg(test)]
mod tests {
    use super::*;   // bring in add from the parent module

    #[test]
    fn add_works() {
        assert_eq!(add(2, 3), 5);          // assert equality
        assert_eq!(add(-1, 1), 0);
        assert!(add(2, 2) == 4);           // assert it's true
    }

    #[test]
    fn add_negative() {
        assert_eq!(add(-2, -3), -5);
    }
}`}
        output={`running 2 tests
test tests::add_works ... ok
test tests::add_negative ... ok

test result: ok. 2 passed; 0 failed`}
      />
      <Compare
        jsTitle="Vitest / Jest (needs install)"
        rustTitle="cargo test (built in)"
        js={`import { test, expect } from "vitest";
import { add } from "./math";

test("add works", () => {
  expect(add(2, 3)).toBe(5);
});
// plus configure vitest.config and install deps`}
        rust={`#[test]
fn add_works() {
    assert_eq!(add(2, 3), 5);
}
// zero config — cargo test just runs it`}
        note="Common assertions: assert_eq!(left, right), assert_ne!, assert!(condition). When a test fails it prints a nice left-vs-right comparison."
      />

      <h2>Doc comments = documentation + tests (a stroke of genius)</h2>
      <p>
        Doc comments written with <code>///</code> support Markdown, and <code>cargo doc</code> generates a site identical to the official docs.
        Even better: <strong>the code examples in your docs are run as tests by <code>cargo test</code></strong> — so your documentation can never go stale:
      </p>
      <CodeBlock
        title="Doc comment + doc test"
        code={`/// Adds two numbers.
///
/// # Examples
///
/// \`\`\`
/// use mycrate::add;
/// assert_eq!(add(2, 3), 5);
/// \`\`\`
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// cargo doc --open  → generate and open the HTML docs
// cargo test        → the assert_eq! in the example above gets executed too!`}
      />
      <Callout kind="rust" title="Why this feature is a big deal">
        In the frontend world, docs and code routinely drift apart (the example in the README stopped working ages ago). Rust turns doc examples into <strong>real tests</strong>:
        if an example is wrong, CI goes red. That forces your docs to stay working, and it's one reason documentation quality across the Rust ecosystem is consistently high.
      </Callout>

      <h2>Workspace: the counterpart to a monorepo</h2>
      <p>
        To develop several related crates together (like a pnpm/turbo monorepo on the frontend), use a <strong>workspace</strong>:
      </p>
      <CodeBlock
        lang="toml"
        title="Root Cargo.toml"
        code={`[workspace]
members = [
    "core",      # the core library crate
    "cli",       # the command-line crate (depends on core)
    "wasm",      # the wasm-bindings crate (depends on core)
]
resolver = "2"`}
      />
      <Callout kind="tip" title="Mapping to the frontend">
        A workspace ≈ pnpm-workspace.yaml / npm workspaces. It shares one <code>Cargo.lock</code> and one <code>target/</code>,
        and crates can depend on each other directly. It's a great fit for "core logic + multiple shells (CLI / Web / Wasm)" project structures.
      </Callout>

      <Quiz
        question="What does a Rust doc test refer to?"
        options={[
          { text: 'Testing the spelling and grammar of the documentation' },
          { text: 'Code examples written inside /// doc comments, which cargo test runs as real tests so the examples always work', correct: true },
          { text: 'A tool for generating PDF documentation' },
          { text: 'Tests that can only be used on private functions' },
        ]}
        explain={
          <>
            Example code wrapped in ```` ``` ```` inside doc comments (<code>///</code>) is actually compiled and run by <code>cargo test</code>.
            That keeps "the examples in the docs" and "how the code actually behaves" forever in sync — if an example goes stale, the test fails.
          </>
        }
      />

      <Callout kind="info" title="Key takeaways & what's next">
        ① <code>mod</code>/<code>pub</code>/<code>use</code> ≈ module/export/import, private by default; ② multi-file projects are organized by the module tree;
        ③ <code>cargo test</code> + <code>#[test]</code> gives you zero-config tests; ④ <code>///</code> doc comments double as tests;
        ⑤ workspace ≈ monorepo. Next chapter we unmask that <code>!</code> that's been following us around — the macro.
      </Callout>
    </>
  )
}
