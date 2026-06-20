import CodeBlock from '../../components/CodeBlock'
import { Callout, Quiz, Figure, Pill } from '../../components/Ui'
import Flow from '../../components/viz/Flow'
import { useLang } from '../../i18n/lang'

export default function Project() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        理论够了,动手做点能跑的东西。我们写一个命令行工具 <code>mdstat</code>:读取一个 Markdown 文件,
        统计<strong>字数、行数、标题数、代码块数</strong>,并打印一份小报告。它会用上你前面学的几乎所有概念:
        所有权、借用、struct、Result、<code>?</code>、迭代器。
      </p>

      <Callout kind="tip" title="跟着做">
        每一步的代码都可以复制到本地运行(<code>cargo run -- README.md</code>),
        或贴进 Rust Playground(把读文件那步换成内置字符串)体验逻辑。
      </Callout>

      <h2>第 0 步:建项目</h2>
      <CodeBlock
        lang="bash"
        code={`cargo new mdstat
cd mdstat
# 之后所有代码都写在 src/main.rs`}
      />

      <Figure title="程序结构" caption="一个清晰的小程序:main 负责取参数和打印,逻辑拆成纯函数,数据装在 struct 里。">
        <Flow
          width={700}
          height={170}
          nodes={[
            { id: 'args', x: 10, y: 60, w: 130, label: '读命令行参数', sub: 'env::args', tone: 'info' },
            { id: 'read', x: 175, y: 60, w: 130, label: '读取文件', sub: 'fs::read_to_string ?', tone: 'rust' },
            { id: 'analyze', x: 340, y: 60, w: 130, label: 'analyze()', sub: '迭代器统计', tone: 'rust' },
            { id: 'stats', x: 505, y: 20, w: 130, label: 'Stats 结构体', sub: '装统计结果', tone: 'ok' },
            { id: 'print', x: 505, y: 105, w: 130, label: '打印报告', sub: 'println!', tone: 'ok' },
          ]}
          edges={[
            { from: 'args', to: 'read' },
            { from: 'read', to: 'analyze' },
            { from: 'analyze', to: 'stats' },
            { from: 'analyze', to: 'print' },
          ]}
        />
      </Figure>

      <h2>第 1 步:用 struct 描述统计结果</h2>
      <CodeBlock
        title="src/main.rs"
        code={`#[derive(Debug, Default)]   // Debug 方便打印,Default 给全 0 初值
struct Stats {
    lines: usize,
    words: usize,
    headings: usize,
    code_blocks: usize,
}`}
      />
      <p>
        <Pill>回顾</Pill> <code>#[derive(...)]</code> 来自第 8 章,自动生成 <code>Debug</code> 和 <code>Default</code>
        的实现,省得手写。
      </p>

      <h2>第 2 步:核心逻辑——用迭代器统计</h2>
      <p>
        接收文件内容的<strong>借用</strong>(<code>&str</code>,不夺所有权——第 5 章),
        逐行遍历,用模式判断累加。代码块由 <code>```</code> 围栏成对出现,所以数栅栏行数除以 2:
      </p>
      <CodeBlock
        title="src/main.rs (续)"
        code={`fn analyze(text: &str) -> Stats {
    let mut stats = Stats::default();
    let mut fence_count = 0;

    for line in text.lines() {           // .lines() 返回迭代器
        stats.lines += 1;
        let trimmed = line.trim_start();

        if trimmed.starts_with("\`\`\`") {
            fence_count += 1;            // 遇到一个 \`\`\` 围栏
        }
        if trimmed.starts_with('#') {
            stats.headings += 1;          // Markdown 标题
        }
        // 按空白切词并计数(空行自然得到 0)
        stats.words += line.split_whitespace().count();
    }
    stats.code_blocks = fence_count / 2;  // 成对的围栏 = 代码块
    stats
}`}
      />

      <h2>第 3 步:main —— 取参数、读文件、处理错误</h2>
      <p>
        <code>main</code> 返回 <code>Result</code>,这样就能用 <code>?</code>(第 7 章)优雅传播错误;
        读不到文件时程序会打印错误并以非零码退出,而不是糊一脸堆栈:
      </p>
      <CodeBlock
        title="src/main.rs (续)"
        code={`use std::fs;
