import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'
import ClosureViz from '../../components/viz/ClosureViz'
import { useLang } from '../../i18n/lang'

export default function Closures() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        箭头函数是前端的命根子:回调、<code>map</code>、事件处理全靠它。Rust 的<strong>闭包</strong>
        长得也很像,但因为有所有权,它多了一层你需要理解的东西:<strong>「这个闭包到底捕获了外部变量的什么——
        借用?可变借用?还是所有权?」</strong> 搞懂这点,异步和多线程里的闭包就不会再让你困惑。
      </p>

      <h2>语法:|参数| 表达式</h2>
      <Compare
        js={`const square = x => x * x;
const add = (a, b) => a + b;
const greet = () => console.log("hi");

[1, 2, 3].map(x => x * 2);`}
        rust={`let square = |x| x * x;
let add = |a, b| a + b;
let greet = || println!("hi");

vec![1, 2, 3].iter().map(|x| x * 2);`}
        note="把箭头函数的 ( ) 换成 | |,放到参数两边,就成了 Rust 闭包。类型大多能推断,省略不写。"
      />
      <Callout kind="tip" title="带类型与多行">
        需要时也可标注类型、写多行块:
        <CodeBlock code={`let add = |a: i32, b: i32| -> i32 {
    let sum = a + b;
    sum            // 最后一个表达式即返回值
};`} />
      </Callout>

      <h2>核心:闭包「捕获」环境的三种方式</h2>
      <p>
        闭包能用到它定义处周围的变量(像 JS 的词法作用域)。但 Rust 必须决定:闭包是<strong>借</strong>这个变量,
        还是<strong>拿走</strong>它?编译器按「闭包体里怎么用它」自动选择最宽松的方式。切换下面三种场景感受区别:
      </p>

      <Figure
        title="交互:Fn / FnMut / FnOnce 三种捕获"
        caption="只读 → 借用(Fn);修改 → 可变借用(FnMut);消耗/move → 拿走所有权(FnOnce)。切换标签查看每种的代码与后果。"
      >
        <ClosureViz />
      </Figure>

      <KeyTerm term="三个 trait" en="Fn / FnMut / FnOnce" analogy="可以粗略理解成「闭包能被调用几次、以什么方式访问环境」的能力分级。">
        闭包自动实现这三个 trait 之一(或多个),决定它能怎么被使用:
        <ul style={{ marginTop: 8 }}>
          <li><code>Fn</code> —— 不可变借用环境,可<strong>多次</strong>调用(最常见)。</li>
          <li><code>FnMut</code> —— 可变借用环境,可多次调用,但调用时会改外部状态。</li>
          <li><code>FnOnce</code> —— 取走环境的所有权,<strong>最多一次</strong>(因为第二次时所有权已经没了)。</li>
        </ul>
      </KeyTerm>

      <h2>move:把所有权搬进闭包</h2>
      <p>
        最该记住的关键字是 <code>move</code>。它强制闭包<strong>拿走</strong>所有捕获变量的所有权。
        在<strong>线程</strong>和<strong>异步任务</strong>里几乎必用——因为闭包可能比当前函数活得更久,
        不能再借用即将消失的局部变量:
      </p>
      <CodeBlock
        runnable
        title="move 让闭包能安全地跨线程"
        code={`use std::thread;

fn main() {
    let data = vec![1, 2, 3];

    // move:把 data 的所有权交给新线程的闭包
    let handle = thread::spawn(move || {
        println!("子线程拿到: {:?}", data);
    });

    // 这里不能再用 data 了,它已经 move 进闭包
    handle.join().unwrap();
}`}
        output={`子线程拿到: [1, 2, 3]`}
      />
      <Callout kind="rust" title="为什么线程闭包总要 move?">
        新线程可能在 <code>main</code> 结束后还在跑。如果闭包只是<strong>借用</strong> <code>data</code>,
        而 <code>data</code> 随 <code>main</code> 一起没了,线程就会访问悬垂数据。<code>move</code> 把所有权搬进去,
        从根上杜绝这个问题——这正是前几章所有权规则的延续。
      </Callout>

      <h2>闭包作为参数与返回值</h2>
      <p>把闭包传给函数时,用 trait 约束(回顾上一章)声明你接受哪类闭包:</p>
      <CodeBlock
        runnable
        code={`// 接收一个「可多次调用、不改环境」的闭包
fn apply_twice<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(f(x))
}

// 返回闭包:用 impl Fn(...)(因为闭包类型无法直接写出)
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n      // move 捕获 n,这样返回后 n 依然有效
}

fn main() {
    println!("{}", apply_twice(|x| x + 3, 10)); // (10+3)+3 = 16
    let add5 = make_adder(5);
    println!("{}", add5(100));                   // 105
}`}
        output={`16
105`}
      />
      <Callout kind="js" title="对照 JS 的高阶函数">
        <code>make_adder</code> 就是 JS 里经典的「函数工厂」:<code>{'const makeAdder = n => x => x + n'}</code>。
        区别是 Rust 要显式用 <code>move</code> 把 <code>n</code> 搬进返回的闭包,并用 <code>impl Fn</code> 标注返回类型。
      </Callout>

      <h2>函数指针 vs 闭包</h2>
      <p>不捕获任何环境的闭包,可以和普通函数互换使用(类型是 <code>fn</code>):</p>
      <CodeBlock
        code={`fn double(x: i32) -> i32 { x * 2 }

let nums = vec![1, 2, 3];
// 这两行等价:既能传具名函数,也能传闭包
let a: Vec<i32> = nums.iter().map(|&x| double(x)).collect();
let b: Vec<i32> = nums.iter().map(|&x| x * 2).collect();`}
      />

      <Quiz
        question="一个用了 move、并在内部把捕获的 Vec 消耗掉(如 into_iter)的闭包,通常实现哪个 trait?"
        options={[
          { text: 'Fn,因为它可以被多次调用' },
          { text: 'FnOnce,因为它取走并消耗了所有权,只能被调用一次', correct: true },
          { text: 'FnMut,因为它修改了环境' },
          { text: '不实现任何 trait' },
        ]}
        explain={
          <>
            一旦闭包<strong>消耗</strong>掉捕获的值(把所有权移走/释放),第二次调用时那个值已经不存在了,
            所以它只能实现 <code>FnOnce</code>——「最多调用一次」。如果只是读,它会是 <code>Fn</code>;
            只是改但不消耗,则是 <code>FnMut</code>。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="让计数器闭包编译通过"
        minutes={5}
        goal={
          <>
            下面想用一个闭包做计数器,每次调用 +1。但它编译不过。<strong>加一个关键字</strong>就能修好,
            让它打印 <code>1</code>、<code>2</code>、<code>3</code>。先运行看报错,再想想这是哪种捕获(<code>FnMut</code>)。
          </>
        }
        starter={`fn main() {
    let mut count = 0;
    let inc = || { count += 1; count };  // 闭包修改了 count
    println!("{}", inc());
    println!("{}", inc());
    println!("{}", inc());
}`}
        hint={
          <>
            闭包修改外部变量 → 它是 <code>FnMut</code>。要<strong>多次调用</strong>一个会改环境的闭包,
            闭包绑定本身也必须是可变的。问题不在 <code>count</code>(它已经是 <code>mut</code>),而在 <code>inc</code>。
          </>
        }
        solution={`fn main() {
    let mut count = 0;
    let mut inc = || { count += 1; count };  // 闭包变量也要 mut
    println!("{}", inc());
    println!("{}", inc());
    println!("{}", inc());
}`}
        expectedOutput={`1
2
3`}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 闭包语法 <code>|x| ...</code> ≈ 箭头函数;② 按用法自动以「借用 / 可变借用 / move」捕获环境,对应
        <code>Fn / FnMut / FnOnce</code>;③ 线程与异步里几乎总要 <code>move</code>;④ 用 <code>impl Fn</code> 传递/返回闭包。
        接下来我们就用闭包去喂迭代器——你最熟悉的 map/filter 链。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        Arrow functions are a frontend lifeline: callbacks, <code>map</code>, event handlers all rely on them.
        Rust&apos;s <strong>closures</strong> look very similar, but because of ownership they add one layer you need to
        understand: <strong>&quot;what exactly does this closure capture from the surrounding variables — a borrow? a
        mutable borrow? or ownership?&quot;</strong> Once that clicks, closures in async and multithreaded code will stop
        confusing you.
      </p>

      <h2>Syntax: |params| expression</h2>
      <Compare
        js={`const square = x => x * x;
const add = (a, b) => a + b;
const greet = () => console.log("hi");

[1, 2, 3].map(x => x * 2);`}
        rust={`let square = |x| x * x;
let add = |a, b| a + b;
let greet = || println!("hi");

vec![1, 2, 3].iter().map(|x| x * 2);`}
        note="Swap the arrow function's ( ) for | | around the parameters, and you've got a Rust closure. Most types can be inferred, so you usually leave them off."
      />
      <Callout kind="tip" title="With types and multiple lines">
        When you need to, you can annotate types and write a multi-line block:
        <CodeBlock code={`let add = |a: i32, b: i32| -> i32 {
    let sum = a + b;
    sum            // the last expression is the return value
};`} />
      </Callout>

      <h2>The core idea: three ways a closure &quot;captures&quot; its environment</h2>
      <p>
        A closure can use variables from where it&apos;s defined (just like JS lexical scope). But Rust has to decide:
        does the closure <strong>borrow</strong> that variable, or <strong>take</strong> it? The compiler picks the most
        permissive option automatically, based on how the closure body uses it. Switch between the three scenarios below
        to feel the difference:
      </p>

      <Figure
        title="Interactive: Fn / FnMut / FnOnce — the three captures"
        caption="Read-only → borrow (Fn); modify → mutable borrow (FnMut); consume/move → take ownership (FnOnce). Switch tabs to see each one's code and consequences."
      >
        <ClosureViz />
      </Figure>

      <KeyTerm term="the three traits" en="Fn / FnMut / FnOnce" analogy="Roughly, a tiering of &quot;how many times the closure can be called, and how it accesses its environment.&quot;">
        A closure automatically implements one (or more) of these traits, which determines how it can be used:
        <ul style={{ marginTop: 8 }}>
          <li><code>Fn</code> — borrows the environment immutably, can be called <strong>many times</strong> (the most common case).</li>
          <li><code>FnMut</code> — borrows the environment mutably, can be called many times, but each call mutates outside state.</li>
          <li><code>FnOnce</code> — takes ownership of the environment, can be called <strong>at most once</strong> (because the second time, ownership is already gone).</li>
        </ul>
      </KeyTerm>

      <h2>move: hauling ownership into the closure</h2>
      <p>
        The keyword to remember above all is <code>move</code>. It forces the closure to <strong>take</strong> ownership
        of every captured variable. It&apos;s almost always required in <strong>threads</strong> and
        <strong> async tasks</strong> — because the closure may outlive the current function and can&apos;t keep
        borrowing local variables that are about to disappear:
      </p>
      <CodeBlock
        runnable
        title="move lets a closure safely cross thread boundaries"
        code={`use std::thread;

fn main() {
    let data = vec![1, 2, 3];

    // move: hand ownership of data to the new thread's closure
    let handle = thread::spawn(move || {
        println!("child thread got: {:?}", data);
    });

    // data can't be used here anymore — it's been moved into the closure
    handle.join().unwrap();
}`}
        output={`child thread got: [1, 2, 3]`}
      />
      <Callout kind="rust" title="Why do thread closures always need move?">
        A new thread may still be running after <code>main</code> finishes. If the closure only <strong>borrowed</strong>
        <code> data</code>, and <code>data</code> vanished along with <code>main</code>, the thread would be accessing
        dangling data. <code>move</code> hauls ownership inside, eliminating the problem at the root — which is exactly a
        continuation of the ownership rules from the earlier chapters.
      </Callout>

      <h2>Closures as parameters and return values</h2>
      <p>When you pass a closure to a function, use trait bounds (recall the previous chapter) to declare which kind of closure you accept:</p>
      <CodeBlock
        runnable
        code={`// accepts a closure that can be called many times and doesn't mutate the environment
fn apply_twice<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
    f(f(x))
}

// returning a closure: use impl Fn(...) (because closure types can't be written out directly)
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n      // move captures n, so it stays valid after returning
}

fn main() {
    println!("{}", apply_twice(|x| x + 3, 10)); // (10+3)+3 = 16
    let add5 = make_adder(5);
    println!("{}", add5(100));                   // 105
}`}
        output={`16
105`}
      />
      <Callout kind="js" title="Compared to higher-order functions in JS">
        <code>make_adder</code> is JS&apos;s classic &quot;function factory&quot;: <code>{'const makeAdder = n => x => x + n'}</code>.
        The difference is that Rust explicitly uses <code>move</code> to haul <code>n</code> into the returned closure, and
        annotates the return type with <code>impl Fn</code>.
      </Callout>

      <h2>Function pointers vs. closures</h2>
      <p>A closure that captures nothing from its environment is interchangeable with a plain function (its type is <code>fn</code>):</p>
      <CodeBlock
        code={`fn double(x: i32) -> i32 { x * 2 }

let nums = vec![1, 2, 3];
// these two lines are equivalent: you can pass a named function or a closure
let a: Vec<i32> = nums.iter().map(|&x| double(x)).collect();
let b: Vec<i32> = nums.iter().map(|&x| x * 2).collect();`}
      />

      <Quiz
        question="A closure that uses move and consumes the captured Vec inside it (e.g. with into_iter) typically implements which trait?"
        options={[
          { text: 'Fn, because it can be called many times' },
          { text: 'FnOnce, because it takes and consumes ownership, so it can only be called once', correct: true },
          { text: 'FnMut, because it mutates the environment' },
          { text: 'It implements no trait' },
        ]}
        explain={
          <>
            Once a closure <strong>consumes</strong> a captured value (moves out / releases ownership), that value no
            longer exists by the second call, so it can only implement <code>FnOnce</code> — &quot;callable at most
            once.&quot; If it only reads, it&apos;s <code>Fn</code>; if it mutates but doesn&apos;t consume, it&apos;s
            <code> FnMut</code>.
          </>
        }
      />

      <h2>Hands-on exercise</h2>
      <MicroLab
        title="Make the counter closure compile"
        minutes={5}
        goal={
          <>
            Below we want a closure that works as a counter, adding 1 on each call. But it doesn&apos;t compile.
            <strong> Add one keyword</strong> to fix it so it prints <code>1</code>, <code>2</code>, <code>3</code>. Run
            it first to see the error, then think about which kind of capture this is (<code>FnMut</code>).
          </>
        }
        starter={`fn main() {
    let mut count = 0;
    let inc = || { count += 1; count };  // the closure mutates count
    println!("{}", inc());
    println!("{}", inc());
    println!("{}", inc());
}`}
        hint={
          <>
            A closure that mutates an outer variable is <code>FnMut</code>. To <strong>call it many times</strong> when it
            mutates the environment, the closure binding itself must also be mutable. The problem isn&apos;t
            <code> count</code> (it&apos;s already <code>mut</code>) — it&apos;s <code>inc</code>.
          </>
        }
        solution={`fn main() {
    let mut count = 0;
    let mut inc = || { count += 1; count };  // the closure variable also needs mut
    println!("{}", inc());
    println!("{}", inc());
    println!("{}", inc());
}`}
        expectedOutput={`1
2
3`}
      />

      <Callout kind="info" title="Key points & next step">
        ① The closure syntax <code>|x| ...</code> ≈ an arrow function; ② it captures the environment automatically by
        &quot;borrow / mutable borrow / move&quot; depending on usage, corresponding to <code>Fn / FnMut / FnOnce</code>;
        ③ threads and async almost always need <code>move</code>; ④ use <code>impl Fn</code> to pass and return closures.
        Next, we&apos;ll feed closures to iterators — the map/filter chains you know best.
      </Callout>
    </>
  )
}
