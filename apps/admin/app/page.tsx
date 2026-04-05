const workbenches = [
  "内容资产工作台",
  "来源治理工作台",
  "AI 策略工作台",
  "问答诊断工作台",
];

export default function AdminHomePage() {
  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <h1>Tongfuli Admin</h1>
        <p>后台骨架先把工作台边界定住，后面再接权限、查询和发布链路。</p>
      </aside>
      <section className="content">
        <header>
          <p className="eyebrow">工作台入口</p>
          <h2>首期治理范围</h2>
        </header>
        <div className="grid">
          {workbenches.map((item) => (
            <article className="card" key={item}>
              <h3>{item}</h3>
              <p>这里会承接对应的列表、审核流、诊断视图和灰度发布操作。</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