use std::process;

fn main() {
    // 跳过第 0 个参数(程序名),取第 1 个:文件路径
    let path = match std::env::args().nth(1) {
        Some(p) => p,
        None => {
            eprintln!("用法: mdstat <文件.md>");
            process::exit(1);
        }
    };

    // 读文件,失败就友好报错退出
    let text = match fs::read_to_string(&path) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("读取 '{path}' 失败: {e}");
            process::exit(1);
        }
    };

    let stats = analyze(&text);   // 借用 text 给 analyze

    println!("📊 {path} 统计报告");
    println!("───────────────");
    println!("行数      : {}", stats.lines);
    println!("词数      : {}", stats.words);
    println!("标题      : {}", stats.headings);
    println!("代码块    : {}", stats.code_blocks);
}`}
      />

      <h2>第 4 步:跑起来!</h2>
      <CodeBlock
        lang="bash"
        title="terminal"
        code={`# -- 后面的参数会传给你的程序
cargo run -- README.md`}
        output={`📊 README.md 统计报告
───────────────
行数      : 42
词数      : 318
标题      : 7
代码块    : 3`}
      />
      <Callout kind="rust" title="你刚刚用到了整门课">
        所有权与借用(<code>&str</code> 传参)、struct + derive、Result + 模式匹配处理错误、
        迭代器(<code>.lines()</code> / <code>.split_whitespace().count()</code>)、表达式返回值——
        一个真实的小工具把它们全串起来了。
      </Callout>

      <h2>第 5 步:进阶练习(自己试试)</h2>
      <ul>
        <li>用 <strong><code>clap</code></strong> crate 解析参数,支持 <code>--json</code> 输出和多文件。(<code>cargo add clap --features derive</code>)</li>
        <li>把 <code>analyze</code> 抽到 <code>src/lib.rs</code>,并写 <code>#[test]</code> 单元测试,<code>cargo test</code> 验证。</li>
        <li>统计「阅读时间」:词数 ÷ 每分钟 200 词,用浮点和 <code>format!</code> 输出。</li>
        <li>挑战:把 <code>analyze</code> 加上 <code>#[wasm_bindgen]</code>,用「WebAssembly」一章的方法编译成 Wasm,做一个网页版字数统计器。</li>
      </ul>

      <Quiz
        question="为什么 analyze 的参数用 &str(借用)而不是 String(拥有)?"
        options={[
          { text: '因为 &str 更短,少打几个字' },
          { text: '因为 analyze 只需要读取内容、不需要拥有它;借用让 main 在调用后仍能使用 text,也避免不必要的拷贝/移动', correct: true },
          { text: '因为 String 不能被遍历' },
          { text: '因为 &str 运行更快,String 是错误的写法' },
        ]}
        explain={
          <>
            「只读不占有」就用借用(<code>&str</code>/<code>&String</code>)——这正是第 5 章的核心。
            若用 <code>String</code> 当参数,<code>text</code> 的所有权会被移进函数,<code>main</code> 之后就不能再用它了。
            两种写法都能编译,但借用更符合「我只是看看」的意图,也更高效。
          </>
        }
      />

      <h2>🎓 毕业了,然后呢?</h2>
      <p>你已经走完从「为什么学」到「做出东西」的完整路径。继续精进的方向:</p>
      <ul>
        <li>📕 <strong>《The Rust Programming Language》</strong>(官方「The Book」,有中文版)——系统补全细节。</li>
        <li>🧩 <strong>Rustlings</strong>——上百道编译器驱动的小练习,边改边学。</li>
        <li>🏗️ 真实项目:用 <code>axum</code>/<code>actix</code> 写个 Web API,或用 <code>tauri</code> 做个桌面应用。</li>
        <li>🕸️ 前端方向:把团队里某个慢的纯计算模块用 Rust+Wasm 重写,做一次性能对比分享。</li>
      </ul>

      <Callout kind="rust" title="最后一句">
        Rust 的学习曲线前陡后缓:啃过所有权与借用这道坎,后面会越来越顺,
        而编译器始终是那个最严格也最靠谱的搭档。带着前端的直觉,你已经迈过了最难的一段。祝玩得开心 🦀
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        Enough theory — let's build something that actually runs. We'll write a
        command-line tool called <code>mdstat</code>: it reads a Markdown file,
        counts <strong>words, lines, headings, and code blocks</strong>, and prints
        a little report. It pulls in nearly every concept you've learned so far:
        ownership, borrowing, structs, Result, <code>?</code>, and iterators.
      </p>

      <Callout kind="tip" title="Follow along">
        Every step's code can be copied and run locally (<code>cargo run -- README.md</code>),
        or pasted into the Rust Playground (swap the file-reading step for an inline
        string) to play with the logic.
      </Callout>

      <h2>Step 0: Create the project</h2>
      <CodeBlock
        lang="bash"
        code={`cargo new mdstat
