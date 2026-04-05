export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Tongfuli / 主对话入口</p>
        <h1>和《武林外传》里的人物直接开聊</h1>
        <p className="lead">
          这里是 Web 主站骨架。后续会接入角色切换、模式切换、依据展开、专题页和分享承接。
        </p>
      </section>
      <section className="conversation-panel">
        <header className="panel-header">
          <span>当前角色：白展堂</span>
          <span>模式：原剧模式</span>
        </header>
        <div className="message-list">
          <article className="message assistant">
            掌柜的面前，很多话不好瞎说。这里先把主对话页骨架搭起来，后面再接真实问答链路。
          </article>
        </div>
        <form className="composer">
          <input
            type="text"
            placeholder="问点剧情、关系、梗，或者直接和角色聊天"
            aria-label="主对话输入框"
          />
          <button type="button">发送</button>
        </form>
      </section>
    </main>
  );
}
