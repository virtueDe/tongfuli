import Link from "next/link";
import { notFound } from "next/navigation";

import { findTopicBySlug } from "../../_lib/topic-content";

interface SharePageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug } = await params;
  const topic = findTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="share-hero">
        <p className="eyebrow">Tongfuli / Share</p>
        <h1>{topic.shareTitle}</h1>
        <p className="lead">{topic.shareExcerpt}</p>
        <div className="share-highlight">
          <span>建议角色：{renderCharacterName(topic.suggestedCharacterId)}</span>
          <span>建议模式：{renderModeName(topic.suggestedMode)}</span>
        </div>
      </section>

      <section className="share-layout">
        <article className="share-card">
          <p className="topic-kicker">话题切口</p>
          <h2>{topic.title}</h2>
          <p className="topic-summary">{topic.summary}</p>
          <p className="topic-angle">{topic.angle}</p>
        </article>

        <article className="share-card">
          <p className="topic-kicker">推荐追问</p>
          <blockquote className="share-question">{topic.sampleQuestion}</blockquote>
          <p className="share-note">
            这版分享页先承担落地说明和引流职责，用户回到主对话页后可直接继续追问。
          </p>
          <div className="card-actions">
            <Link className="hero-link primary" href="/">
              打开主对话页
            </Link>
            <Link className="hero-link" href="/topics">
              查看更多专题
            </Link>
          </div>
        </article>
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