cd mdstat
# everything from here goes in src/main.rs`}
      />

      <Figure title="Program structure" caption="A clean little program: main handles args and printing, the logic is split into pure functions, and the data lives in a struct.">
        <Flow
          width={700}
          height={170}
          nodes={[
            { id: 'args', x: 10, y: 60, w: 130, label: 'read CLI args', sub: 'env::args', tone: 'info' },
            { id: 'read', x: 175, y: 60, w: 130, label: 'read the file', sub: 'fs::read_to_string ?', tone: 'rust' },
            { id: 'analyze', x: 340, y: 60, w: 130, label: 'analyze()', sub: 'iterator counting', tone: 'rust' },
            { id: 'stats', x: 505, y: 20, w: 130, label: 'Stats struct', sub: 'holds the results', tone: 'ok' },
            { id: 'print', x: 505, y: 105, w: 130, label: 'print report', sub: 'println!', tone: 'ok' },
          ]}
          edges={[
            { from: 'args', to: 'read' },
            { from: 'read', to: 'analyze' },
            { from: 'analyze', to: 'stats' },
            { from: 'analyze', to: 'print' },
          ]}
        />
      </Figure>

      <h2>Step 1: Describe the results with a struct</h2>
      <CodeBlock
        title="src/main.rs"
        code={`#[derive(Debug, Default)]   // Debug for easy printing, Default for all-zero initial values
struct Stats {
    lines: usize,
    words: usize,
    headings: usize,
    code_blocks: usize,
}`}
      />
      <p>
        <Pill>Recap</Pill> <code>#[derive(...)]</code> is from Chapter 8 — it auto-generates the <code>Debug</code> and <code>Default</code>
        implementations so you don't have to write them by hand.
      </p>

      <h2>Step 2: The core logic — counting with iterators</h2>
      <p>
        We take a <strong>borrow</strong> of the file's contents (<code>&str</code>, no
        ownership transfer — Chapter 5), walk it line by line, and accumulate based on
        simple pattern checks. Code blocks come in pairs of <code>```</code> fences, so
        we count fence lines and divide by 2:
      </p>
      <CodeBlock
        title="src/main.rs (continued)"
        code={`fn analyze(text: &str) -> Stats {
    let mut stats = Stats::default();
    let mut fence_count = 0;

    for line in text.lines() {           // .lines() returns an iterator
        stats.lines += 1;
        let trimmed = line.trim_start();

        if trimmed.starts_with("\`\`\`") {
            fence_count += 1;            // hit a \`\`\` fence
        }
        if trimmed.starts_with('#') {
            stats.headings += 1;          // Markdown heading
        }
        // split on whitespace and count (blank lines naturally yield 0)
        stats.words += line.split_whitespace().count();
    }
    stats.code_blocks = fence_count / 2;  // fences come in pairs = code blocks
    stats
}`}
      />

      <h2>Step 3: main — read args, read the file, handle errors</h2>
      <p>
        Here <code>main</code> reads the args and the file, and bails out cleanly on
        failure. When the file can't be read, the program prints a friendly error and
        exits with a non-zero code, instead of dumping a stack trace in your face:
      </p>
      <CodeBlock
        title="src/main.rs (continued)"
        code={`use std::fs;
