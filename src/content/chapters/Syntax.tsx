import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'
import { useLang } from '../../i18n/lang'

export default function Syntax() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        这一章是「认字」环节。好消息是 Rust 受 C/JS 家族影响,大括号、分号、运算符你都认识。
        我们只聚焦<strong>和 JS/TS 不一样、容易踩坑</strong>的地方,其余一带而过。
      </p>

      <h2>变量:默认不可变</h2>
      <p>
        这是 Rust 第一个反直觉的点:<code>let</code> 声明的变量<strong>默认是只读的</strong>,
        想改必须加 <code>mut</code>。相当于 JS 里<strong>默认 <code>const</code>,要可变才用 <code>let</code></strong>。
      </p>
      <Compare
        js={`let count = 0;     // 可变
count = 1;         // ✅ ok
const MAX = 100;   // 不可变`}
        rust={`let count = 0;     // 默认不可变!
count = 1;         // ❌ 编译错误
let mut n = 0;     // 加 mut 才能改
n = 1;             // ✅ ok
const MAX: i32 = 100;  // 编译期常量`}
        note="默认不可变是一种安全设计:绝大多数变量其实不需要改,编译器帮你确保没有意外的再赋值。"
      />

      <KeyTerm term="变量遮蔽" en="shadowing" analogy="JS 里同名 const 在嵌套作用域会报错,Rust 允许同名重新声明,常用来「变形」。">
        用 <code>let</code> 重新声明同名变量会「遮蔽」旧的,甚至可以换类型。常见于解析输入:
        <CodeBlock code={`let spaces = "   ";          // 这里是 &str
let spaces = spaces.len();   // 遮蔽成 usize(数字)
// 不需要 spaces_str / spaces_len 两个名字`} />
      </KeyTerm>

      <h2>类型:像 TS,但更较真</h2>
      <p>
        Rust 能<strong>推断</strong>大部分类型(像 TS),但类型系统更严格:数字分大小和有无符号,
        而且<strong>不会隐式转换</strong>(<code>i32</code> 和 <code>i64</code> 相加都要你显式转)。
      </p>
      <CodeBlock
        runnable
        title="标量类型"
        code={`fn main() {
    let a: i32 = -42;       // 有符号 32 位整数(默认整数类型)
    let b: u8 = 255;        // 无符号 8 位(0~255)
    let c: f64 = 3.14;      // 64 位浮点(默认浮点类型)
    let flag: bool = true;
    let letter: char = '🦀'; // char 是 4 字节 Unicode,单引号!

    // 没有隐式转换,要用 as 显式转
    let sum = a as i64 + 1000;
    println!("{a} {b} {c} {flag} {letter} {sum}");
}`}
        output={`-42 255 3.14 true 🦀 958`}
      />
      <Callout kind="warn" title="i32 vs number">
        JS 只有一个 <code>number</code>(双精度浮点),Rust 有 <code>i8/i16/i32/i64/i128</code>、
        对应的无符号 <code>u*</code>,以及 <code>f32/f64</code>。整数溢出在 debug 构建会 panic,在 release
        会回绕——别指望它像 JS 那样默默变成 <code>Infinity</code>。
      </Callout>

      <h3>两种「字符串」</h3>
      <p>这是新手最大的困惑点,先建立直觉(细节留到所有权章):</p>
      <ul>
        <li><code>&str</code> —— 字符串<strong>切片/引用</strong>,只读、固定。字面量 <code>"hi"</code> 就是它。类比 JS 里一个不可变的字符串常量。</li>
        <li><code>String</code> —— 堆上分配、<strong>可增长</strong>的字符串。需要拼接、修改时用它。类比 JS 里你会 push 的那种可变字符串。</li>
      </ul>
      <CodeBlock
        code={`let s1: &str = "hello";                  // 切片,指向只读数据
let mut s2: String = String::from("hello"); // 拥有所有权,可变
s2.push_str(", world");                  // 追加
let s3: &str = &s2;                       // 可以从 String 借出 &str`}
      />

      <h3>元组与数组</h3>
      <Compare
        js={`// 数组:长度可变、可混类型(松散)
const arr = [1, 2, 3];
arr.push(4);

// 没有真正的元组,用数组凑
const point = [3, 4];`}
        rust={`// 数组:定长、同类型
let arr: [i32; 3] = [1, 2, 3];
// arr.push() —— 没有!定长。要增长用 Vec<i32>

// 元组:定长、可混类型
let point: (i32, i32) = (3, 4);
let (x, y) = point;       // 解构,和 JS 一样
println!("{}", point.0);  // 按位置访问用 .0 .1`}
        note="需要「可 push 的数组」时用 Vec<T>(动态数组),它才对应 JS 的 Array。「集合与迭代器」一章细讲。"
      />

      <h2>函数:最后一行就是返回值</h2>
      <p>
        Rust 是<strong>表达式语言</strong>:函数体最后一个表达式(<strong>不加分号</strong>)就是返回值,
        不用写 <code>return</code>。参数和返回值<strong>必须</strong>标类型(不像 TS 可省)。
      </p>
      <Compare
        js={`function add(a, b) {
  return a + b;
}

const square = x => x * x;`}
        rust={`fn add(a: i32, b: i32) -> i32 {
    a + b          // 没有分号 = 返回它
}

// 闭包(箭头函数的对应物)
let square = |x: i32| x * x;`}
        note="加了分号 a + b; 就变成「语句」,函数会返回 ()(空,类似 void),类型对不上就报错——这是高频新手坑。"
      />

      <Callout kind="rust" title="一切皆表达式">
        连 <code>if</code> 都能返回值。这让代码更紧凑,也少了很多临时变量。
      </Callout>

      <h2>控制流:if 是表达式,match 是主角</h2>
      <Compare
        js={`// 三元运算符
const label = n > 0 ? "正" : "负";

// switch
switch (status) {
  case 200: msg = "ok"; break;
  case 404: msg = "未找到"; break;
  default: msg = "其它";
}`}
        rust={`// if 直接当表达式用,不需要三元
let label = if n > 0 { "正" } else { "负" };

// match:比 switch 强大太多,且必须穷尽所有情况
let msg = match status {
    200 => "ok",
    404 => "未找到",
    _ => "其它",     // _ 是「其余」,漏了分支编译不过
};`}
        note="match 强制穷尽(exhaustive):少处理一种情况,编译器直接拒绝。这正是它比 switch 安全的地方。"
      />

      <h3>循环:for / while / loop</h3>
      <CodeBlock
        runnable
        title="三种循环"
        code={`fn main() {
    // for 遍历区间(0..5 不含 5,0..=5 含 5)
    for i in 0..5 {
        print!("{i} ");
    }
    println!();

    // 遍历集合(像 for...of)
    let langs = ["JS", "TS", "Rust"];
    for lang in langs {
        print!("{lang} ");
    }
    println!();

    // loop 是无限循环,还能 break 出一个值!
    let mut n = 1;
    let first_over_100 = loop {
        n *= 2;
        if n > 100 { break n; }  // break 带值返回
    };
    println!("\\n第一个超过 100 的 2 的幂: {first_over_100}");
}`}
        output={`0 1 2 3 4
JS TS Rust

第一个超过 100 的 2 的幂: 128`}
      />

      <h2>那个 <code>!</code> 是什么:宏 vs 函数</h2>
      <p>
        <code>println!</code>、<code>vec!</code>、<code>format!</code> 后面的 <code>!</code> 表示它们是
        <strong>宏(macro)</strong>而不是普通函数。宏在编译期展开成代码,能做函数做不到的事——比如
        <code>println!</code> 在编译期检查你的格式字符串和参数对不对。现在你只需记住:
        <strong>带 <code>!</code> 的是宏,照着用即可</strong>。
      </p>
      <CodeBlock
        code={`println!("普通打印,带换行");
print!("不带换行");
let v = vec![1, 2, 3];              // 用宏快速建 Vec
let s = format!("{}-{}", "a", "b"); // 像 println 但返回 String 而不打印
eprintln!("打印到 stderr");`}
      />

      <Quiz
        question="下面这个函数能通过编译吗?为什么?"
        options={[
          { text: '能,返回 8' },
          { text: '不能,因为 a + b; 带了分号,变成语句,函数实际返回 ()(空),和声明的 -> i32 对不上', correct: true },
          { text: '不能,因为缺少 return 关键字' },
          { text: '能,但有警告' },
        ]}
        explain={
          <>
            <CodeBlock code={`fn add(a: i32, b: i32) -> i32 {
    a + b;   // ← 这个分号是关键
}`} />
            分号把表达式变成语句,函数体最后没有「值表达式」,默认返回单元类型 <code>()</code>。
            去掉分号就对了。这是 Rust 新手最常见的报错之一。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="让函数真正返回值"
        minutes={5}
        goal={
          <>
            下面的 <code>add</code> 本该返回两数之和,但编译报错(返回了 <code>()</code> 而不是
            <code>i32</code>)。<strong>只改一个字符</strong>就能修好,让它打印 <code>8</code>。点「▶ 运行」验证。
          </>
        }
        starter={`fn add(a: i32, b: i32) -> i32 {
    a + b;
}

fn main() {
    println!("{}", add(3, 5));
}`}
        hint={
          <>
            注意函数体最后一行结尾的<strong>分号</strong>。加了分号,<code>a + b</code> 就从「表达式」变成「语句」,
            函数最后没有返回值,默认返回 <code>()</code>。
          </>
        }
        solution={`fn add(a: i32, b: i32) -> i32 {
    a + b      // 去掉分号:这一行的值就是返回值
}

fn main() {
    println!("{}", add(3, 5));
}`}
        expectedOutput={`8`}
      />

      <Callout kind="info" title="小结 & 下一步">
        你已经能读懂大部分 Rust 代码了。但 Rust 真正独特的地方还没登场——
        <strong>所有权(ownership)</strong>。下一章我们用动画把它彻底讲清楚,这是理解 Rust 的分水岭。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        This chapter is the "learn to read" stage. The good news: Rust is part of the C/JS family,
        so the braces, semicolons, and operators are all familiar. We'll focus only on the things
        that are <strong>different from JS/TS and easy to trip over</strong>, and breeze past the rest.
      </p>

      <h2>Variables: immutable by default</h2>
      <p>
        Here's Rust's first counterintuitive point: a variable declared with <code>let</code> is
        <strong> read-only by default</strong>, and you must add <code>mut</code> to change it.
        It's like JS where <strong>everything is <code>const</code> by default, and you'd only reach for <code>let</code> when you need to mutate</strong>.
      </p>
      <Compare
        js={`let count = 0;     // mutable
count = 1;         // ✅ ok
const MAX = 100;   // immutable`}
        rust={`let count = 0;     // immutable by default!
count = 1;         // ❌ compile error
let mut n = 0;     // add mut to allow changes
n = 1;             // ✅ ok
const MAX: i32 = 100;  // compile-time constant`}
        note="Immutable-by-default is a safety choice: most variables never actually need to change, and the compiler guarantees there are no accidental reassignments."
      />

      <KeyTerm term="Shadowing" en="shadowing" analogy="In JS, redeclaring a const with the same name in a nested scope errors; Rust lets you redeclare the same name, often used to 'transform' a value.">
        Redeclaring a variable of the same name with <code>let</code> "shadows" the old one, and can even change its type. Common when parsing input:
        <CodeBlock code={`let spaces = "   ";          // this is &str
let spaces = spaces.len();   // shadowed into usize (a number)
// no need for two names like spaces_str / spaces_len`} />
      </KeyTerm>

      <h2>Types: like TS, but pickier</h2>
      <p>
        Rust can <strong>infer</strong> most types (like TS), but the type system is stricter: numbers
        come in different sizes and signed/unsigned variants, and there's <strong>no implicit conversion</strong>
        (adding an <code>i32</code> and an <code>i64</code> requires an explicit cast).
      </p>
      <CodeBlock
        runnable
        title="Scalar types"
        code={`fn main() {
    let a: i32 = -42;       // signed 32-bit integer (default integer type)
    let b: u8 = 255;        // unsigned 8-bit (0~255)
    let c: f64 = 3.14;      // 64-bit float (default float type)
    let flag: bool = true;
    let letter: char = '🦀'; // char is a 4-byte Unicode scalar, single quotes!

    // no implicit conversion, use 'as' to cast explicitly
    let sum = a as i64 + 1000;
    println!("{a} {b} {c} {flag} {letter} {sum}");
}`}
        output={`-42 255 3.14 true 🦀 958`}
      />
      <Callout kind="warn" title="i32 vs number">
        JS has a single <code>number</code> (double-precision float); Rust has <code>i8/i16/i32/i64/i128</code>,
        the matching unsigned <code>u*</code>, plus <code>f32/f64</code>. Integer overflow panics in debug builds
        and wraps around in release builds — don't expect it to silently become <code>Infinity</code> like JS does.
      </Callout>

      <h3>Two kinds of "string"</h3>
      <p>This is the biggest source of confusion for beginners. Let's build the intuition first (details come in the ownership chapter):</p>
      <ul>
        <li><code>&str</code> — a string <strong>slice/reference</strong>: read-only and fixed. A literal like <code>"hi"</code> is one. Think of an immutable string constant in JS.</li>
        <li><code>String</code> — a heap-allocated, <strong>growable</strong> string. Use it when you need to concatenate or modify. Think of the kind of mutable string you'd push onto in JS.</li>
      </ul>
      <CodeBlock
        code={`let s1: &str = "hello";                  // a slice pointing at read-only data
let mut s2: String = String::from("hello"); // owns its data, mutable
s2.push_str(", world");                  // append
let s3: &str = &s2;                       // you can borrow a &str from a String`}
      />

      <h3>Tuples and arrays</h3>
      <Compare
        js={`// array: variable length, mixed types (loose)
const arr = [1, 2, 3];
arr.push(4);

// no real tuple, you fake it with an array
const point = [3, 4];`}
        rust={`// array: fixed length, same type
let arr: [i32; 3] = [1, 2, 3];
// arr.push() — nope! fixed length. Use Vec<i32> to grow

// tuple: fixed length, mixed types
let point: (i32, i32) = (3, 4);
let (x, y) = point;       // destructuring, just like JS
println!("{}", point.0);  // access by position with .0 .1`}
        note="When you need a 'pushable array', use Vec<T> (a dynamic array) — that's what maps to JS's Array. The 'Collections & Iterators' chapter covers it in detail."
      />

      <h2>Functions: the last line is the return value</h2>
      <p>
        Rust is an <strong>expression language</strong>: the last expression in a function body
        (<strong>with no semicolon</strong>) is the return value — no <code>return</code> needed.
        Parameters and return values <strong>must</strong> be typed (unlike TS, where you can omit them).
      </p>
      <Compare
        js={`function add(a, b) {
  return a + b;
}

const square = x => x * x;`}
        rust={`fn add(a: i32, b: i32) -> i32 {
    a + b          // no semicolon = return it
}

// closure (the equivalent of an arrow function)
let square = |x: i32| x * x;`}
        note="Add a semicolon — a + b; — and it becomes a 'statement', so the function returns () (unit, like void). The types won't match and you'll get an error — a very common beginner trap."
      />

      <Callout kind="rust" title="Everything is an expression">
        Even <code>if</code> returns a value. This keeps code compact and cuts down on temporary variables.
      </Callout>

      <h2>Control flow: if is an expression, match is the star</h2>
      <Compare
        js={`// ternary operator
const label = n > 0 ? "positive" : "negative";

// switch
switch (status) {
  case 200: msg = "ok"; break;
  case 404: msg = "not found"; break;
  default: msg = "other";
}`}
        rust={`// if is used directly as an expression, no ternary needed
let label = if n > 0 { "positive" } else { "negative" };

// match: far more powerful than switch, and must be exhaustive
let msg = match status {
    200 => "ok",
    404 => "not found",
    _ => "other",     // _ is the 'rest'; miss a branch and it won't compile
};`}
        note="match forces exhaustiveness: leave one case unhandled and the compiler flat-out rejects it. That's exactly what makes it safer than switch."
      />

      <h3>Loops: for / while / loop</h3>
      <CodeBlock
        runnable
        title="Three kinds of loop"
        code={`fn main() {
    // for over a range (0..5 excludes 5, 0..=5 includes 5)
    for i in 0..5 {
        print!("{i} ");
    }
    println!();

    // iterate a collection (like for...of)
    let langs = ["JS", "TS", "Rust"];
    for lang in langs {
        print!("{lang} ");
    }
    println!();

    // loop is an infinite loop, and it can break out with a value!
    let mut n = 1;
    let first_over_100 = loop {
        n *= 2;
        if n > 100 { break n; }  // break returns a value
    };
    println!("\\nFirst power of 2 over 100: {first_over_100}");
}`}
        output={`0 1 2 3 4
JS TS Rust

First power of 2 over 100: 128`}
      />

      <h2>What's that <code>!</code>: macros vs functions</h2>
      <p>
        The <code>!</code> after <code>println!</code>, <code>vec!</code>, and <code>format!</code> means they're
        <strong> macros</strong>, not ordinary functions. Macros expand into code at compile time and can do
        things functions can't — for example, <code>println!</code> checks at compile time that your format string
        and arguments line up. For now, just remember:
        <strong> anything with a <code>!</code> is a macro; use it as shown</strong>.
      </p>
      <CodeBlock
        code={`println!("normal print, with a newline");
print!("no newline");
let v = vec![1, 2, 3];              // quickly build a Vec with a macro
let s = format!("{}-{}", "a", "b"); // like println but returns a String instead of printing
eprintln!("print to stderr");`}
      />

      <Quiz
        question="Will the following function compile? Why?"
        options={[
          { text: 'Yes, it returns 8' },
          { text: "No — a + b; has a semicolon, making it a statement, so the function actually returns () (unit), which doesn't match the declared -> i32", correct: true },
          { text: 'No, because it is missing the return keyword' },
          { text: 'Yes, but with a warning' },
        ]}
        explain={
          <>
            <CodeBlock code={`fn add(a: i32, b: i32) -> i32 {
    a + b;   // ← this semicolon is the key
}`} />
            The semicolon turns the expression into a statement, so the function body ends without a "value
            expression" and defaults to returning the unit type <code>()</code>. Drop the semicolon and it's fixed.
            This is one of the most common errors Rust beginners hit.
          </>
        }
      />

      <h2>Hands-on practice</h2>
      <MicroLab
        title="Make the function actually return a value"
        minutes={5}
        goal={
          <>
            The <code>add</code> below is supposed to return the sum of two numbers, but it fails to compile
            (it returns <code>()</code> instead of <code>i32</code>). <strong>Change just one character</strong> to
            fix it and make it print <code>8</code>. Hit "▶ Run" to verify.
          </>
        }
        starter={`fn add(a: i32, b: i32) -> i32 {
    a + b;
}

fn main() {
    println!("{}", add(3, 5));
}`}
        hint={
          <>
            Look at the <strong>semicolon</strong> at the end of the last line of the function body. With the
            semicolon, <code>a + b</code> goes from an "expression" to a "statement", so the function has no return
            value at the end and defaults to returning <code>()</code>.
          </>
        }
        solution={`fn add(a: i32, b: i32) -> i32 {
    a + b      // drop the semicolon: this line's value becomes the return value
}

fn main() {
    println!("{}", add(3, 5));
}`}
        expectedOutput={`8`}
      />

      <Callout kind="info" title="Recap & next step">
        You can already read most Rust code. But Rust's truly unique feature hasn't shown up yet —
        <strong> ownership</strong>. In the next chapter we'll explain it thoroughly with animations; it's the
        watershed for really understanding Rust.
      </Callout>
    </>
  )
}
