import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz } from '../../components/Ui'
import { ErrorDrill } from '../../components/Lab'
import { useLang } from '../../i18n/lang'

export default function StructsEnums() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        会了所有权,我们来给数据建模。Rust 用 <strong>struct</strong> 描述「字段的集合」(像 TS 的
        <code>interface</code>),用 <strong>enum</strong> 描述「几种可能之一」(像 TS 的联合类型,但更强)。
        再配上 <strong>match</strong> 模式匹配,你会爱上这套组合。
      </p>

      <h2>结构体:你熟悉的 interface 升级版</h2>
      <Compare
        js={`interface User {
  name: string;
  age: number;
  active: boolean;
}
const u: User = {
  name: "Ada", age: 36, active: true
};`}
        rust={`struct User {
    name: String,
    age: u32,
    active: bool,
}
let u = User {
    name: String::from("Ada"),
    age: 36,
    active: true,
};`}
        note="结构跟 TS interface 几乎一样。区别:Rust 的 struct 既是「形状」也是「实体」,没有运行时的鸭子类型——类型必须精确匹配。"
      />

      <h3>给结构体加方法:impl 块</h3>
      <p>
        Rust 把<strong>数据(struct)</strong>和<strong>行为(方法)</strong>分开写:方法放在 <code>impl</code> 块里。
        方法的第一个参数是 <code>&self</code>(借用自己,类比 JS 的 <code>this</code>):
      </p>
      <CodeBlock
        runnable
        title="方法与关联函数"
        code={`struct Rect {
    width: u32,
    height: u32,
}

impl Rect {
    // 关联函数(没有 self),像静态工厂方法,常用作构造器
    fn new(w: u32, h: u32) -> Rect {
        Rect { width: w, height: h }
    }
    // 方法:&self 借用自身,只读
    fn area(&self) -> u32 {
        self.width * self.height
    }
    // 可变方法:&mut self 才能改字段
    fn scale(&mut self, factor: u32) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut r = Rect::new(3, 4);   // :: 调用关联函数
    println!("面积 = {}", r.area()); // . 调用方法
    r.scale(2);
    println!("放大后 = {}", r.area());
}`}
        output={`面积 = 12
放大后 = 48`}
      />
      <Callout kind="tip" title="::  vs  .">
        <code>Rect::new()</code> 用双冒号调「关联函数」(无 self,像静态方法);
        <code>r.area()</code> 用点调「方法」(有 self)。<code>String::from()</code> 也是这个道理。
      </Callout>

      <h2>枚举:联合类型的「带货」版本</h2>
      <p>
        TS 的联合类型 <code>"a" | "b"</code> 只能表达「是哪个」。Rust 的 <code>enum</code> 更进一步:
        <strong>每个变体还能携带不同类型的数据</strong>。这叫「代数数据类型」,建模能力极强:
      </p>
      <Compare
        js={`// TS 用「可辨识联合」模拟
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return 3.14 * s.r * s.r;
    case "rect": return s.w * s.h;
  }
}`}
        rust={`enum Shape {
    Circle { r: f64 },
    Rect { w: f64, h: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { r } => 3.14 * r * r,
        Shape::Rect { w, h } => w * h,
    }   // match 必须覆盖所有变体,漏了编译不过
}`}
        note="Rust 原生支持这种「标签 + 数据」的枚举,不用手动加 kind 字段。match 还会强制你处理每一种变体——加了新 Shape 忘了处理?编译器报错。"
      />

      <KeyTerm term="Option:Rust 没有 null" en="Option<T>" analogy="取代 JS 的 null / undefined。「可能没有值」被编码进类型,编译器逼你处理空的情况。">
        Rust 标准库里最重要的枚举就是 <code>Option</code>,它只有两个变体:
        <CodeBlock code={`enum Option<T> {
    Some(T),   // 有值,值是 T
    None,      // 没有值
}`} />
        于是「找不到用户」「数组越界」这类情况返回的是 <code>Option</code>,你<strong>必须先解包</strong>才能用里面的值——
        从语言层面消灭了 <code>undefined is not a function</code>。
      </KeyTerm>

      <h2>match:比 switch 强大的模式匹配</h2>
      <p>解包 <code>Option</code> 最直接的方式就是 <code>match</code>,它能在匹配的同时<strong>绑定</strong>里面的值:</p>
      <CodeBlock
        runnable
        code={`fn first_char(s: &str) -> Option<char> {
    s.chars().next()   // 空字符串就返回 None
}

fn main() {
    let inputs = ["hello", ""];
    for s in inputs {
        match first_char(s) {
            Some(c) => println!("首字符是 '{c}'", ),
            None => println!("空字符串,没有首字符"),
        }
    }
}`}
        output={`首字符是 'h'
空字符串,没有首字符`}
      />

      <h3>只关心一种情况?用 if let</h3>
      <p>当你只想处理 <code>Some</code>、忽略 <code>None</code> 时,<code>match</code> 显得啰嗦,用 <code>if let</code>:</p>
      <Compare
        js={`const c = firstChar(s);
if (c !== undefined) {
  console.log(c);
}`}
        rust={`if let Some(c) = first_char(s) {
    println!("{c}");
}
// 还能配 else:
// if let Some(c) = ... { } else { }`}
        note="if let 是 match 的语法糖,适合「只在乎一个分支」的场景。let...else 则适合「拿不到就提前返回」。"
      />

      <Quiz
        question="为什么说 Rust 的 enum 比 TypeScript 的联合类型更安全?"
        options={[
          { text: '因为 enum 运行更快' },
          { text: '因为 match 强制穷尽所有变体:新增一个变体后,所有没处理它的 match 都会编译报错,逼你补全', correct: true },
          { text: '因为 enum 不能携带数据,更简单' },
          { text: '因为 TS 没有联合类型' },
        ]}
        explain={
          <>
            穷尽性检查(exhaustiveness)是关键:给 <code>Shape</code> 加一个 <code>Triangle</code> 变体后,
            所有 <code>match s</code> 若没处理它都会编译失败。TS 的 switch 默认不会强制你这么做(需要额外技巧)。
            这让重构时「漏改一处」几乎不可能。
          </>
        }
      />

      <h2>报错训练</h2>
      <ErrorDrill
        code={`enum Shape { Circle, Square, Triangle }

fn name(s: Shape) -> &'static str {
    match s {
        Shape::Circle => "圆",
        Shape::Square => "方",
    }
}`}
        error={`error[E0004]: non-exhaustive patterns: \`Shape::Triangle\` not covered
 --> src/main.rs:4:11
  |
1 | enum Shape { Circle, Square, Triangle }
  |                              -------- not covered
...
4 |     match s {
  |           ^ pattern \`Shape::Triangle\` not covered
  |
  = help: ensure that all possible cases are being handled`}
        question="编译器在抱怨什么?哪个修法最合适?"
        options={[
          { text: 'match 必须穷尽枚举的所有变体,这里漏了 Triangle;补上 `Shape::Triangle => "三角"` 或用 `_ =>` 兜底', correct: true },
          { text: 'enum 不能用在 match 里,应改用 if/else' },
          { text: '需要给 Shape 加 #[derive(Debug)]' },
          { text: '函数的 &static str 返回类型写错了' },
        ]}
        explain={
          <>
            这就是 match 的<strong>穷尽性检查</strong>:少处理一个变体就编译失败。它的价值在于——
            以后给 <code>Shape</code> 新增变体时,所有没覆盖它的 <code>match</code> 都会报错,逼你补全,
            杜绝「漏改一处」。用 <code>_ =&gt;</code> 兜底虽然能过,但会让新增变体时<strong>失去</strong>这个提醒,慎用。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① struct 描述形状、impl 写方法;② enum 能携带数据,是强大的建模工具;③ <code>Option</code> 取代 null;
        ④ match 模式匹配 + 穷尽检查是 Rust 的杀手锏。下一章我们看另一个明星枚举 <code>Result</code>,
        以及 Rust 如何彻底改造「错误处理」。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        Now that ownership is behind us, let's model some data. Rust uses <strong>struct</strong> to describe
        "a bundle of fields" (like a TS <code>interface</code>), and <strong>enum</strong> to describe
        "one of several possibilities" (like a TS union type, but more powerful). Pair them with
        <strong>match</strong> pattern matching and you'll fall in love with the combo.
      </p>

      <h2>Structs: the interface you already know, leveled up</h2>
      <Compare
        js={`interface User {
  name: string;
  age: number;
  active: boolean;
}
const u: User = {
  name: "Ada", age: 36, active: true
};`}
        rust={`struct User {
    name: String,
    age: u32,
    active: bool,
}
let u = User {
    name: String::from("Ada"),
    age: 36,
    active: true,
};`}
        note="The shape is almost identical to a TS interface. The difference: a Rust struct is both the 'shape' and the 'thing' — there's no runtime duck typing, so the type has to match exactly."
      />

      <h3>Adding methods to a struct: the impl block</h3>
      <p>
        Rust writes <strong>data (struct)</strong> and <strong>behavior (methods)</strong> separately: methods live in an <code>impl</code> block.
        A method's first parameter is <code>&self</code> (borrowing yourself, the analog of JS <code>this</code>):
      </p>
      <CodeBlock
        runnable
        title="Methods and associated functions"
        code={`struct Rect {
    width: u32,
    height: u32,
}

impl Rect {
    // Associated function (no self) — like a static factory method, often used as a constructor
    fn new(w: u32, h: u32) -> Rect {
        Rect { width: w, height: h }
    }
    // Method: &self borrows self, read-only
    fn area(&self) -> u32 {
        self.width * self.height
    }
    // Mutable method: &mut self is required to change fields
    fn scale(&mut self, factor: u32) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut r = Rect::new(3, 4);   // :: calls an associated function
    println!("area = {}", r.area()); // . calls a method
    r.scale(2);
    println!("after scaling = {}", r.area());
}`}
        output={`area = 12
after scaling = 48`}
      />
      <Callout kind="tip" title="::  vs  .">
        <code>Rect::new()</code> uses the double colon to call an "associated function" (no self, like a static method);
        <code>r.area()</code> uses the dot to call a "method" (has self). <code>String::from()</code> works the same way.
      </Callout>

      <h2>Enums: union types that carry cargo</h2>
      <p>
        A TS union like <code>"a" | "b"</code> can only express "which one is it". Rust's <code>enum</code> goes further:
        <strong>each variant can also carry data of a different type</strong>. This is called an "algebraic data type", and it's an incredibly expressive modeling tool:
      </p>
      <Compare
        js={`// TS simulates this with a "discriminated union"
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return 3.14 * s.r * s.r;
    case "rect": return s.w * s.h;
  }
}`}
        rust={`enum Shape {
    Circle { r: f64 },
    Rect { w: f64, h: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { r } => 3.14 * r * r,
        Shape::Rect { w, h } => w * h,
    }   // match must cover every variant, or it won't compile
}`}
        note="Rust supports this 'tag + data' enum natively — no need to hand-add a kind field. And match forces you to handle every variant: add a new Shape and forget to handle it? Compiler error."
      />

      <KeyTerm term="Option:Rust has no null" en="Option<T>" analogy="Replaces JS's null / undefined. 'There might be no value' is encoded into the type, and the compiler forces you to handle the empty case.">
        The most important enum in Rust's standard library is <code>Option</code>, and it has just two variants:
        <CodeBlock code={`enum Option<T> {
    Some(T),   // has a value of type T
    None,      // no value
}`} />
        So cases like "user not found" or "array out of bounds" return an <code>Option</code>, and you <strong>must unwrap it first</strong> before using the value inside —
        which eliminates <code>undefined is not a function</code> at the language level.
      </KeyTerm>

      <h2>match: pattern matching that beats switch</h2>
      <p>The most direct way to unwrap an <code>Option</code> is <code>match</code>, which can <strong>bind</strong> the inner value as it matches:</p>
      <CodeBlock
        runnable
        code={`fn first_char(s: &str) -> Option<char> {
    s.chars().next()   // an empty string returns None
}

fn main() {
    let inputs = ["hello", ""];
    for s in inputs {
        match first_char(s) {
            Some(c) => println!("first char is '{c}'", ),
            None => println!("empty string, no first char"),
        }
    }
}`}
        output={`first char is 'h'
empty string, no first char`}
      />

      <h3>Only care about one case? Use if let</h3>
      <p>When you only want to handle <code>Some</code> and ignore <code>None</code>, <code>match</code> feels verbose — reach for <code>if let</code>:</p>
      <Compare
        js={`const c = firstChar(s);
if (c !== undefined) {
  console.log(c);
}`}
        rust={`if let Some(c) = first_char(s) {
    println!("{c}");
}
// You can also add an else:
// if let Some(c) = ... { } else { }`}
        note="if let is syntactic sugar for match, perfect when you only care about one branch. let...else is great for 'bail out early if you can't get it'."
      />

      <Quiz
        question="Why is Rust's enum considered safer than TypeScript's union type?"
        options={[
          { text: 'Because enums run faster' },
          { text: 'Because match forces exhaustiveness over all variants: add a new variant and every match that does not handle it fails to compile, forcing you to fill it in', correct: true },
          { text: 'Because enums cannot carry data, making them simpler' },
          { text: 'Because TS has no union types' },
        ]}
        explain={
          <>
            Exhaustiveness checking is the key: add a <code>Triangle</code> variant to <code>Shape</code>, and
            every <code>match s</code> that doesn't handle it will fail to compile. A TS switch doesn't force this by default (it takes extra tricks).
            That makes "missing a spot" during a refactor almost impossible.
          </>
        }
      />

      <h2>Error drill</h2>
      <ErrorDrill
        code={`enum Shape { Circle, Square, Triangle }

fn name(s: Shape) -> &'static str {
    match s {
        Shape::Circle => "circle",
        Shape::Square => "square",
    }
}`}
        error={`error[E0004]: non-exhaustive patterns: \`Shape::Triangle\` not covered
 --> src/main.rs:4:11
  |
1 | enum Shape { Circle, Square, Triangle }
  |                              -------- not covered
...
4 |     match s {
  |           ^ pattern \`Shape::Triangle\` not covered
  |
  = help: ensure that all possible cases are being handled`}
        question="What is the compiler complaining about, and which fix is best?"
        options={[
          { text: 'match must be exhaustive over all variants of the enum; Triangle is missing here. Add `Shape::Triangle => "triangle"`, or use a `_ =>` catch-all', correct: true },
          { text: 'enums cannot be used in match; switch to if/else' },
          { text: 'Shape needs #[derive(Debug)]' },
          { text: 'The &static str return type of the function is wrong' },
        ]}
        explain={
          <>
            This is match's <strong>exhaustiveness check</strong>: miss one variant and it won't compile. The value of this is —
            when you later add a variant to <code>Shape</code>, every <code>match</code> that doesn't cover it errors out, forcing you to fill it in,
            and stamping out "missed a spot". A <code>_ =&gt;</code> catch-all compiles, but it <strong>loses</strong> that reminder when you add a variant, so use it sparingly.
          </>
        }
      />

      <Callout kind="info" title="Key points & next step">
        (1) struct describes shape, impl holds methods; (2) enums can carry data and are a powerful modeling tool; (3) <code>Option</code> replaces null;
        (4) match pattern matching plus exhaustiveness checking is Rust's killer feature. Next chapter we'll look at another star enum, <code>Result</code>,
        and how Rust completely reinvents "error handling".
      </Callout>
    </>
  )
}
