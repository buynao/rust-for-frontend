import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz } from '../../components/Ui'
import { useLang } from '../../i18n/lang'

export default function AsyncConcurrency() {
  return useLang() === 'en' ? <En /> : <Zh />
}

function Zh() {
  return (
    <>
      <p>
        前端是单线程的(主线程 + Web Worker),你靠 <code>async/await</code> 处理并发。Rust 既有
        和你几乎一样的 <code>async/await</code>,又能真正用<strong>多线程</strong>跑满 CPU——
        而且编译器保证你不会写出数据竞争。这一章建立直觉即可,细节按需深入。
      </p>

      <h2>async/await:语法似曾相识</h2>
      <Compare
        js={`async function fetchUser(id) {
  const res = await fetch(\`/u/\${id}\`);
  const user = await res.json();
  return user;
}`}
        rust={`async fn fetch_user(id: u32) -> Result<User, Error> {
    let res = reqwest::get(format!("/u/{id}")).await?;
    let user = res.json().await?;
    Ok(user)
}`}
        note="结构几乎一样:async fn、.await、配合 ? 传播错误。最大区别在「什么时候开始跑」——见下。"
      />

      <KeyTerm term="Future:惰性的 Promise" en="Future" analogy="JS 的 Promise 一创建就开始执行;Rust 的 Future 在被 .await(或交给运行时)之前完全不动。">
        调用 <code>async fn</code> 返回一个 <strong>Future</strong>,它描述「将来会产出一个值」,但<strong>本身是惰性的</strong>——
        必须有「执行器」去推动(poll)它才会运行。这和迭代器的惰性是同一种哲学。
      </KeyTerm>

      <Callout kind="warn" title="需要一个异步运行时">
        JS 内置了事件循环,<code>async</code> 开箱即用。Rust <strong>标准库不带</strong>异步运行时,
        你要引入一个,最主流的是 <strong>Tokio</strong>。它提供事件循环、定时器、异步 IO。
      </Callout>
      <CodeBlock
        title="用 Tokio 跑 async main"
        code={`// Cargo.toml: tokio = { version = "1", features = ["full"] }

#[tokio::main]   // 这个宏帮你启动运行时
async fn main() {
    let user = fetch_user(1).await.unwrap();
    println!("{:?}", user);
}`}
      />

      <h2>并发:同时发起多个任务</h2>
      <Compare
        js={`// 并行等待多个 Promise
const [a, b] = await Promise.all([
  fetchUser(1),
  fetchUser(2),
]);`}
        rust={`// tokio::join! 同时驱动多个 Future
let (a, b) = tokio::join!(
    fetch_user(1),
    fetch_user(2),
);`}
        note="Promise.all ↔ join!(全部完成);Promise.race ↔ tokio::select!(谁先好用谁)。心智模型完全可迁移。"
      />

      <h2>真·多线程:JS 给不了的能力</h2>
      <p>
        JS 主线程只有一个,重活得丢给 Web Worker 并用消息通信。Rust 可以直接开系统线程,
        共享内存——但「共享可变状态」正是并发 bug 的温床。Rust 的杀手锏是:<strong>把这类 bug 变成编译错误</strong>。
      </p>
      <CodeBlock
        runnable
        title="开线程并安全地共享数据"
        code={`use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // Arc = 可跨线程共享的引用计数;Mutex = 互斥锁
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut n = c.lock().unwrap(); // 拿锁才能改
            *n += 1;
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("最终计数 = {}", *counter.lock().unwrap());
}`}
        output={`最终计数 = 5`}
      />

      <KeyTerm term="无畏并发" en="fearless concurrency" analogy="如果两个线程可能同时读写同一份数据而没加锁,Rust 直接拒绝编译——你想犯错都难。">
        靠两个标记 trait:<code>Send</code>(能否被移动到别的线程)和 <code>Sync</code>(能否被多线程共享引用)。
        编译器用它们做检查:忘了加锁就跨线程共享可变数据?<strong>编译不过</strong>。这就是为什么 Rust 敢叫「无畏并发」——
        正确性由类型系统兜底,而不是靠程序员小心翼翼。
      </KeyTerm>

      <h2>线程间通信:channel</h2>
      <p>除了共享内存 + 锁,Rust 也推崇「用通信代替共享」,类似 Worker 的 <code>postMessage</code>:</p>
      <CodeBlock
        code={`use std::sync::mpsc;   // multi-producer, single-consumer
use std::thread;

let (tx, rx) = mpsc::channel();
thread::spawn(move || {
    tx.send("来自子线程的问候").unwrap();  // 发送
});
println!("{}", rx.recv().unwrap());        // 接收(阻塞等待)`}
      />

      <Quiz
        question="JS 的 Promise 和 Rust 的 Future,最关键的行为差异是?"
        options={[
          { text: 'Future 不能返回值' },
          { text: 'Promise 一旦创建就立即开始执行;Future 是惰性的,必须被 .await 或交给运行时驱动才会运行', correct: true },
          { text: 'Future 只能用于网络请求' },
          { text: '它们完全一样,没有区别' },
        ]}
        explain={
          <>
            JS 里 <code>const p = fetch(...)</code> 这一刻请求就发出去了。Rust 里
            <code>let f = fetch_user(1)</code> 只是造了个「待办」,不 <code>.await</code> 它就永远不会执行。
            这也是为什么 Rust 需要一个运行时(如 Tokio)来「推动」这些 Future。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① <code>async/await</code> 语法和 JS 高度相似;② Future 惰性,需要运行时(Tokio);③ 真多线程 + <code>Arc</code>/<code>Mutex</code>/channel;
        ④ <code>Send</code>/<code>Sync</code> 让数据竞争变成编译错误。下一章讲工程化——模块系统、内置测试与文档,为真实项目做准备。
      </Callout>
    </>
  )
}

function En() {
  return (
    <>
      <p>
        The frontend is single-threaded (main thread + Web Workers), and you handle
        concurrency with <code>async/await</code>. Rust gives you an{' '}
        <code>async/await</code> that looks almost identical, but it can also use{' '}
        <strong>real threads</strong> to saturate every CPU core — and the compiler
        guarantees you won't write a data race. This chapter is about building
        intuition; dig into the details when you need them.
      </p>

      <h2>async/await: the syntax feels familiar</h2>
      <Compare
        js={`async function fetchUser(id) {
  const res = await fetch(\`/u/\${id}\`);
  const user = await res.json();
  return user;
}`}
        rust={`async fn fetch_user(id: u32) -> Result<User, Error> {
    let res = reqwest::get(format!("/u/{id}")).await?;
    let user = res.json().await?;
    Ok(user)
}`}
        note="The shape is nearly the same: async fn, .await, and ? to propagate errors. The biggest difference is when it starts running — see below."
      />

      <KeyTerm term="Future: a lazy Promise" en="Future" analogy="A JS Promise starts executing the moment it's created; a Rust Future does nothing until it's .awaited (or handed to a runtime).">
        Calling an <code>async fn</code> returns a <strong>Future</strong>, which describes "a value that will be produced later" — but it's <strong>lazy by itself</strong>: an "executor" has to drive (poll) it before anything runs. This is the same philosophy as lazy iterators.
      </KeyTerm>

      <Callout kind="warn" title="You need an async runtime">
        JS has the event loop built in, so <code>async</code> works out of the box. Rust's <strong>standard library does not ship</strong> an async runtime — you bring one in, and the most popular by far is <strong>Tokio</strong>. It provides the event loop, timers, and async IO.
      </Callout>
      <CodeBlock
        title="Running an async main with Tokio"
        code={`// Cargo.toml: tokio = { version = "1", features = ["full"] }

#[tokio::main]   // this macro starts the runtime for you
async fn main() {
    let user = fetch_user(1).await.unwrap();
    println!("{:?}", user);
}`}
      />

      <h2>Concurrency: kicking off several tasks at once</h2>
      <Compare
        js={`// wait on multiple Promises in parallel
const [a, b] = await Promise.all([
  fetchUser(1),
  fetchUser(2),
]);`}
        rust={`// tokio::join! drives multiple Futures at once
let (a, b) = tokio::join!(
    fetch_user(1),
    fetch_user(2),
);`}
        note="Promise.all ↔ join! (wait for all); Promise.race ↔ tokio::select! (whoever finishes first wins). The mental model carries over completely."
      />

      <h2>True multithreading: a power JS can't give you</h2>
      <p>
        JS has exactly one main thread, so heavy work gets offloaded to a Web Worker
        and shuttled around via messages. Rust can spawn OS threads directly and
        share memory — but "shared mutable state" is exactly where concurrency bugs
        breed. Rust's killer move: <strong>it turns that whole class of bug into a
        compile error</strong>.
      </p>
      <CodeBlock
        runnable
        title="Spawning threads and sharing data safely"
        code={`use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // Arc = reference count you can share across threads; Mutex = a mutual-exclusion lock
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let c = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut n = c.lock().unwrap(); // you must hold the lock to mutate
            *n += 1;
        }));
    }
    for h in handles { h.join().unwrap(); }
    println!("final count = {}", *counter.lock().unwrap());
}`}
        output={`final count = 5`}
      />

      <KeyTerm term="Fearless concurrency" en="fearless concurrency" analogy="If two threads could read/write the same data at the same time without a lock, Rust simply refuses to compile — making the mistake is hard even when you try.">
        It rests on two marker traits: <code>Send</code> (can this be moved to another thread?) and <code>Sync</code> (can this be shared by reference across threads?). The compiler uses them to check your code: forgot a lock and shared mutable data across threads? <strong>It won't compile.</strong> That's why Rust dares to call it "fearless concurrency" — correctness is backed by the type system, not by a programmer treading carefully.
      </KeyTerm>

      <h2>Talking between threads: channels</h2>
      <p>Besides shared memory + locks, Rust also champions "communicate instead of share," much like a Worker's <code>postMessage</code>:</p>
      <CodeBlock
        code={`use std::sync::mpsc;   // multi-producer, single-consumer
use std::thread;

let (tx, rx) = mpsc::channel();
thread::spawn(move || {
    tx.send("greetings from the child thread").unwrap();  // send
});
println!("{}", rx.recv().unwrap());        // receive (blocks and waits)`}
      />

      <Quiz
        question="What's the key behavioral difference between a JS Promise and a Rust Future?"
        options={[
          { text: "A Future can't return a value" },
          { text: 'A Promise starts executing the moment it is created; a Future is lazy and only runs once it is .awaited or driven by a runtime', correct: true },
          { text: 'A Future can only be used for network requests' },
          { text: 'They are exactly the same, no difference' },
        ]}
        explain={
          <>
            In JS, <code>const p = fetch(...)</code> fires the request right then and
            there. In Rust, <code>let f = fetch_user(1)</code> just builds a "to-do" —
            if you never <code>.await</code> it, it never runs. That's also why Rust
            needs a runtime (like Tokio) to "drive" these Futures.
          </>
        }
      />

      <Callout kind="info" title="Key takeaways & what's next">
        ① <code>async/await</code> syntax is very close to JS; ② Futures are lazy and need a runtime (Tokio); ③ real multithreading + <code>Arc</code>/<code>Mutex</code>/channels; ④ <code>Send</code>/<code>Sync</code> turn data races into compile errors. Next chapter is about engineering for real projects — the module system, built-in testing, and documentation.
      </Callout>
    </>
  )
}