use std::process;

fn main() {
    // skip arg 0 (the program name), take arg 1: the file path
    let path = match std::env::args().nth(1) {
        Some(p) => p,
        None => {
            eprintln!("usage: mdstat <file.md>");
            process::exit(1);
        }
    };

    // read the file; on failure, report nicely and exit
    let text = match fs::read_to_string(&path) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("failed to read '{path}': {e}");
            process::exit(1);
        }
    };

    let stats = analyze(&text);   // borrow text for analyze

    println!("📊 Report for {path}");
    println!("───────────────");
    println!("Lines       : {}", stats.lines);
    println!("Words       : {}", stats.words);
    println!("Headings    : {}", stats.headings);
    println!("Code blocks : {}", stats.code_blocks);
}`}
      />

      <h2>Step 4: Run it!</h2>
      <CodeBlock
        lang="bash"
        title="terminal"
        code={`# args after -- are passed through to your program
cargo run -- README.md`}
        output={`📊 Report for README.md
───────────────
Lines       : 42
Words       : 318
Headings    : 7
Code blocks : 3`}
      />
      <Callout kind="rust" title="You just used the whole course">
        Ownership and borrowing (passing <code>&str</code>), struct + derive, Result +
        pattern matching for error handling, iterators (<code>.lines()</code> /{' '}
        <code>.split_whitespace().count()</code>), expression-based return values — one
        real little tool ties them all together.
      </Callout>

      <h2>Step 5: Going further (try it yourself)</h2>
      <ul>
        <li>Parse args with the <strong><code>clap</code></strong> crate to support <code>--json</code> output and multiple files. (<code>cargo add clap --features derive</code>)</li>
        <li>Extract <code>analyze</code> into <code>src/lib.rs</code>, write a <code>#[test]</code> unit test, and verify with <code>cargo test</code>.</li>
        <li>Add a "reading time" stat: words ÷ 200 words per minute, output as a float with <code>format!</code>.</li>
        <li>Challenge: add <code>#[wasm_bindgen]</code> to <code>analyze</code>, compile it to Wasm using the approach from the "WebAssembly" chapter, and build a web-based word counter.</li>
      </ul>

      <Quiz
        question="Why does analyze take &str (a borrow) instead of String (owned)?"
        options={[
          { text: 'Because &str is shorter and saves a few keystrokes' },
          { text: "Because analyze only needs to read the contents, not own them; borrowing lets main keep using text after the call and avoids an unnecessary copy/move", correct: true },
          { text: 'Because a String cannot be iterated over' },
          { text: 'Because &str runs faster and String is simply wrong here' },
        ]}
        explain={
          <>
            "Read-only, no ownership" calls for a borrow (<code>&str</code>/<code>&String</code>) —
            exactly the heart of Chapter 5. If you took a <code>String</code> parameter,
            <code>text</code>'s ownership would move into the function, and <code>main</code>{' '}
            couldn't use it afterward. Both versions compile, but borrowing better matches the
            "I'm just looking" intent — and it's more efficient.
          </>
        }
      />

      <h2>🎓 You've graduated — now what?</h2>
      <p>You've walked the full path from "why learn it" to "building something." Directions to keep leveling up:</p>
      <ul>
        <li>📕 <strong>The Rust Programming Language</strong> (the official "The Book") — fill in the details systematically.</li>
        <li>🧩 <strong>Rustlings</strong> — hundreds of compiler-driven mini-exercises you learn by fixing.</li>
        <li>🏗️ Real projects: build a web API with <code>axum</code>/<code>actix</code>, or a desktop app with <code>tauri</code>.</li>
        <li>🕸️ Frontend angle: rewrite a slow pure-compute module from your team in Rust + Wasm, and share a before/after benchmark.</li>
      </ul>

      <Callout kind="rust" title="One last thing">
        Rust's learning curve is steep up front and gentle after: once you've climbed the
        ownership-and-borrowing hill, everything downstream gets smoother — and the compiler
        stays your strictest, most reliable partner. With your frontend intuition, you've
        already cleared the hardest stretch. Have fun out there 🦀
      </Callout>
    </>
  )
}
