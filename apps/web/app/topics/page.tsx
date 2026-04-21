import Link from "next/link";

import { TOPIC_FEATURES } from "../_lib/topic-content";

export const metadata = {
  title: "Tongfuli Topics",
  description: "同福里专题页，按梗、人物关系和名场面组织内容入口。",
};

export default function TopicsPage() {
  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Tongfuli / Topics</p>
        <h1>先逛专题，再进对话</h1>
        <p className="lead">
          这版先把梗专题入口和分享落地页补起来，让用户能先从一个明确话题切入，再回到主对话继续追问。
        </p>
        <div className="hero-actions">
          <Link className="hero-link primary" href="/">
            回主对话页
          </Link>
        </div>
      </section>

      <section className="topic-grid">
        {TOPIC_FEATURES.map((topic) => (
          <article className="topic-card" key={topic.slug}>
            <p className="topic-kicker">专题入口</p>
            <h2>{topic.title}</h2>
            <p className="topic-summary">{topic.summary}</p>
            <p className="topic-angle">{topic.angle}</p>
            <dl className="topic-meta">
              <div>
                <dt>建议角色</dt>
                <dd>{renderCharacterName(topic.suggestedCharacterId)}</dd>
              </div>
              <div>
                <dt>建议模式</dt>
                <dd>{renderModeName(topic.suggestedMode)}</dd>
              </div>
            </dl>
            <p className="topic-question">推荐追问：{topic.sampleQuestion}</p>
            <div className="card-actions">
              <Link className="hero-link primary" href={`/share/${topic.slug}`}>
                看分享落地页
              </Link>
              <Link className="hero-link" href="/">
                去主对话页
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function renderCharacterName(characterId: string): string {
  switch (characterId) {
    case "char_tongxiangyu":
      return "佟湘玉";
    case "char_guofurong":
      return "郭芙蓉";
    case "char_baizhantang":
    default:
      return "白展堂";
  }
}

function renderModeName(mode: string): string {
  switch (mode) {
    case "extended":
      return "扩展模式";
    case "fun":
      return "娱乐模式";
    case "canon":
    default:
      return "原剧模式";
  }
}
