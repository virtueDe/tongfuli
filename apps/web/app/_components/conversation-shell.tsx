"use client";

import Link from "next/link";
import { startTransition, useState } from "react";

import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_MODE,
  type CharacterId,
  type ConversationMode,
  type SessionSummary,
  type TurnEvidence,
} from "@tongfuli/domain-sdk";

import {
  createSession,
  getTurnEvidence,
  streamTurn,
  switchCharacter,
  switchMode,
} from "../_lib/conversation-client";

type ViewStatus = "idle" | "creating" | "streaming" | "completed" | "error";
type MessageStatus = "completed" | "streaming" | "error";
type EvidenceStatus = "idle" | "loading" | "ready" | "error";

interface MessageItem {
  id: string;
  role: "assistant" | "user";
  content: string;
  status: MessageStatus;
}

const CHARACTER_OPTIONS: Array<{ id: CharacterId; name: string; blurb: string }> = [
  {
    id: "char_baizhantang",
    name: "白展堂",
    blurb: "嘴贫但机灵，适合问关系和局势判断。",
  },
  {
    id: "char_tongxiangyu",
    name: "佟湘玉",
    blurb: "更会掰扯人情世故，适合问客栈和人物心思。",
  },
  {
    id: "char_guofurong",
    name: "郭芙蓉",
    blurb: "语气更冲更直，适合问冲突和名场面。",
  },
];

const MODE_OPTIONS: Array<{ id: ConversationMode; name: string; blurb: string }> = [
  {
    id: "canon",
    name: "原剧模式",
    blurb: "优先贴原剧情和人物设定。",
  },
  {
    id: "extended",
    name: "扩展模式",
    blurb: "会补充背景、前因后果和关联信息。",
  },
  {
    id: "fun",
    name: "娱乐模式",
    blurb: "更轻松，适合玩梗和接话。",
  },
];

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "掌柜的催得紧，但你尽管开口。先问一句剧情、人物关系，或者先切个人物试试味道。",
    status: "completed",
  },
];

const QUICK_PROMPTS = [
  "老白为什么总怕佟掌柜？",
  "切到郭芙蓉的口吻，吐槽一下同福客栈。",
  "原剧模式下，莫小贝最怕谁？",
];

