"use client";

import { startTransition, useState } from "react";

import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_MODE,
  type CharacterId,
  type ConversationMode,
  type SessionSummary,
} from "@tongfuli/domain-sdk";

import { createSession, streamTurn } from "../_lib/conversation-client";

type ViewStatus = "idle" | "creating" | "streaming" | "completed" | "error";
type MessageStatus = "completed" | "streaming" | "error";

interface MessageItem {
  id: string;
  role: "assistant" | "user";
  content: string;
  status: MessageStatus;
}

const CHARACTER_NAME_MAP: Record<CharacterId, string> = {
  char_baizhantang: "白展堂",
  char_tongxiangyu: "佟湘玉",
  char_guofurong: "郭芙蓉",
};

const MODE_NAME_MAP: Record<ConversationMode, string> = {
  canon: "原剧模式",
  extended: "扩展模式",
  fun: "轻松模式",
};

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "掌柜的催得紧，但你尽管开口。先问一句剧情、人物关系，或者直接和老白聊聊。",
    status: "completed",
  },
];

export function ConversationShell() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [viewStatus, setViewStatus] = useState<ViewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isBusy = viewStatus === "creating" || viewStatus === "streaming";
  const currentCharacterId = session?.currentCharacter.id ?? DEFAULT_CHARACTER_ID;
  const currentMode = session?.currentMode ?? DEFAULT_MODE;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = draft.trim();

    if (!input || isBusy) {
      return;
    }

    const assistantMessageId = `assistant_${crypto.randomUUID()}`;

    setDraft("");
    setErrorMessage("");
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
          mode: ensuredSession.currentMode,
          actingCharacterId: ensuredSession.currentCharacter.id,
          showEvidenceHint: false,
        },
        onEvent: (streamEvent) => {
          switch (streamEvent.type) {
            case "answer.metadata":
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

  async function ensureSession(): Promise<SessionSummary> {
    if (session) {
      return session;
    }

    setViewStatus("creating");
    const created = await createSession();
    setSession(created);
    return created;
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <p className="eyebrow">Tongfuli / 主对话入口</p>
        <h1>和《武林外传》里的人物直接开聊</h1>
        <p className="lead">
          首轮只打通最短真实链路：匿名进入、自动建会话、流式拿回答。先把人真正聊起来，再扩别的花活。
        </p>
      </section>

      <section className="conversation-panel">
        <header className="panel-header">
          <div>
            <span className="panel-label">当前角色</span>
            <strong>{CHARACTER_NAME_MAP[currentCharacterId]}</strong>
          </div>
          <div>
            <span className="panel-label">模式</span>
            <strong>{MODE_NAME_MAP[currentMode]}</strong>
          </div>
          <div>
            <span className="panel-label">状态</span>
            <strong>{renderStatusLabel(viewStatus)}</strong>
          </div>
        </header>

        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`message ${message.role} ${message.status}`}
            >
              <p className="message-role">
                {message.role === "assistant" ? "同福里" : "你"}
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
            placeholder="问点剧情、关系、梗，或者直接和角色聊天"
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
