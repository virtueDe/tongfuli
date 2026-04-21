import { Button, Input, Picker, ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_MODE,
  type CharacterId,
  type ConversationMode,
  type RecentSessionSummary,
  type SessionSummary,
  type TurnEvidence,
} from "@tongfuli/domain-sdk";

import {
  createSession,
  getMiniappDeviceId,
  getTurnEvidence,
  listRecentSessions,
  sendTurn,
  submitFeedback,
  switchCharacter,
  switchMode,
} from "../../lib/public-conversation-client";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

const CHARACTER_OPTIONS: Array<{ label: string; value: CharacterId }> = [
  { label: "白展堂", value: "char_baizhantang" },
  { label: "佟湘玉", value: "char_tongxiangyu" },
  { label: "郭芙蓉", value: "char_guofurong" },
];

const MODE_OPTIONS: Array<{ label: string; value: ConversationMode }> = [
  { label: "原剧模式", value: "canon" },
  { label: "扩展模式", value: "extended" },
  { label: "娱乐模式", value: "fun" },
];

const QUICK_PROMPTS = [
  "老白为什么总怕佟掌柜？",
  "切成郭芙蓉口气，吐槽一下客栈。",
  "原剧模式下，小贝最怕谁？",
];

export default function IndexPage() {
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSessionSummary[]>([]);
  const [characterId, setCharacterId] = useState<CharacterId>(DEFAULT_CHARACTER_ID);
  const [mode, setMode] = useState<ConversationMode>(DEFAULT_MODE);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "小程序这版先把主对话、最近会话和分享承接入口接起来。",
    },
  ]);
  const [latestTurnId, setLatestTurnId] = useState("");
  const [evidence, setEvidence] = useState<TurnEvidence | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadRecentSessions();
  }, []);

  async function loadRecentSessions() {
    try {
      const items = await listRecentSessions();
      setRecentSessions(items);
    } catch {
      setRecentSessions([]);
    }
  }

  async function ensureSession(): Promise<SessionSummary> {
    if (session) {
      return session;
    }

    const created = await createSession({
      deviceId: getMiniappDeviceId(),
      initialCharacterId: characterId,
      initialMode: mode,
    });
    setSession(created);
    return created;
  }

  async function handleSend() {
    const input = draft.trim();

    if (!input || busy) {
      return;
    }

    setBusy(true);
    setFeedbackMessage("");
    setDraft("");
    setEvidence(null);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: input },
    ]);

    try {
      const activeSession = await ensureSession();
      const result = await sendTurn(activeSession.sessionId, input, characterId, mode);
      setLatestTurnId(result.turnId);
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: result.answer },
      ]);
      await loadRecentSessions();
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "发送失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleCharacterChange(event: { detail: { value: string } }) {
    const nextCharacter = CHARACTER_OPTIONS[Number(event.detail.value)]?.value ?? DEFAULT_CHARACTER_ID;
    setCharacterId(nextCharacter);

    if (!session) {
      return;
    }

    try {
      const updated = await switchCharacter(session.sessionId, nextCharacter);
      setSession(updated);
      setFeedbackMessage(`当前角色已切到 ${findCharacterName(nextCharacter)}`);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "角色切换失败");
    }
  }

  async function handleModeChange(event: { detail: { value: string } }) {
    const nextMode = MODE_OPTIONS[Number(event.detail.value)]?.value ?? DEFAULT_MODE;
    setMode(nextMode);

    if (!session) {
      return;
    }

    try {
      const updated = await switchMode(session.sessionId, nextMode);
      setSession(updated);
      setFeedbackMessage(`当前模式已切到 ${findModeName(nextMode)}`);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "模式切换失败");
    }
  }

  async function handleLoadEvidence() {
    if (!latestTurnId) {
      setFeedbackMessage("先完成一轮回答，再看依据。");
      return;
    }

    try {
      const detail = await getTurnEvidence(latestTurnId);
      setEvidence(detail);
      setFeedbackMessage(`已加载 ${detail.items.length} 条依据`);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "读取依据失败");
    }
  }

  async function handleFeedback() {
    if (!latestTurnId) {
      setFeedbackMessage("还没有可反馈的回答。");
      return;
    }

    try {
      const receipt = await submitFeedback(
        latestTurnId,
        "incorrect_fact",
        "小程序首版反馈入口验证",
      );
      setFeedbackMessage(`反馈已记录：${receipt.feedbackType}`);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "提交反馈失败");
    }
  }

  return (
    <ScrollView scrollY style={{ height: "100vh", backgroundColor: "#f6efe5" }}>
      <View style={styles.page}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Tongfuli / Miniapp</Text>
          <Text style={styles.title}>小程序主对话页</Text>
          <Text style={styles.lead}>
            这版先把主对话、角色模式切换、最近会话、依据和反馈入口接起来，并补分享承接页。
          </Text>
          <Button
            style={styles.shareButton}
            onClick={() => Taro.navigateTo({ url: "/pages/share/index?slug=laobai-fear-chain" })}
          >
            打开分享承接页
          </Button>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>对话配置</Text>
          <View style={styles.inlineGrid}>
            <View style={styles.selector}>
              <Text style={styles.label}>角色</Text>
              <Picker
                mode="selector"
                range={CHARACTER_OPTIONS.map((item) => item.label)}
                onChange={handleCharacterChange}
              >
                <View style={styles.pickerValue}>{findCharacterName(characterId)}</View>
              </Picker>
            </View>

            <View style={styles.selector}>
              <Text style={styles.label}>模式</Text>
              <Picker
                mode="selector"
                range={MODE_OPTIONS.map((item) => item.label)}
                onChange={handleModeChange}
              >
                <View style={styles.pickerValue}>{findModeName(mode)}</View>
              </Picker>
            </View>
          </View>

          <View style={styles.chipRow}>
            {QUICK_PROMPTS.map((prompt) => (
              <Button key={prompt} style={styles.chipButton} onClick={() => setDraft(prompt)}>
                {prompt}
              </Button>
            ))}
          </View>

          <Input
            value={draft}
            placeholder="问剧情、玩梗，或者切角色继续聊"
            onInput={(event) => setDraft(event.detail.value)}
            style={styles.input}
          />
          <Button style={styles.primaryButton} onClick={handleSend} loading={busy}>
            {busy ? "发送中" : "发送问题"}
          </Button>
          <View style={styles.actionRow}>
            <Button style={styles.secondaryButton} onClick={handleLoadEvidence}>
              展开依据
            </Button>
            <Button style={styles.secondaryButton} onClick={handleFeedback}>
              提交反馈
            </Button>
          </View>
          {feedbackMessage ? <Text style={styles.feedback}>{feedbackMessage}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>对话记录</Text>
          <View style={styles.messageList}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={message.role === "assistant" ? styles.assistantBubble : styles.userBubble}
              >
                <Text style={styles.messageRole}>
                  {message.role === "assistant" ? findCharacterName(characterId) : "你"}
                </Text>
                <Text style={styles.messageContent}>{message.content}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.inlineGrid}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>最近会话</Text>
            {recentSessions.length ? (
              recentSessions.map((item) => (
                <View key={item.sessionId} style={styles.resultCard}>
                  <Text style={styles.resultTitle}>{item.sessionId}</Text>
                  <Text style={styles.resultText}>
                    {findCharacterName(item.currentCharacter.id)} / {findModeName(item.currentMode)}
                  </Text>
                  <Text style={styles.resultText}>{item.updatedAt}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>当前设备还没有最近会话。</Text>
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>最近一轮依据</Text>
            {evidence?.items?.length ? (
              evidence.items.map((item) => (
                <View key={item.evidenceId} style={styles.resultCard}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultText}>{item.snippet}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>展开依据后会显示剧情锚点、角色口吻和模式约束。</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function findCharacterName(characterId: CharacterId): string {
  return CHARACTER_OPTIONS.find((item) => item.value === characterId)?.label ?? "白展堂";
}

function findModeName(mode: ConversationMode): string {
  return MODE_OPTIONS.find((item) => item.value === mode)?.label ?? "原剧模式";
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  hero: {
    backgroundColor: "#fff9f0",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 12px 28px rgba(88, 51, 29, 0.08)",
  },
  eyebrow: {
    color: "#9d3d2f",
    fontSize: "12px",
    fontWeight: "700",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2b2119",
  },
  lead: {
    color: "#5f544b",
    lineHeight: "1.6",
  },
  shareButton: {
    backgroundColor: "#f2dfcf",
    color: "#7b321f",
    borderRadius: "999px",
  },
  panel: {
    backgroundColor: "#fffdf8",
    borderRadius: "22px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  panelTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2b2119",
  },
  inlineGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  selector: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#7b321f",
  },
  pickerValue: {
    padding: "12px 14px",
    borderRadius: "14px",
    backgroundColor: "#f4ece1",
    color: "#2b2119",
  },
  chipRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chipButton: {
    backgroundColor: "#f4ece1",
    color: "#573a2a",
    borderRadius: "999px",
    fontSize: "14px",
  },
  input: {
    backgroundColor: "#f9f4ec",
    borderRadius: "16px",
    padding: "12px 14px",
  },
  primaryButton: {
    backgroundColor: "#9d3d2f",
    color: "#fff",
    borderRadius: "999px",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#f2dfcf",
    color: "#7b321f",
    borderRadius: "999px",
  },
  feedback: {
    color: "#7b321f",
    lineHeight: "1.6",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  assistantBubble: {
    backgroundColor: "#f4ece1",
    borderRadius: "18px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  userBubble: {
    backgroundColor: "#eed8c4",
    borderRadius: "18px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignSelf: "flex-end",
  },
  messageRole: {
    color: "#9d3d2f",
    fontSize: "13px",
    fontWeight: "700",
  },
  messageContent: {
    color: "#2b2119",
    lineHeight: "1.7",
  },
  resultCard: {
    backgroundColor: "#f7efe5",
    borderRadius: "16px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  resultTitle: {
    color: "#2b2119",
    fontWeight: "700",
  },
  resultText: {
    color: "#5f544b",
    lineHeight: "1.6",
  },
  emptyText: {
    color: "#6f6258",
    lineHeight: "1.6",
  },
};