export function ConversationShell() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [preferredCharacterId, setPreferredCharacterId] =
    useState<CharacterId>(DEFAULT_CHARACTER_ID);
  const [preferredMode, setPreferredMode] =
    useState<ConversationMode>(DEFAULT_MODE);
  const [viewStatus, setViewStatus] = useState<ViewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [latestTurnId, setLatestTurnId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<TurnEvidence | null>(null);
  const [evidenceStatus, setEvidenceStatus] = useState<EvidenceStatus>("idle");
  const [evidenceError, setEvidenceError] = useState("");

  const isBusy = viewStatus === "creating" || viewStatus === "streaming";
  const currentCharacterId = session?.currentCharacter.id ?? preferredCharacterId;
  const currentMode = session?.currentMode ?? preferredMode;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = draft.trim();

    if (!input || isBusy) {
      return;
    }

    const assistantMessageId = `assistant_${crypto.randomUUID()}`;

    setDraft("");
    setErrorMessage("");
    setLatestTurnId(null);
    setEvidence(null);
    setEvidenceStatus("idle");
    setEvidenceError("");
    setMessages((current) => [
      ...current,
      {
        id: `user_${crypto.randomUUID()}`,
        role: "user",
        content: input,
        status: "completed",
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "streaming",
      },
    ]);

    try {
      const ensuredSession = await ensureSession();
      setViewStatus("streaming");

      await streamTurn({
        sessionId: ensuredSession.sessionId,
        request: {
          input,
          mode: currentMode,
          actingCharacterId: currentCharacterId,
          showEvidenceHint: true,
        },
        onEvent: (streamEvent) => {
          switch (streamEvent.type) {
            case "answer.metadata":
              setLatestTurnId(streamEvent.turnId);
              return;
            case "answer.delta":
              startTransition(() => {
                setMessages((current) =>
                  current.map((message) =>
                    message.id === assistantMessageId
                      ? {
                          ...message,
                          status: "streaming",
                          content: `${message.content}${streamEvent.delta}`,
                        }
                      : message,
                  ),
                );
              });
              return;
            case "answer.completed":
              setLatestTurnId(streamEvent.turnId);
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        status: "completed",
                        content: streamEvent.answer,
                      }
                    : message,
                ),
              );
              setViewStatus("completed");
              return;
            case "answer.error":
              throw new Error(streamEvent.message);
          }
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "对话链路失败，请稍后重试。";
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantMessageId
            ? {
                ...item,
                status: "error",
                content: item.content || "这回话没接住，你再发一遍。",
              }
            : item,
        ),
      );
      setErrorMessage(message);
      setViewStatus("error");
    }
  }

  async function handleCharacterSwitch(targetCharacterId: CharacterId) {
    if (isBusy || targetCharacterId === currentCharacterId) {
      return;
    }

    setErrorMessage("");
    setPreferredCharacterId(targetCharacterId);

    if (!session) {
      return;
    }

    try {
      setViewStatus("creating");
      const updated = await switchCharacter(session.sessionId, { targetCharacterId });
      setSession(updated);
      setViewStatus("completed");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "切换角色失败，请稍后重试。",
      );
      setViewStatus("error");
    }
  }

  async function handleModeSwitch(targetMode: ConversationMode) {
    if (isBusy || targetMode === currentMode) {
      return;
    }

    setErrorMessage("");
    setPreferredMode(targetMode);

    if (!session) {
      return;
    }

    try {
      setViewStatus("creating");
      const updated = await switchMode(session.sessionId, { targetMode });
      setSession(updated);
      setViewStatus("completed");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "切换模式失败，请稍后重试。",
      );
      setViewStatus("error");
    }
  }

  async function handleLoadEvidence() {
    if (!latestTurnId || evidenceStatus === "loading") {
      return;
    }

    setEvidenceStatus("loading");
    setEvidenceError("");

    try {
      const payload = await getTurnEvidence(latestTurnId);
      setEvidence(payload);
      setEvidenceStatus("ready");
    } catch (error) {
      setEvidence(null);
      setEvidenceStatus("error");
      setEvidenceError(
        error instanceof Error ? error.message : "读取依据失败，请稍后重试。",
      );
    }
  }

  async function ensureSession(): Promise<SessionSummary> {
    if (session) {
      return session;
    }

    setViewStatus("creating");
    const created = await createSession({
      initialCharacterId: preferredCharacterId,
      initialMode: preferredMode,
    });
    setSession(created);
    return created;
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Tongfuli / 主对话入口</p>
        <h1>和《武林外传》里的人物直接开聊</h1>
        <p className="lead">
          这版把主链路往前推了一步：匿名进入、自动建会话、角色切换、模式切换、流式拿回答，还能展开最近一轮的依据提示。
        </p>
        <div className="hero-actions">
          <Link className="hero-link" href="/topics">
            先看专题入口
          </Link>
          <Link className="hero-link" href="/share/laobai-fear-chain">
            看分享落地页
          </Link>
        </div>
      </section>

      <section className="control-panel">
        <article className="selector-card">
          <div className="selector-header">
            <div>
              <p className="panel-label">当前角色</p>
              <strong>{findCharacterName(currentCharacterId)}</strong>
            </div>
            <span className="selector-tip">
              {session ? "已绑定到当前会话" : "会在首轮提问时带入"}
            </span>
          </div>
          <div className="selector-grid">
            {CHARACTER_OPTIONS.map((character) => (
              <button
                key={character.id}
                type="button"
                className={`selector-chip ${character.id === currentCharacterId ? "active" : ""}`}
                onClick={() => void handleCharacterSwitch(character.id)}
                disabled={isBusy}
              >
                <strong>{character.name}</strong>
                <span>{character.blurb}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="selector-card">
          <div className="selector-header">
            <div>
              <p className="panel-label">当前模式</p>
              <strong>{findModeName(currentMode)}</strong>
            </div>
            <span className="selector-tip">先切风格，再继续追问</span>
          </div>
          <div className="selector-grid">
            {MODE_OPTIONS.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`selector-chip ${mode.id === currentMode ? "active" : ""}`}
                onClick={() => void handleModeSwitch(mode.id)}
                disabled={isBusy}
              >
                <strong>{mode.name}</strong>
                <span>{mode.blurb}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="conversation-layout">
        <section className="conversation-panel">
          <header className="panel-header">
            <div>
              <span className="panel-label">当前由谁回答</span>
              <strong>{findCharacterName(currentCharacterId)}</strong>
            </div>
            <div>
              <span className="panel-label">模式</span>
              <strong>{findModeName(currentMode)}</strong>
            </div>
            <div>
              <span className="panel-label">状态</span>
              <strong>{renderStatusLabel(viewStatus)}</strong>
            </div>
          </header>

          <div className="quick-prompt-row">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="ghost-chip"
                onClick={() => setDraft(prompt)}
                disabled={isBusy}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="message-list" aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`message ${message.role} ${message.status}`}
              >
                <p className="message-role">
                  {message.role === "assistant"
                    ? findCharacterName(currentCharacterId)
                    : "你"}
                </p>
                <p className="message-content">
                  {message.content || "正在组织回答..."}
                </p>
              </article>
            ))}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="问点剧情、关系、梗，或者先切角色再继续聊"
              aria-label="主对话输入框"
              disabled={isBusy}
            />
            <button type="submit" disabled={isBusy || !draft.trim()}>
              {viewStatus === "creating" ? "建会话中" : isBusy ? "回答中" : "发送"}
            </button>
          </form>

          {errorMessage ? (
            <p className="error-banner" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <aside className="evidence-panel">
          <header className="evidence-header">
            <div>
              <p className="panel-label">依据展开</p>
              <h2>最近一轮回答依据</h2>
            </div>
            <button
              type="button"
              className="evidence-button"
              onClick={() => void handleLoadEvidence()}
              disabled={!latestTurnId || evidenceStatus === "loading"}
            >
              {evidenceStatus === "loading"
                ? "读取中"
                : evidence
                  ? "刷新依据"
                  : "展开依据"}
            </button>
          </header>

          {latestTurnId ? (
            <p className="evidence-hint">当前轮次：{latestTurnId}</p>
          ) : (
            <p className="evidence-hint">先完成一轮对话，再展开依据。</p>
          )}

          {evidenceStatus === "error" ? (
            <p className="error-banner" role="alert">
              {evidenceError}
            </p>
          ) : null}

          {evidence?.items?.length ? (
            <div className="evidence-list">
              {evidence.items.map((item) => (
                <article className="evidence-card" key={item.evidenceId}>
                  <span className={`evidence-tag ${item.sourceType}`}>
                    {renderEvidenceLabel(item.sourceType)}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.snippet}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-evidence">
              <p>这块会显示问题锚点、角色口吻和模式约束。</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function renderStatusLabel(status: ViewStatus): string {
  switch (status) {
    case "creating":
      return "创建会话中";
    case "streaming":
      return "回答生成中";
    case "completed":
      return "本轮完成";
    case "error":
      return "需要重试";
    case "idle":
    default:
      return "等待提问";
  }
}

function findCharacterName(characterId: CharacterId): string {
  return (
    CHARACTER_OPTIONS.find((character) => character.id === characterId)?.name ??
    "白展堂"
  );
}

function findModeName(mode: ConversationMode): string {
  return MODE_OPTIONS.find((item) => item.id === mode)?.name ?? "原剧模式";
}

function renderEvidenceLabel(sourceType: string): string {
  switch (sourceType) {
    case "canonical":
      return "剧情";
    case "character":
      return "角色";
    case "mode":
      return "模式";
    default:
      return "依据";
  }
}
