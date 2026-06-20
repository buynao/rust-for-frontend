import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz } from '../../components/Ui'
import { ErrorDrill } from '../../components/Lab'
import { useLang } from '../../i18n/lang'

export default function TraitsGenerics() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        这一章讲 Rust 的「抽象」工具:<strong>泛型</strong>(你在 TS 里用过)和 <strong>trait</strong>
        (像 interface,但更强大)。两者结合,既能复用代码,又保持类型安全和零运行时开销。
      </p>

      <h2>泛型:和 TS 几乎一样</h2>
      <Compare
        js={`// TS 泛型函数
function first<T>(arr: T[]): T {
  return arr[0];
}

class Stack<T> {
  items: T[] = [];
}`}
        rust={`// Rust 泛型函数
fn first<T>(arr: &[T]) -> &T {
    &arr[0]
}

struct Stack<T> {
    items: Vec<T>,
}`}
        note="语法基本一致:尖括号 <T>、可多个类型参数。区别在于 Rust 泛型在编译期会为每个具体类型生成专门的代码(单态化),所以运行时零开销。"
      />

      <KeyTerm term="单态化" en="monomorphization" analogy="像 TS 类型在编译后消失——但 Rust 更进一步:为 first<i32>、first<String> 各生成一份机器码,调用时没有任何动态查找。">
        泛型代码在编译时被「展开」成针对每个实际类型的具体版本。好处是运行时和手写专用代码一样快;
        代价是编译产物可能变大、编译变慢。这就是「零成本抽象」的实现方式之一。
      </KeyTerm>

      <h2>Trait:接口的强化版</h2>
      <p>
        <code>trait</code> 定义「一组方法的契约」,任何类型都能<strong>实现</strong>它——
        甚至可以给标准库或别人的类型实现你自己的 trait(这点比 TS interface 灵活):
      </p>
      <Compare
        js={`interface Summary {
  summarize(): string;
}

class Article implements Summary {
  constructor(public title: string) {}
  summarize() {
    return \`文章:\${this.title}\`;
  }
}`}
        rust={`trait Summary {
    fn summarize(&self) -> String;
}

struct Article { title: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("文章:{}", self.title)
    }
}`}
        note="TS 用 implements 在类定义处声明;Rust 用独立的 impl Trait for Type 块,数据和行为彻底解耦,还能为已有类型「事后」加能力。"
      />

      <h3>默认方法</h3>
      <p>trait 可以给方法提供默认实现,实现者不重写就直接用——类似带默认逻辑的接口:</p>
      <CodeBlock
        runnable
        code={`trait Greet {
    fn name(&self) -> String;
    // 默认方法:基于 name() 实现,可被覆盖
    fn hello(&self) -> String {
        format!("你好,我是 {}", self.name())
    }
}

struct Cat;
impl Greet for Cat {
    fn name(&self) -> String { "喵星人".into() }
    // 不写 hello,直接用默认实现
}

fn main() {
    println!("{}", Cat.hello());
}`}
        output={`你好,我是 喵星人`}
      />

      <h2>Trait 约束:泛型的「类型护栏」</h2>
      <p>
        想写一个「能处理任何可被概括的东西」的函数?用 trait 作为<strong>约束</strong>(bound),
        告诉编译器「这个泛型 T 必须实现 Summary」:
      </p>
      <CodeBlock
        code={`// 写法一:impl Trait(简洁)
fn notify(item: &impl Summary) {
    println!("速报!{}", item.summarize());
}

// 写法二:泛型 + 约束(等价,可复用 T)
fn notify2<T: Summary>(item: &T) {
    println!("速报!{}", item.summarize());
}

// 多个约束用 +
fn show<T: Summary + Clone>(item: &T) { /* ... */ }`}
      />
      <Callout kind="tip" title="对比 TS">
        TS 里你会写 <code>{'function notify<T extends Summary>(item: T)'}</code>。
        Rust 的 <code>{'T: Summary'}</code> 就是同一个意思:「T 必须满足这个能力」。
      </Callout>

      <h2>derive:一行自动实现常用 trait</h2>
      <p>
        很多 trait(打印、比较、克隆)的实现都是机械的,Rust 用 <code>#[derive(...)]</code> 帮你自动生成:
      </p>
      <CodeBlock
        runnable
        code={`#[derive(Debug, Clone, PartialEq)]
struct Point { x: i32, y: i32 }

fn main() {
    let a = Point { x: 1, y: 2 };
    let b = a.clone();           // Clone 来自 derive
    println!("{:?}", a);          // Debug 让 {:?} 能打印
    println!("相等吗? {}", a == b); // PartialEq 让 == 可用
}`}
        output={`Point { x: 1, y: 2 }
相等吗? true`}
      />
      <Callout kind="rust" title="最常 derive 的几个">
        <code>Debug</code>(用 <code>{'{:?}'}</code> 打印,调试必备)、<code>Clone</code>(深拷贝)、
        <code>PartialEq</code>(支持 <code>==</code>)、<code>Copy</code>(栈上小类型)、
        <code>Default</code>(默认值)。看到结构体上方的 <code>#[derive(...)]</code> 就是在「白嫖」这些实现。
      </Callout>

      <h2>静态分发 vs 动态分发</h2>
      <p>
        当你想在一个集合里放「不同类型但都实现了某 trait」的对象时,用 <code>dyn Trait</code>
        (动态分发,类似 JS 里一个数组放不同对象、运行时查方法):
      </p>
      <CodeBlock
        code={`// 静态分发:编译期定死类型,最快(默认首选)
fn area_static(s: &impl Shape) -> f64 { s.area() }

// 动态分发:运行时通过「虚表」查方法,灵活但有微小开销
let shapes: Vec<Box<dyn Shape>> = vec![
    Box::new(Circle { r: 1.0 }),
    Box::new(Rect { w: 2.0, h: 3.0 }),
];
for s in &shapes {
    println!("{}", s.area());  // 运行时决定调哪个 area
}`}
      />

      <Quiz
        question="Rust 的泛型为什么能做到「零运行时开销」?"
        options={[
          { text: '因为泛型代码根本不会被执行' },
          { text: '因为编译器为每个用到的具体类型生成专门的代码(单态化),运行时不需要任何类型判断或动态查找', correct: true },
          { text: '因为泛型只能用于数字类型' },
          { text: '因为 Rust 在运行时缓存了类型信息' },
        ]}
        explain={
          <>
            单态化(monomorphization)在编译期把 <code>{'first<T>'}</code> 展开成
            <code>{'first_i32'}</code>、<code>{'first_String'}</code> 等具体版本,生成的机器码和你手写专用函数
            完全一样,因此没有运行时代价。需要运行时灵活性时才用 <code>dyn</code>(动态分发)。
          </>
        }
      />

      <h2>报错训练</h2>
      <ErrorDrill
        code={`fn largest<T>(list: &[T]) -> &T {
    let mut biggest = &list[0];
    for item in list {
        if item > biggest {   // 想比较大小
            biggest = item;
        }
    }
    biggest
}`}
        error={`error[E0369]: binary operation \`>\` cannot be applied to type \`&T\`
 --> src/main.rs:4:17
  |
4 |         if item > biggest {
  |            ---- ^ ------- &T
  |            |
  |            &T
  |
help: consider restricting type parameter \`T\`
  |
1 | fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {
  |             +++++++++++++++++++++++`}
        question="为什么泛型 T 不能直接用 > 比较?该怎么修?"
        options={[
          { text: '默认的 T 可以是任意类型,不保证能比较大小;给它加约束 T: PartialOrd,声明「T 必须可比较」', correct: true },
          { text: '泛型根本不能比较,必须把 T 换成具体类型 i32' },
          { text: '应该把 > 换成一个叫 .greater() 的方法' },
          { text: '给函数加 #[derive(PartialOrd)] 就能解决' },
        ]}
        explain={
          <>
            泛型 <code>T</code> 代表「任意类型」,而不是所有类型都支持 <code>&gt;</code>。要使用 <code>&gt;</code>,
            就得用 <strong>trait 约束</strong> <code>T: PartialOrd</code> 告诉编译器「调用方传进来的 T 必须实现可比较」。
            注意编译器甚至<strong>直接给出了修法</strong>——读懂这条 <code>help:</code> 是 Rust 高效开发的关键习惯。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 泛型语法同 TS,但靠单态化做到零开销;② trait 是可「事后实现」的接口,还能有默认方法;
        ③ <code>T: Trait</code> 是类型约束;④ <code>#[derive]</code> 自动生成常用实现。
        下一章我们看 trait 的一个绝佳应用——闭包(<code>Fn</code>/<code>FnMut</code>/<code>FnOnce</code>),也就是你天天写的箭头函数在 Rust 里的样子。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        This chapter is about Rust's tools for <strong>abstraction</strong>: <strong>generics</strong>
        (you've used these in TS) and <strong>traits</strong> (like interfaces, but more powerful).
        Together they let you reuse code while keeping full type safety and zero runtime overhead.
      </p>

      <h2>Generics: almost identical to TS</h2>
      <Compare
        js={`// TS generic function
function first<T>(arr: T[]): T {
  return arr[0];
}

class Stack<T> {
  items: T[] = [];
}`}
        rust={`// Rust generic function
fn first<T>(arr: &[T]) -> &T {
    &arr[0]
}

struct Stack<T> {
    items: Vec<T>,
}`}
        note="The syntax is basically the same: angle brackets <T>, multiple type parameters allowed. The difference is that Rust generics generate specialized code for each concrete type at compile time (monomorphization), so there's zero runtime cost."
      />

      <KeyTerm term="monomorphization" en="monomorphization" analogy="Like TS types disappearing after compilation—but Rust goes further: it generates separate machine code for first<i32> and first<String>, with no dynamic lookup when you call them.">
        Generic code gets "expanded" at compile time into a concrete version for each actual type. The upside
        is runtime performance identical to hand-written specialized code; the cost is a potentially larger
        binary and slower compiles. This is one of the ways "zero-cost abstraction" is implemented.
      </KeyTerm>

      <h2>Traits: interfaces, leveled up</h2>
      <p>
        A <code>trait</code> defines "a contract of methods," and any type can <strong>implement</strong> it—
        you can even implement your own trait for the standard library's types or someone else's types
        (which is more flexible than a TS interface):
      </p>
      <Compare
        js={`interface Summary {
  summarize(): string;
}

class Article implements Summary {
  constructor(public title: string) {}
  summarize() {
    return \`Article: \${this.title}\`;
  }
}`}
        rust={`trait Summary {
    fn summarize(&self) -> String;
}

struct Article { title: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("Article: {}", self.title)
    }
}`}
        note="TS uses implements right at the class definition; Rust uses a separate impl Trait for Type block, fully decoupling data from behavior—and letting you add capabilities to existing types after the fact."
      />

      <h3>Default methods</h3>
      <p>A trait can give a method a default implementation, so implementers can use it without overriding—like an interface that ships with default logic:</p>
      <CodeBlock
        runnable
        code={`trait Greet {
    fn name(&self) -> String;
    // Default method: built on top of name(), can be overridden
    fn hello(&self) -> String {
        format!("Hi, I'm {}", self.name())
    }
}

struct Cat;
impl Greet for Cat {
    fn name(&self) -> String { "Whiskers".into() }
    // No hello() — just uses the default implementation
}

fn main() {
    println!("{}", Cat.hello());
}`}
        output={`Hi, I'm Whiskers`}
      />

      <h2>Trait bounds: type guardrails for generics</h2>
      <p>
        Want to write a function that "handles anything summarizable"? Use a trait as a <strong>bound</strong>,
        telling the compiler "this generic T must implement Summary":
      </p>
      <CodeBlock
        code={`// Style 1: impl Trait (concise)
fn notify(item: &impl Summary) {
    println!("Breaking! {}", item.summarize());
}

// Style 2: generic + bound (equivalent, lets you reuse T)
fn notify2<T: Summary>(item: &T) {
    println!("Breaking! {}", item.summarize());
}

// Multiple bounds with +
fn show<T: Summary + Clone>(item: &T) { /* ... */ }`}
      />
      <Callout kind="tip" title="Compared to TS">
        In TS you'd write <code>{'function notify<T extends Summary>(item: T)'}</code>.
        Rust's <code>{'T: Summary'}</code> means the same thing: "T must satisfy this capability."
      </Callout>

      <h2>derive: auto-implement common traits in one line</h2>
      <p>
        Many traits (printing, comparing, cloning) have mechanical implementations, so Rust uses <code>#[derive(...)]</code> to generate them for you:
      </p>
      <CodeBlock
        runnable
        code={`#[derive(Debug, Clone, PartialEq)]
struct Point { x: i32, y: i32 }

fn main() {
    let a = Point { x: 1, y: 2 };
    let b = a.clone();            // Clone comes from derive
    println!("{:?}", a);          // Debug makes {:?} work
    println!("equal? {}", a == b); // PartialEq makes == work
}`}
        output={`Point { x: 1, y: 2 }
equal? true`}
      />
      <Callout kind="rust" title="The ones you'll derive most">
        <code>Debug</code> (print with <code>{'{:?}'}</code>, essential for debugging), <code>Clone</code> (deep copy),
        <code>PartialEq</code> (enables <code>==</code>), <code>Copy</code> (small stack types),
        <code>Default</code> (default values). When you see <code>#[derive(...)]</code> above a struct, that's it
        "freeloading" these implementations.
      </Callout>

      <h2>Static dispatch vs. dynamic dispatch</h2>
      <p>
        When you want to put objects of "different types that all implement some trait" into one collection, use <code>dyn Trait</code>
        (dynamic dispatch, like a JS array holding different objects with methods looked up at runtime):
      </p>
      <CodeBlock
        code={`// Static dispatch: type fixed at compile time, fastest (the default choice)
fn area_static(s: &impl Shape) -> f64 { s.area() }

// Dynamic dispatch: method looked up at runtime via a "vtable", flexible but with a tiny cost
let shapes: Vec<Box<dyn Shape>> = vec![
    Box::new(Circle { r: 1.0 }),
    Box::new(Rect { w: 2.0, h: 3.0 }),
];
for s in &shapes {
    println!("{}", s.area());  // which area() to call is decided at runtime
}`}
      />

      <Quiz
        question="Why can Rust's generics achieve 'zero runtime overhead'?"
        options={[
          { text: "Because generic code never actually runs" },
          { text: 'Because the compiler generates specialized code for each concrete type used (monomorphization), so no type checks or dynamic lookups are needed at runtime', correct: true },
          { text: 'Because generics can only be used with number types' },
          { text: 'Because Rust caches type information at runtime' },
        ]}
        explain={
          <>
            Monomorphization expands <code>{'first<T>'}</code> at compile time into concrete versions like
            <code>{'first_i32'}</code> and <code>{'first_String'}</code>; the resulting machine code is exactly
            like a hand-written specialized function, so there's no runtime cost. You only reach for <code>dyn</code>
            (dynamic dispatch) when you need runtime flexibility.
          </>
        }
      />

      <h2>Error drill</h2>
      <ErrorDrill
        code={`fn largest<T>(list: &[T]) -> &T {
    let mut biggest = &list[0];
    for item in list {
        if item > biggest {   // want to compare sizes
            biggest = item;
        }
    }
    biggest
}`}
        error={`error[E0369]: binary operation \`>\` cannot be applied to type \`&T\`
 --> src/main.rs:4:17
  |
4 |         if item > biggest {
  |            ---- ^ ------- &T
  |            |
  |            &T
  |
help: consider restricting type parameter \`T\`
  |
1 | fn largest<T: std::cmp::PartialOrd>(list: &[T]) -> &T {
  |             +++++++++++++++++++++++`}
        question="Why can't a generic T be compared directly with >? How do you fix it?"
        options={[
          { text: 'A bare T can be any type and isn’t guaranteed to be comparable; add the bound T: PartialOrd to declare "T must be comparable"', correct: true },
          { text: 'Generics can never be compared; you must replace T with a concrete type like i32' },
          { text: 'You should replace > with a method called .greater()' },
          { text: 'Adding #[derive(PartialOrd)] to the function would fix it' },
        ]}
        explain={
          <>
            The generic <code>T</code> stands for "any type," and not every type supports <code>&gt;</code>. To use <code>&gt;</code>,
            you add the <strong>trait bound</strong> <code>T: PartialOrd</code> to tell the compiler "the T the caller passes in must be comparable."
            Notice the compiler even <strong>hands you the fix</strong>—learning to read these <code>help:</code> lines is a key habit for productive Rust work.
          </>
        }
      />

      <Callout kind="info" title="Key takeaways & what's next">
        (1) Generic syntax matches TS, but monomorphization makes it zero-overhead; (2) traits are interfaces you can "implement after the fact," and they can have default methods;
        (3) <code>T: Trait</code> is a type bound; (4) <code>#[derive]</code> auto-generates common implementations.
        Next chapter we'll look at a perfect application of traits—closures (<code>Fn</code>/<code>FnMut</code>/<code>FnOnce</code>), which is what the arrow functions you write every day look like in Rust.
      </Callout>
    </>
  )
}
