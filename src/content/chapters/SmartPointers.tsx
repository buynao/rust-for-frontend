import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure, Pill } from '../../components/Ui'
import RcViz from '../../components/viz/RcViz'
import { useLang } from '../../i18n/lang'

export default function SmartPointers() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        「单一所有权」很安全,但有时太死板:一个值需要被<strong>多处共享</strong>怎么办?
        想要一个<strong>递归</strong>的数据结构(链表、树)怎么办?在借用规则下想<strong>内部修改</strong>怎么办?
        答案是<strong>智能指针</strong>——它们是包了一层「额外能力」的指针,你按需选用。
      </p>

      <Callout kind="js" title="前端其实见过类似的东西">
        JS 的 <code>WeakRef</code>、React 的 <code>useRef</code>、不可变库里的「共享结构」……都是「给引用加规则/能力」的思路。
        Rust 把这套显式化、类型化了。下面三个是日常 90% 会用到的。
      </Callout>

      <h2>Box&lt;T&gt;:把数据放到堆上</h2>
      <p>
        <code>Box</code> 是最简单的智能指针:它就是「一个指向堆上某个值的、拥有所有权的指针」。
        两个主要用途:① 显式把大数据放堆上;② 让<strong>递归类型</strong>能确定大小。
      </p>
      <Compare
        jsTitle="JS:对象天然在堆上(引擎管)"
        rustTitle="Rust:用 Box 显式上堆"
        js={`// 链表节点,JS 直接引用即可
const node = {
  value: 1,
  next: { value: 2, next: null }
};`}
        rust={`// 递归枚举:不用 Box 编译器算不出大小(无限大)
enum List {
    Cons(i32, Box<List>),  // Box 让它变成「指针大小」
    Nil,
}
use List::*;
let list = Cons(1, Box::new(Cons(2, Box::new(Nil))));`}
        note="为什么要 Box?如果 List 直接内含 List,大小会无限递归。Box 把「下一个节点」变成一个固定大小的指针,大小就确定了。"
      />
      <Callout kind="rust" title="什么时候用 Box?">
        ① 递归类型(树、链表、AST);② 想把一大坨数据移动时只搬指针、不搬数据;
        ③ trait 对象 <code>Box&lt;dyn Trait&gt;</code>(回顾「动态分发」)。日常它是最朴素、零额外开销的智能指针。
      </Callout>

      <h2>Rc&lt;T&gt;:多个所有者共享(引用计数)</h2>
      <p>
        当一份数据需要被<strong>多个变量同时拥有</strong>(比如图里一个节点被多条边指向),单一所有权就不够了。
        <code>Rc</code>(Reference Counted)维护一个<strong>引用计数</strong>:每 <code>clone</code> 一次 +1,
        每 drop 一次 -1,归 0 才释放。用动画看清这个过程:
      </p>

      <Figure
        title="动画:Rc 的引用计数生命周期"
        caption="逐步观察:Rc::clone 不复制数据、只增加计数;每个持有者离开作用域计数减一;计数归零时数据才被释放。"
      >
        <RcViz />
      </Figure>

      <CodeBlock
        runnable
        title="Rc 共享只读数据"
        code={`use std::rc::Rc;

fn main() {
    let shared = Rc::new(vec![1, 2, 3]);
    let a = Rc::clone(&shared);      // 计数 → 2
    let b = Rc::clone(&shared);      // 计数 → 3

    println!("数据 = {:?}", a);
    println!("当前有 {} 个持有者", Rc::strong_count(&shared));
    // a、b 和 shared 共享同一份 Vec,谁都能读
    println!("b 也能读: {:?}", b);
}`}
        output={`数据 = [1, 2, 3]
当前有 3 个持有者
b 也能读: [1, 2, 3]`}
      />
      <Callout kind="warn" title="Rc 是单线程的">
        <code>Rc</code> 的计数器没有加锁,只能在单线程用。要<strong>跨线程</strong>共享,换成
        <code>Arc</code>(Atomically Reference Counted)——API 完全一样,只是计数用原子操作,稍慢但线程安全。
        (回忆「异步与并发」章里的 <code>Arc&lt;Mutex&lt;T&gt;&gt;</code>。)
      </Callout>

      <h2>RefCell&lt;T&gt;:内部可变性</h2>
      <p>
        <code>Rc</code> 只能共享<strong>只读</strong>数据。可如果多个持有者还想<strong>修改</strong>呢?
        这就要 <code>RefCell</code>:它把「借用检查」从<strong>编译期</strong>挪到<strong>运行期</strong>——
        让你在持有不可变引用的情况下,仍能借出可变引用。
      </p>
      <KeyTerm term="内部可变性" en="interior mutability" analogy="有点像 TS 里 readonly 的对象内部却藏着一个可变字段——外表不可变,内部可改。">
        正常借用规则在编译期检查。<code>RefCell</code> 改为在<strong>运行期</strong>记账:<code>.borrow()</code> 拿只读、
        <code>.borrow_mut()</code> 拿可变。规则不变(只读可多个、可变须唯一),但<strong>违反时是 panic 而非编译错误</strong>。
      </KeyTerm>
      <CodeBlock
        runnable
        title="Rc<RefCell<T>>:既共享又可改"
        code={`use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // 经典组合:Rc 负责「多个所有者」,RefCell 负责「可修改」
    let shared = Rc::new(RefCell::new(vec![1, 2, 3]));

    let clone1 = Rc::clone(&shared);
    clone1.borrow_mut().push(4);     // 通过一个句柄修改

    let clone2 = Rc::clone(&shared);
    clone2.borrow_mut().push(5);     // 通过另一个句柄修改

    // 所有句柄看到的是同一份、已被改动的数据
    println!("{:?}", shared.borrow());
}`}
        output={`[1, 2, 3, 4, 5]`}
      />
      <Callout kind="danger" title="RefCell 把检查推迟到运行期">
        如果你在已经 <code>borrow_mut()</code> 的同时再 <code>borrow_mut()</code>,程序会在运行时
        <strong>panic</strong>(<code>already borrowed</code>),而不是编译期报错。所以 <code>RefCell</code> 是
        「用一点运行时风险换灵活性」,别滥用——能用普通借用就别上 <code>RefCell</code>。
      </Callout>

      <h2>怎么选?一张决策表</h2>
      <div className="prose">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
              <th style={c}>需求</th><th style={c}>用什么</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['只是想把值放堆上 / 递归类型', 'Box<T>'],
              ['一份数据要多个所有者(单线程,只读)', 'Rc<T>'],
              ['多个所有者 + 需要修改(单线程)', 'Rc<RefCell<T>>'],
              ['跨线程共享(只读)', 'Arc<T>'],
              ['跨线程共享 + 修改', 'Arc<Mutex<T>> 或 Arc<RwLock<T>>'],
            ].map((r) => (
              <tr key={r[1]} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ ...c, color: 'var(--fg-2)' }}>{r[0]}</td>
                <td style={c}><code style={{ color: 'var(--rust)' }}>{r[1]}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <Pill>记忆法</Pill> <strong>Rc/Arc 解决「谁拥有」(共享),RefCell/Mutex 解决「谁能改」(可变)。</strong>
        把它们叠起来用,就覆盖了绝大多数复杂数据结构。
      </p>

      <Quiz
        question="你在单线程里构建一棵树,父节点需要被多个子节点引用,并且节点内容之后还要修改。最合适的类型组合是?"
        options={[
          { text: 'Box<Node>' },
          { text: 'Rc<RefCell<Node>>', correct: true },
          { text: 'Arc<Mutex<Node>>' },
          { text: '普通的 &mut Node' },
        ]}
        explain={
          <>
            「被多处引用」→ 需要 <code>Rc</code>(多个所有者);「之后还要修改」→ 需要
            <code>RefCell</code>(内部可变性)。组合成 <code>Rc&lt;RefCell&lt;Node&gt;&gt;</code>。
            <code>Arc&lt;Mutex&gt;</code> 是它的跨线程版本,单线程用不着、更慢。普通 <code>&mut</code> 无法做到「多个所有者」。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① <code>Box</code> 上堆 / 递归;② <code>Rc</code>/<code>Arc</code> 共享所有权(引用计数);
        ③ <code>RefCell</code>/<code>Mutex</code> 提供内部可变性(检查推迟到运行期);④ 叠加使用覆盖复杂结构。
        下一章我们把「引用能活多久」这件事讲透——生命周期。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        "Single ownership" is wonderfully safe, but sometimes too rigid: what if a value needs to be
        <strong> shared in several places</strong>? What if you want a <strong>recursive</strong> data structure
        (linked list, tree)? What if you need to <strong>mutate something from the inside</strong> while the borrow
        rules are watching? The answer is <strong>smart pointers</strong> — pointers wrapped with an "extra ability",
        which you reach for as needed.
      </p>

      <Callout kind="js" title="You've actually seen something like this on the frontend">
        JS's <code>WeakRef</code>, React's <code>useRef</code>, the "shared structure" in immutable libraries… all of these
        are about "attaching rules/abilities to a reference". Rust just makes that idea explicit and typed. The three below
        are the ones you'll reach for 90% of the time.
      </Callout>

      <h2>Box&lt;T&gt;: put data on the heap</h2>
      <p>
        <code>Box</code> is the simplest smart pointer: it's just "an owning pointer to some value on the heap".
        Two main uses: ① explicitly place big data on the heap; ② let a <strong>recursive type</strong> have a known size.
      </p>
      <Compare
        jsTitle="JS: objects live on the heap by default (the engine handles it)"
        rustTitle="Rust: use Box to put it on the heap explicitly"
        js={`// Linked-list node — JS just references it directly
const node = {
  value: 1,
  next: { value: 2, next: null }
};`}
        rust={`// Recursive enum: without Box the compiler can't compute its size (infinite)
enum List {
    Cons(i32, Box<List>),  // Box makes it "pointer-sized"
    Nil,
}
use List::*;
let list = Cons(1, Box::new(Cons(2, Box::new(Nil))));`}
        note="Why Box? If List directly contained a List, its size would recurse forever. Box turns 'the next node' into a fixed-size pointer, so the size becomes known."
      />
      <Callout kind="rust" title="When should you use Box?">
        ① recursive types (trees, linked lists, ASTs); ② when you want to move a big chunk of data by moving only a pointer,
        not the data; ③ trait objects <code>Box&lt;dyn Trait&gt;</code> (recall "dynamic dispatch"). Day to day it's the
        plainest, zero-overhead smart pointer.
      </Callout>

      <h2>Rc&lt;T&gt;: multiple owners share (reference counting)</h2>
      <p>
        When one piece of data needs to be <strong>owned by several variables at once</strong> (e.g. a graph node pointed to
        by multiple edges), single ownership isn't enough. <code>Rc</code> (Reference Counted) maintains a
        <strong> reference count</strong>: each <code>clone</code> adds 1, each drop subtracts 1, and the data is freed only
        when it hits 0. Let's watch the process in the animation:
      </p>

      <Figure
        title="Animation: the reference-count lifecycle of Rc"
        caption="Step through it: Rc::clone doesn't copy the data, it just bumps the count; each holder leaving scope decrements the count by one; only when the count reaches zero is the data freed."
      >
        <RcViz />
      </Figure>

      <CodeBlock
        runnable
        title="Rc sharing read-only data"
        code={`use std::rc::Rc;

fn main() {
    let shared = Rc::new(vec![1, 2, 3]);
    let a = Rc::clone(&shared);      // count → 2
    let b = Rc::clone(&shared);      // count → 3

    println!("data = {:?}", a);
    println!("there are {} holders right now", Rc::strong_count(&shared));
    // a, b and shared share the same Vec — any of them can read
    println!("b can read it too: {:?}", b);
}`}
        output={`data = [1, 2, 3]
there are 3 holders right now
b can read it too: [1, 2, 3]`}
      />
      <Callout kind="warn" title="Rc is single-threaded">
        <code>Rc</code>'s counter isn't locked, so it only works on a single thread. To share <strong>across threads</strong>,
        switch to <code>Arc</code> (Atomically Reference Counted) — the API is identical, it just uses atomic operations for
        the count, which is slightly slower but thread-safe. (Recall <code>Arc&lt;Mutex&lt;T&gt;&gt;</code> from the
        "async &amp; concurrency" chapter.)
      </Callout>

      <h2>RefCell&lt;T&gt;: interior mutability</h2>
      <p>
        <code>Rc</code> can only share <strong>read-only</strong> data. But what if multiple holders also want to
        <strong> mutate</strong> it? That's where <code>RefCell</code> comes in: it moves the "borrow check" from
        <strong> compile time</strong> to <strong>run time</strong> — letting you hand out a mutable reference even while
        holding an immutable one.
      </p>
      <KeyTerm term="interior mutability" en="interior mutability" analogy="A bit like a readonly object in TS that secretly hides a mutable field — immutable on the outside, changeable on the inside.">
        Normal borrow rules are checked at compile time. <code>RefCell</code> instead does the bookkeeping at
        <strong> run time</strong>: <code>.borrow()</code> takes a read-only ref, <code>.borrow_mut()</code> takes a mutable one.
        The rules don't change (many readers OK, mutation must be exclusive), but <strong>a violation panics rather than failing
        to compile</strong>.
      </KeyTerm>
      <CodeBlock
        runnable
        title="Rc<RefCell<T>>: shared and mutable"
        code={`use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // The classic combo: Rc handles "multiple owners", RefCell handles "mutability"
    let shared = Rc::new(RefCell::new(vec![1, 2, 3]));

    let clone1 = Rc::clone(&shared);
    clone1.borrow_mut().push(4);     // mutate through one handle

    let clone2 = Rc::clone(&shared);
    clone2.borrow_mut().push(5);     // mutate through another handle

    // Every handle sees the same, already-modified data
    println!("{:?}", shared.borrow());
}`}
        output={`[1, 2, 3, 4, 5]`}
      />
      <Callout kind="danger" title="RefCell defers the check to run time">
        If you <code>borrow_mut()</code> again while one <code>borrow_mut()</code> is still live, the program
        <strong> panics</strong> at run time (<code>already borrowed</code>) instead of failing to compile. So
        <code> RefCell</code> "trades a bit of runtime risk for flexibility" — don't overuse it; if a plain borrow works,
        skip <code>RefCell</code>.
      </Callout>

      <h2>How do you choose? A decision table</h2>
      <div className="prose">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
              <th style={c}>Need</th><th style={c}>Use</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Just want to put a value on the heap / recursive type', 'Box<T>'],
              ['One piece of data, multiple owners (single-threaded, read-only)', 'Rc<T>'],
              ['Multiple owners + need to mutate (single-threaded)', 'Rc<RefCell<T>>'],
              ['Share across threads (read-only)', 'Arc<T>'],
              ['Share across threads + mutate', 'Arc<Mutex<T>> or Arc<RwLock<T>>'],
            ].map((r) => (
              <tr key={r[1]} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ ...c, color: 'var(--fg-2)' }}>{r[0]}</td>
                <td style={c}><code style={{ color: 'var(--rust)' }}>{r[1]}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <Pill>Memory aid</Pill> <strong>Rc/Arc solve "who owns it" (sharing); RefCell/Mutex solve "who can change it"
        (mutability).</strong> Stack them together and you cover the vast majority of complex data structures.
      </p>

      <Quiz
        question="You're building a tree on a single thread. A parent node needs to be referenced by multiple children, and the node's contents will be mutated later. Which type combination fits best?"
        options={[
          { text: 'Box<Node>' },
          { text: 'Rc<RefCell<Node>>', correct: true },
          { text: 'Arc<Mutex<Node>>' },
          { text: 'A plain &mut Node' },
        ]}
        explain={
          <>
            "Referenced in multiple places" → you need <code>Rc</code> (multiple owners); "will be mutated later" → you need
            <code> RefCell</code> (interior mutability). Combine them into <code>Rc&lt;RefCell&lt;Node&gt;&gt;</code>.
            <code> Arc&lt;Mutex&gt;</code> is its cross-thread version — unnecessary and slower on a single thread. A plain
            <code> &mut</code> can't give you "multiple owners".
          </>
        }
      />

      <Callout kind="info" title="Key takeaways & next step">
        ① <code>Box</code> for the heap / recursion; ② <code>Rc</code>/<code>Arc</code> for shared ownership (reference
        counting); ③ <code>RefCell</code>/<code>Mutex</code> for interior mutability (the check is deferred to run time);
        ④ stack them to cover complex structures. Next chapter we'll fully unpack "how long a reference is allowed to live" —
        lifetimes.
      </Callout>
    </>
  )
}

const c = { padding: '7px 10px', verticalAlign: 'top' } as const
