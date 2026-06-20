import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'
import Flow from '../../components/viz/Flow'
import { useLang } from '../../i18n/lang'

export default function ErrorHandling() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        在 JS 里,函数可能抛异常,但<strong>类型签名看不出来</strong>——你不读文档/源码,根本不知道
        <code>JSON.parse</code> 会扔。Rust 反过来:<strong>错误是普通的返回值</strong>,写在类型里,
        编译器逼你处理。这一章你会发现「错误处理」可以既严谨又优雅。
      </p>

      <h2>两类错误:能恢复 vs 不能恢复</h2>
      <ul>
        <li><strong>可恢复错误</strong>(文件不存在、网络超时、解析失败)→ 返回 <code>Result&lt;T, E&gt;</code>,让调用者决定怎么办。</li>
        <li><strong>不可恢复错误</strong>(数组越界、断言失败这种「程序写错了」)→ <code>panic!</code>,直接终止。类比 JS 里你不会去 catch 的那种逻辑 bug。</li>
      </ul>

      <KeyTerm term="Result:错误是一个值" en="Result<T, E>" analogy="把 try/catch 的「成功路径」和「失败路径」合并成一个返回值,调用方必须显式处理。">
        <code>Result</code> 也是个枚举,两个变体:
        <CodeBlock code={`enum Result<T, E> {
    Ok(T),    // 成功,带着结果 T
    Err(E),   // 失败,带着错误 E
}`} />
        函数返回 <code>Result</code> 就等于在类型上宣告「我可能失败」,调用者不处理就编译不过。
      </KeyTerm>

      <h2>对比:try/catch vs Result</h2>
      <Compare
        js={`function parse(s) {
  // 签名看不出会不会抛
  return JSON.parse(s);
}
try {
  const data = parse(input);
  use(data);
} catch (e) {
  console.error("失败了", e);
}`}
        rust={`fn parse(s: &str) -> Result<Data, Error> {
    // 类型直接写明:可能 Err
    serde_json::from_str(s)
}
match parse(input) {
    Ok(data) => use_data(data),
    Err(e) => eprintln!("失败了 {e}"),
}`}
        note="JS 的异常是「隐式控制流」,可能从任意深处冒出来;Rust 把失败变成显式的值,流程一目了然,也不会忘记处理。"
      />

      <h2>? 运算符:错误处理的「自动挡」</h2>
      <p>
        如果每一步都写 <code>match</code> 来传播错误,会很冗长。Rust 提供 <code>?</code>:
        <strong>成功就解包继续,失败就提前 return 这个错误</strong>。一个符号顶一段样板代码:
      </p>
      <Compare
        js={`async function load() {
  // 手动 try/catch 或让它向上冒泡
  const res = await fetch(url);
  const text = await res.text();
  const data = JSON.parse(text);
  return data;
}`}
        rust={`fn load() -> Result<Data, Error> {
    let text = read_file("data.json")?; // 失败就 return Err
    let data = parse(&text)?;           // 失败就 return Err
    Ok(data)                            // 全成功才到这
}`}
        note="每个 ? 都是一个「成功则继续、失败则短路返回」的检查点。比 JS 的 try/catch 更细粒度,且不会漏掉任何一步。"
      />

      <Figure title="? 运算符的控制流" caption="? 把「成功解包 / 失败提前返回」这套逻辑压缩成一个字符,链式调用时尤其清爽。">
        <Flow
          width={680}
          height={170}
          nodes={[
            { id: 'call', x: 20, y: 60, w: 130, label: 'foo()?', sub: '调用并解包', tone: 'rust' },
            { id: 'check', x: 200, y: 55, w: 120, h: 60, label: 'Ok 还是 Err?', tone: 'info', shape: 'diamond' },
            { id: 'ok', x: 380, y: 20, w: 150, label: '取出 Ok 里的值', sub: '继续往下执行', tone: 'ok' },
            { id: 'err', x: 380, y: 105, w: 180, label: 'return Err(e)', sub: '立即退出当前函数', tone: 'warn' },
          ]}
          edges={[
            { from: 'call', to: 'check' },
            { from: 'check', to: 'ok', label: 'Ok' },
            { from: 'check', to: 'err', label: 'Err' },
          ]}
        />
      </Figure>

      <h2>unwrap / expect:方便但危险</h2>
      <p>
        你会在很多示例里看到 <code>.unwrap()</code>:它「赌这次一定成功」,成功就取值,
        失败就 <code>panic</code> 崩溃。适合写原型/demo,<strong>生产代码慎用</strong>:
      </p>
      <CodeBlock
        code={`let n: i32 = "42".parse().unwrap();        // 成功,n = 42
let bad: i32 = "abc".parse().unwrap();     // 💥 panic!程序崩溃

// expect 一样会崩,但能附带说明,排查更友好
let port: u16 = env_var.parse()
    .expect("PORT 必须是数字");

// 更稳妥:用 ? 传播,或 match / unwrap_or 给默认值
let count: i32 = input.parse().unwrap_or(0); // 失败就用 0`}
      />
      <Callout kind="danger" title="unwrap 是「未处理的炸弹」">
        每个 <code>unwrap()</code> 都是一个潜在的崩溃点,相当于 JS 里「确信不会出错」而裸调用。
        Code review 时看到生产代码里的 <code>unwrap</code> 要警觉——优先用 <code>?</code>、
        <code>unwrap_or</code>、<code>match</code> 妥善处理。
      </Callout>

      <h2>Option vs Result:什么时候用哪个?</h2>
      <Callout kind="rust">
        <strong>Option&lt;T&gt;</strong> 表达「<strong>可能没有</strong>」(没有额外原因,如查找未命中);
        <strong>Result&lt;T, E&gt;</strong> 表达「<strong>可能失败,且失败有原因 E</strong>」(如解析错误、IO 错误)。
        两者都能用 <code>?</code> 传播,都能 <code>match</code> 解包。
      </Callout>

      <Quiz
        question="函数里写 let data = fetch(url)?; 这个 ? 的作用是?"
        options={[
          { text: '如果 fetch 返回 Ok,取出里面的值赋给 data;如果返回 Err,立即让当前函数返回那个 Err', correct: true },
          { text: '把 fetch 变成异步调用' },
          { text: '忽略 fetch 的错误,继续执行' },
          { text: '如果出错就 panic 崩溃' },
        ]}
        explain={
          <>
            <code>?</code> 是「成功解包 / 失败短路返回」的语法糖,既不忽略错误也不崩溃,而是把错误
            <strong>向上传播</strong>给调用者。要用 <code>?</code>,当前函数的返回类型也得是 <code>Result</code>(或 <code>Option</code>)。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="把 unwrap 改成 Result + ?"
        minutes={8}
        goal={
          <>
            下面的 <code>parse_sum</code> 用了两个 <code>unwrap()</code>,遇到非数字就 panic。把它改成返回
            <code>Result</code> 并用 <code>?</code> 传播错误,让 <code>main</code> 能<strong>优雅地</strong>分别处理
            成功与失败两种输入(而不是崩溃)。
          </>
        }
        starter={`fn parse_sum(a: &str, b: &str) -> i32 {
    a.parse::<i32>().unwrap() + b.parse::<i32>().unwrap()
}

fn main() {
    println!("和 = {}", parse_sum("3", "5"));
    println!("和 = {}", parse_sum("3", "x")); // 这一行现在会 panic
}`}
        hint={
          <>
            ① 把返回类型改成 <code>Result&lt;i32, std::num::ParseIntError&gt;</code>;
            ② 把两个 <code>.unwrap()</code> 换成 <code>?</code>;③ 函数最后用 <code>Ok(...)</code> 包住结果;
            ④ <code>main</code> 里用 <code>match</code> 分别处理 <code>Ok</code> / <code>Err</code>。
          </>
        }
        solution={`fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {
    Ok(a.parse::<i32>()? + b.parse::<i32>()?)
}

fn main() {
    for (a, b) in [("3", "5"), ("3", "x")] {
        match parse_sum(a, b) {
            Ok(n) => println!("和 = {n}"),
            Err(e) => println!("解析失败: {e}"),
        }
    }
}`}
        expectedOutput={`和 = 8
解析失败: invalid digit found in string`}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 错误是值(<code>Result</code>),写在类型里;② <code>?</code> 优雅地传播错误;③ <code>unwrap</code> 方便但会崩,生产慎用;
        ④ Option 管「空」、Result 管「错」。接下来进入抽象的世界:trait 与泛型,看 Rust 如何做「零成本」的接口与复用。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        In JS, a function might throw — but <strong>you can't tell from the type signature</strong>. Unless you read
        the docs or the source, you'd never know that <code>JSON.parse</code> can throw. Rust flips this around:
        <strong>errors are ordinary return values</strong>, written right into the type, and the compiler forces you to
        handle them. By the end of this chapter you'll see that "error handling" can be both rigorous and elegant.
      </p>

      <h2>Two kinds of errors: recoverable vs unrecoverable</h2>
      <ul>
        <li><strong>Recoverable errors</strong> (file not found, network timeout, parse failure) → return <code>Result&lt;T, E&gt;</code> and let the caller decide what to do.</li>
        <li><strong>Unrecoverable errors</strong> (array out of bounds, a failed assertion — "the program is just plain wrong") → <code>panic!</code> and terminate immediately. Think of the kind of logic bug in JS you'd never bother to catch.</li>
      </ul>

      <KeyTerm term="Result: an error is a value" en="Result<T, E>" analogy="It merges the try/catch 'success path' and 'failure path' into a single return value that the caller must handle explicitly.">
        <code>Result</code> is also an enum, with two variants:
        <CodeBlock code={`enum Result<T, E> {
    Ok(T),    // success, carrying the result T
    Err(E),   // failure, carrying the error E
}`} />
        A function that returns <code>Result</code> is declaring "I might fail" right in its type — and if the caller doesn't handle it, the code won't compile.
      </KeyTerm>

      <h2>Side by side: try/catch vs Result</h2>
      <Compare
        js={`function parse(s) {
  // the signature gives no hint that this can throw
  return JSON.parse(s);
}
try {
  const data = parse(input);
  use(data);
} catch (e) {
  console.error("failed", e);
}`}
        rust={`fn parse(s: &str) -> Result<Data, Error> {
    // the type says it outright: this might be Err
    serde_json::from_str(s)
}
match parse(input) {
    Ok(data) => use_data(data),
    Err(e) => eprintln!("failed {e}"),
}`}
        note="JS exceptions are 'implicit control flow' — they can bubble up from anywhere deep in the call stack. Rust turns failure into an explicit value, so the flow is obvious and you can't accidentally forget to handle it."
      />

      <h2>The ? operator: the "automatic transmission" of error handling</h2>
      <p>
        Writing a <code>match</code> at every step to propagate errors gets verbose fast. Rust gives you <code>?</code>:
        <strong>on success it unwraps and continues; on failure it returns that error early</strong>. One symbol
        replaces a chunk of boilerplate:
      </p>
      <Compare
        js={`async function load() {
  // either try/catch manually, or let it bubble up
  const res = await fetch(url);
  const text = await res.text();
  const data = JSON.parse(text);
  return data;
}`}
        rust={`fn load() -> Result<Data, Error> {
    let text = read_file("data.json")?; // on failure, return Err
    let data = parse(&text)?;           // on failure, return Err
    Ok(data)                            // only reached if all succeed
}`}
        note="Every ? is a checkpoint that 'continues on success, short-circuits and returns on failure'. It's finer-grained than JS's try/catch, and you can't miss a single step."
      />

      <Figure title="Control flow of the ? operator" caption="? compresses the 'unwrap on success / return early on failure' logic into a single character — especially clean when you chain calls.">
        <Flow
          width={680}
          height={170}
          nodes={[
            { id: 'call', x: 20, y: 60, w: 130, label: 'foo()?', sub: 'call and unwrap', tone: 'rust' },
            { id: 'check', x: 200, y: 55, w: 120, h: 60, label: 'Ok or Err?', tone: 'info', shape: 'diamond' },
            { id: 'ok', x: 380, y: 20, w: 150, label: 'take the Ok value', sub: 'keep going', tone: 'ok' },
            { id: 'err', x: 380, y: 105, w: 180, label: 'return Err(e)', sub: 'exit the function now', tone: 'warn' },
          ]}
          edges={[
            { from: 'call', to: 'check' },
            { from: 'check', to: 'ok', label: 'Ok' },
            { from: 'check', to: 'err', label: 'Err' },
          ]}
        />
      </Figure>

      <h2>unwrap / expect: handy but dangerous</h2>
      <p>
        You'll see <code>.unwrap()</code> in plenty of examples: it "bets that this one succeeds" — on success it
        takes the value, on failure it <code>panic</code>s and crashes. Fine for prototypes and demos, but
        <strong>use it with care in production code</strong>:
      </p>
      <CodeBlock
        code={`let n: i32 = "42".parse().unwrap();        // success, n = 42
let bad: i32 = "abc".parse().unwrap();     // 💥 panic! the program crashes

// expect crashes too, but lets you attach a message — friendlier to debug
let port: u16 = env_var.parse()
    .expect("PORT must be a number");

// safer: propagate with ?, or use match / unwrap_or for a default
let count: i32 = input.parse().unwrap_or(0); // on failure, fall back to 0`}
      />
      <Callout kind="danger" title="unwrap is an 'unhandled bomb'">
        Every <code>unwrap()</code> is a potential crash site — the equivalent of calling something bare in JS because
        you're "sure it can't go wrong". When you spot an <code>unwrap</code> in production code during review, raise an
        eyebrow — prefer handling it properly with <code>?</code>, <code>unwrap_or</code>, or <code>match</code>.
      </Callout>

      <h2>Option vs Result: when to use which?</h2>
      <Callout kind="rust">
        <strong>Option&lt;T&gt;</strong> expresses "<strong>maybe nothing</strong>" (no extra reason — e.g. a lookup
        that missed); <strong>Result&lt;T, E&gt;</strong> expresses "<strong>maybe a failure, with a reason E</strong>"
        (e.g. a parse error or IO error). Both can be propagated with <code>?</code>, and both can be unwrapped with
        <code>match</code>.
      </Callout>

      <Quiz
        question="In a function, what does the ? in let data = fetch(url)?; do?"
        options={[
          { text: 'If fetch returns Ok, take the inner value and bind it to data; if it returns Err, immediately make the current function return that Err', correct: true },
          { text: 'It turns fetch into an async call' },
          { text: 'It ignores fetch\'s error and keeps going' },
          { text: 'It panics and crashes if there is an error' },
        ]}
        explain={
          <>
            <code>?</code> is syntactic sugar for "unwrap on success / short-circuit return on failure" — it neither
            ignores the error nor crashes; instead it <strong>propagates</strong> the error up to the caller. To use
            <code>?</code>, the current function's return type also has to be a <code>Result</code> (or <code>Option</code>).
          </>
        }
      />

      <h2>Hands-on exercise</h2>
      <MicroLab
        title="Turn unwrap into Result + ?"
        minutes={8}
        goal={
          <>
            The <code>parse_sum</code> below uses two <code>unwrap()</code> calls and panics on non-numeric input.
            Rewrite it to return a <code>Result</code> and propagate errors with <code>?</code>, so that <code>main</code>
            can handle the two kinds of input — success and failure — <strong>gracefully</strong> instead of crashing.
          </>
        }
        starter={`fn parse_sum(a: &str, b: &str) -> i32 {
    a.parse::<i32>().unwrap() + b.parse::<i32>().unwrap()
}

fn main() {
    println!("sum = {}", parse_sum("3", "5"));
    println!("sum = {}", parse_sum("3", "x")); // this line panics right now
}`}
        hint={
          <>
            ① Change the return type to <code>Result&lt;i32, std::num::ParseIntError&gt;</code>;
            ② replace the two <code>.unwrap()</code> with <code>?</code>; ③ wrap the result in <code>Ok(...)</code> at the
            end of the function; ④ in <code>main</code>, use <code>match</code> to handle <code>Ok</code> / <code>Err</code> separately.
          </>
        }
        solution={`fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {
    Ok(a.parse::<i32>()? + b.parse::<i32>()?)
}

fn main() {
    for (a, b) in [("3", "5"), ("3", "x")] {
        match parse_sum(a, b) {
            Ok(n) => println!("sum = {n}"),
            Err(e) => println!("parse failed: {e}"),
        }
    }
}`}
        expectedOutput={`sum = 8
parse failed: invalid digit found in string`}
      />

      <Callout kind="info" title="Key takeaways & what's next">
        ① Errors are values (<code>Result</code>), written into the type; ② <code>?</code> propagates errors elegantly;
        ③ <code>unwrap</code> is convenient but crashes — use it sparingly in production; ④ Option handles "empty",
        Result handles "error". Next we enter the world of abstraction: traits and generics, and how Rust builds
        "zero-cost" interfaces and reuse.
      </Callout>
    </>
  )
}
