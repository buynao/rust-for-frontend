import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'
import OwnershipViz from '../../components/viz/OwnershipViz'
import { useLang } from '../../i18n/lang'

export default function Ownership() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        这是整门课最重要的一章。<strong>所有权(ownership)</strong> 是 Rust 区别于所有主流语言的核心,
        也是它「没有 GC 却内存安全」的秘密。理解了它,后面的借用、生命周期都会迎刃而解。
      </p>

      <h2>先想想:JS 是怎么管内存的?</h2>
      <p>
        在 JS 里你从不操心内存:对象不再被引用,垃圾回收器(GC)会在<strong>某个时刻</strong>把它清掉。
        方便,但有代价:① GC 运行时机不确定,可能在动画关键帧卡你一下;② 需要一个常驻的运行时。
        而 C 语言是另一个极端:你 <code>malloc</code> 就得自己 <code>free</code>,忘了就内存泄漏,
        释放两次或用了已释放的内存就崩溃/被攻击。
      </p>
      <Callout kind="rust" title="Rust 的第三条路">
        既不要 GC,也不要你手动 free。编译器在<strong>编译期</strong>根据「所有权规则」自动插入释放代码,
        并保证你绝不会用到已释放的内存。运行时零开销,安全性却拉满。
      </Callout>

      <h2>所有权三条规则</h2>
      <ol>
        <li>每个值都有一个<strong>所有者(owner)</strong>变量。</li>
        <li>同一时刻<strong>只能有一个</strong>所有者。</li>
        <li>当所有者<strong>离开作用域</strong>,值被自动释放(调用 <code>drop</code>)。</li>
      </ol>
      <p>就这三条。难点在于第二条带来的「move」行为,我们用动画一步步看:</p>

      <Figure
        title="动画:String 的 move 与 drop"
        caption="点「下一步」逐帧观察。关键:赋值给新变量是「移动」所有权,而不是拷贝数据,旧变量立即失效。"
      >
        <OwnershipViz />
      </Figure>

      <h2>move:赋值即转移所有权</h2>
      <p>
        对于<strong>拥有堆数据</strong>的类型(如 <code>String</code>、<code>Vec</code>),把它赋给另一个变量
        或传进函数,会<strong>移动</strong>所有权,原变量随即失效。这和 JS 完全不同:
      </p>
      <Compare
        js={`let s1 = "hello";
let s2 = s1;        // 两个变量都能用
console.log(s1);    // ✅ "hello"
console.log(s2);    // ✅ "hello"
// JS 里字符串是值/共享引用,随便用`}
        rust={`let s1 = String::from("hello");
let s2 = s1;        // 所有权从 s1 move 到 s2
println!("{s2}");   // ✅
println!("{s1}");   // ❌ 编译错误:
// borrow of moved value: \`s1\``}
        note="为什么这么设计?因为如果 s1 和 s2 都「拥有」同一块堆内存,作用域结束时会被释放两次(double free)。move 让所有权唯一,从根上消除这个问题。"
      />

      <KeyTerm term="Copy 类型" en="Copy trait" analogy="像 JS 里的原始值(number、boolean):赋值就是复制,互不影响。">
        整数、浮点、<code>bool</code>、<code>char</code> 以及全由它们组成的元组,数据完全在栈上、拷贝成本极低,
        所以它们实现了 <code>Copy</code>:赋值时<strong>复制</strong>而非移动,原变量依然可用。
        <CodeBlock code={`let x = 5;
let y = x;          // i32 是 Copy,这里是拷贝
println!("{x} {y}"); // ✅ 5 5,x 依然有效`} />
      </KeyTerm>

      <Callout kind="tip" title="判断要不要 move 的窍门">
        问自己:「这个值有没有在堆上、需要被释放的资源?」有(String/Vec/...)→ move;
        没有、纯栈上的小数据 → Copy。编译器会告诉你属于哪种。
      </Callout>

      <h2>想要两份?用 clone</h2>
      <p>
        如果你确实需要两个独立的 <code>String</code>,显式 <code>.clone()</code> 深拷贝堆数据。
        Rust 让「昂贵的拷贝」变得<strong>显眼</strong>,而不是悄悄发生:
      </p>
      <CodeBlock
        runnable
        code={`fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();   // 显式深拷贝,堆上现在有两份 "hello"
    println!("{s1} 和 {s2}"); // ✅ 两个都有效
}`}
        output={`hello 和 hello`}
      />

      <h2>所有权与函数</h2>
      <p>
        把值传进函数,所有权也会<strong>移动进去</strong>。函数结束,值就被 drop 了——除非函数把它
        <strong>还回来</strong>。这正是下一章「借用」要解决的麻烦:
      </p>
      <CodeBlock
        runnable
        title="所有权随函数调用移动"
        code={`fn main() {
    let s = String::from("hello");
    takes_ownership(s);       // s 的所有权移进函数
    // println!("{s}");       // ❌ s 已失效,这行编译不过

    let n = 5;
    makes_copy(n);            // i32 是 Copy,传的是副本
    println!("n 还能用: {n}"); // ✅
}

fn takes_ownership(text: String) {
    println!("我拿到了: {text}");
} // text 在这里离开作用域,被 drop

fn makes_copy(num: i32) {
    println!("我拿到了副本: {num}");
}`}
        output={`我拿到了: hello
我拿到了副本: 5
n 还能用: 5`}
      />
      <Callout kind="warn" title="每次都还来还去太累了">
        如果每个函数用完都要把值 return 回来才能继续用,代码会很啰嗦。所以 Rust 提供了
        <strong>借用(borrowing)</strong>——「借给函数用一下,不转移所有权」。这是下一章的主角。
      </Callout>

      <Quiz
        question="以下代码哪一行会导致编译错误?"
        options={[
          { text: '第 2 行 let v2 = v;' },
          { text: '第 3 行 println!("{:?}", v2);' },
          { text: '第 4 行 println!("{:?}", v);', correct: true },
          { text: '不会报错,正常运行' },
        ]}
        explain={
          <>
            <CodeBlock code={`let v = vec![1, 2, 3];        // 1: Vec 拥有堆数据
let v2 = v;                   // 2: 所有权 move 到 v2
println!("{:?}", v2);         // 3: ✅ v2 有效
println!("{:?}", v);          // 4: ❌ v 已被移动`} />
            <code>Vec</code> 和 <code>String</code> 一样拥有堆数据,赋值即 move。第 4 行使用已移动的
            <code>v</code>,编译器报 <code>borrow of moved value</code>。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="修复 3 处「moved value」错误"
        minutes={8}
        goal={
          <>
            下面 <code>main</code> 里有<strong>三处</strong>「use of moved value」编译错误。运行一次看报错,
            然后逐个修好(每处可二选一:<strong>借用 <code>&</code></strong> 或 <strong><code>.clone()</code></strong>),
            让它打印三行问候。
          </>
        }
        starter={`fn greet(name: String) {
    println!("你好, {name}");
}

fn main() {
    let name = String::from("Ada");
    greet(name);              // ① name 被 move 进函数
    greet(name);              // ② 这里再用就报错

    let list = vec![1, 2, 3];
    let copy = list;          // ③ list 被 move 给 copy
    println!("{:?}", list);   //    这里再用 list 就报错
    println!("{:?}", copy);
}`}
        hint={
          <>
            ① 让 <code>greet</code> 接收 <code>&str</code> 借用,调用处传 <code>&name</code>;
            或在调用处 <code>name.clone()</code>。② 同理。③ 用 <code>let copy = list.clone()</code>,
            或把打印 <code>list</code> 改成打印它的借用。最省事的统一思路:<strong>只读就借用,别拿走所有权</strong>。
          </>
        }
        solution={`fn greet(name: &str) {        // 改成借用
    println!("你好, {name}");
}

fn main() {
    let name = String::from("Ada");
    greet(&name);             // 传引用,不夺所有权
    greet(&name);             // 可以再用

    let list = vec![1, 2, 3];
    let copy = list.clone();  // 显式复制一份
    println!("{:?}", list);   // list 依然有效
    println!("{:?}", copy);
}`}
        expectedOutput={`你好, Ada
你好, Ada
[1, 2, 3]
[1, 2, 3]`}
      />

      <Callout kind="info" title="本章要点">
        ① 值的所有者唯一;② 拥有堆数据的类型赋值/传参会 move,原变量失效;③ Copy 类型(栈上小数据)赋值是拷贝;
        ④ 离开作用域自动 drop。带着这套模型,我们去看「借用」如何让代码既安全又好写。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        This is the single most important chapter in the whole course.{' '}
        <strong>Ownership</strong> is what sets Rust apart from every other
        mainstream language — it's the secret behind being "memory-safe without a
        GC." Once it clicks, borrowing and lifetimes later on fall into place
        almost on their own.
      </p>

      <h2>First, think: how does JS manage memory?</h2>
      <p>
        In JS you never worry about memory: once an object is no longer
        referenced, the garbage collector (GC) sweeps it away at <strong>some
        point</strong>. Convenient, but it comes at a cost: ① the GC runs at
        unpredictable moments and might hitch right on a key animation frame; ② it
        requires a resident runtime. C is the opposite extreme: whatever you{' '}
        <code>malloc</code> you must <code>free</code> yourself — forget and you
        leak memory; free twice or touch already-freed memory and you crash or get
        exploited.
      </p>
      <Callout kind="rust" title="Rust's third way">
        No GC, and no manual free either. At <strong>compile time</strong> the
        compiler inserts the freeing code automatically based on the "ownership
        rules," and guarantees you can never touch freed memory. Zero runtime
        overhead, safety maxed out.
      </Callout>

      <h2>The three rules of ownership</h2>
      <ol>
        <li>Every value has one <strong>owner</strong> variable.</li>
        <li>At any moment there can be <strong>only one</strong> owner.</li>
        <li>When the owner <strong>goes out of scope</strong>, the value is freed automatically (its <code>drop</code> is called).</li>
      </ol>
      <p>That's all three. The tricky part is the "move" behavior that rule two introduces — let's watch it frame by frame:</p>

      <Figure
        title="Animation: move and drop of a String"
        caption="Click 'Next' to step through it. The key point: assigning to a new variable moves ownership rather than copying the data, and the old variable is invalidated immediately."
      >
        <OwnershipViz />
      </Figure>

      <h2>move: assignment transfers ownership</h2>
      <p>
        For types that <strong>own heap data</strong> (like <code>String</code>{' '}
        or <code>Vec</code>), assigning to another variable or passing into a
        function <strong>moves</strong> ownership, and the original variable is
        immediately invalidated. This is completely different from JS:
      </p>
      <Compare
        js={`let s1 = "hello";
let s2 = s1;        // both variables still work
console.log(s1);    // ✅ "hello"
console.log(s2);    // ✅ "hello"
// in JS strings are values / shared refs, use freely`}
        rust={`let s1 = String::from("hello");
let s2 = s1;        // ownership moves from s1 to s2
println!("{s2}");   // ✅
println!("{s1}");   // ❌ compile error:
// borrow of moved value: \`s1\``}
        note="Why design it this way? Because if both s1 and s2 'owned' the same heap allocation, it would be freed twice (double free) when the scope ends. move keeps ownership unique, eliminating the problem at the root."
      />

      <KeyTerm term="Copy types" en="Copy trait" analogy="Like primitives in JS (number, boolean): assignment is a copy, and the two are independent.">
        Integers, floats, <code>bool</code>, <code>char</code>, and tuples made
        entirely of them live wholly on the stack and are dirt cheap to copy, so
        they implement <code>Copy</code>: assignment <strong>copies</strong>{' '}
        rather than moves, and the original variable stays usable.
        <CodeBlock code={`let x = 5;
let y = x;          // i32 is Copy, this is a copy
println!("{x} {y}"); // ✅ 5 5, x is still valid`} />
      </KeyTerm>

      <Callout kind="tip" title="A trick for deciding move vs. not">
        Ask yourself: "Does this value hold a resource on the heap that needs to be
        freed?" Yes (String/Vec/...) → move; no, just small stack data → Copy. The
        compiler will tell you which one it is.
      </Callout>

      <h2>Want two copies? Use clone</h2>
      <p>
        If you genuinely need two independent <code>String</code>s, explicitly{' '}
        <code>.clone()</code> to deep-copy the heap data. Rust makes "expensive
        copies" <strong>visible</strong> rather than letting them happen silently:
      </p>
      <CodeBlock
        runnable
        code={`fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone();   // explicit deep copy; the heap now holds two "hello"s
    println!("{s1} and {s2}"); // ✅ both valid
}`}
        output={`hello and hello`}
      />

      <h2>Ownership and functions</h2>
      <p>
        Passing a value into a function <strong>moves ownership in</strong> too.
        When the function ends, the value is dropped — unless the function{' '}
        <strong>hands it back</strong>. This is exactly the hassle that the next
        chapter on "borrowing" solves:
      </p>
      <CodeBlock
        runnable
        title="Ownership moves with the function call"
        code={`fn main() {
    let s = String::from("hello");
    takes_ownership(s);       // s's ownership moves into the function
    // println!("{s}");       // ❌ s is invalid, this line won't compile

    let n = 5;
    makes_copy(n);            // i32 is Copy, a copy is passed
    println!("n is still usable: {n}"); // ✅
}

fn takes_ownership(text: String) {
    println!("I received: {text}");
} // text goes out of scope here and is dropped

fn makes_copy(num: i32) {
    println!("I received a copy: {num}");
}`}
        output={`I received: hello
I received a copy: 5
n is still usable: 5`}
      />
      <Callout kind="warn" title="Handing things back and forth gets tiring">
        If every function had to return the value so you could keep using it, the
        code would get very verbose. So Rust offers{' '}
        <strong>borrowing</strong> — "lend it to the function for a bit, without
        transferring ownership." That's the star of the next chapter.
      </Callout>

      <Quiz
        question="Which line in the code below causes a compile error?"
        options={[
          { text: 'Line 2: let v2 = v;' },
          { text: 'Line 3: println!("{:?}", v2);' },
          { text: 'Line 4: println!("{:?}", v);', correct: true },
          { text: "No error, it runs fine" },
        ]}
        explain={
          <>
            <CodeBlock code={`let v = vec![1, 2, 3];        // 1: Vec owns heap data
let v2 = v;                   // 2: ownership moves to v2
println!("{:?}", v2);         // 3: ✅ v2 is valid
println!("{:?}", v);          // 4: ❌ v has been moved`} />
            <code>Vec</code>, like <code>String</code>, owns heap data, so
            assignment is a move. Line 4 uses the moved <code>v</code>, and the
            compiler reports <code>borrow of moved value</code>.
          </>
        }
      />

      <h2>Hands-on practice</h2>
      <MicroLab
        title="Fix 3 'moved value' errors"
        minutes={8}
        goal={
          <>
            The <code>main</code> below has <strong>three</strong> "use of moved
            value" compile errors. Run it once to see the errors, then fix them one
            by one (each can go either way: <strong>borrow with <code>&</code></strong>{' '}
            or <strong><code>.clone()</code></strong>) so it prints three greetings.
          </>
        }
        starter={`fn greet(name: String) {
    println!("Hello, {name}");
}

fn main() {
    let name = String::from("Ada");
    greet(name);              // ① name is moved into the function
    greet(name);              // ② using it again here errors

    let list = vec![1, 2, 3];
    let copy = list;          // ③ list is moved to copy
    println!("{:?}", list);   //    using list again here errors
    println!("{:?}", copy);
}`}
        hint={
          <>
            ① Make <code>greet</code> take a <code>&str</code> borrow and pass{' '}
            <code>&name</code> at the call site; or call <code>name.clone()</code>{' '}
            at the call site. ② Same idea. ③ Use <code>let copy = list.clone()</code>,
            or change the print of <code>list</code> to print a borrow of it. The
            simplest unified approach: <strong>if you only read it, borrow it —
            don't take ownership</strong>.
          </>
        }
        solution={`fn greet(name: &str) {        // change to a borrow
    println!("Hello, {name}");
}

fn main() {
    let name = String::from("Ada");
    greet(&name);             // pass a reference, don't take ownership
    greet(&name);             // can use it again

    let list = vec![1, 2, 3];
    let copy = list.clone();  // explicitly make a copy
    println!("{:?}", list);   // list is still valid
    println!("{:?}", copy);
}`}
        expectedOutput={`Hello, Ada
Hello, Ada
[1, 2, 3]
[1, 2, 3]`}
      />

      <Callout kind="info" title="Chapter takeaways">
        ① A value has exactly one owner; ② types that own heap data move on
        assignment/argument-passing, invalidating the original; ③ Copy types (small
        stack data) copy on assignment; ④ they drop automatically when they go out
        of scope. With this mental model in hand, let's see how "borrowing" makes
        code both safe and pleasant to write.
      </Callout>
    </>
  )
}
