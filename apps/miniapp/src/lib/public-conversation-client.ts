import Taro from "@tarojs/taro";

import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_MODE,
  type CharacterId,
  type ConversationMode,
  type CreateSessionRequest,
  type RecentSessionSummary,
  type SessionSummary,
  type TurnEvidence,
  type TurnFeedbackReceipt,
} from "@tongfuli/domain-sdk";

const BASE_URL =
  process.env.TARO_APP_CORE_PLATFORM_BASE_URL ?? "http://127.0.0.1:8080";

export interface SendTurnResult {
  turnId: string;
  answer: string;
}

export function getMiniappDeviceId(): string {
  const storageKey = "tongfuli-miniapp-device-id";
  const cached = Taro.getStorageSync<string>(storageKey);

  if (cached) {
    return cached;
  }

  const created = `miniapp_${Date.now().toString(36)}`;
  Taro.setStorageSync(storageKey, created);
  return created;
}

export async function createSession(
  request: Partial<CreateSessionRequest> = {},
): Promise<SessionSummary> {
  return requestJson<SessionSummary>("/api/v1/public/sessions", {
    method: "POST",
    data: {
      clientType: "miniapp",
      initialMode: request.initialMode ?? DEFAULT_MODE,
      initialCharacterId: request.initialCharacterId ?? DEFAULT_CHARACTER_ID,
      deviceId: request.deviceId ?? getMiniappDeviceId(),
    },
  });
}

export async function switchCharacter(
  sessionId: string,
  targetCharacterId: CharacterId,
): Promise<SessionSummary> {
  return requestJson<SessionSummary>(
    `/api/v1/public/sessions/${sessionId}/character-switch`,
    {
      method: "POST",
      data: { targetCharacterId },
    },
  );
}

export async function switchMode(
  sessionId: string,
  targetMode: ConversationMode,
): Promise<SessionSummary> {
  return requestJson<SessionSummary>(
    `/api/v1/public/sessions/${sessionId}/mode-switch`,
    {
      method: "POST",
      data: { targetMode },
    },
  );
}

export async function listRecentSessions(): Promise<RecentSessionSummary[]> {
  const deviceId = getMiniappDeviceId();
  return requestJson<RecentSessionSummary[]>(
    `/api/v1/public/sessions/recent?deviceId=${encodeURIComponent(deviceId)}`,
  );
}

export async function getTurnEvidence(turnId: string): Promise<TurnEvidence> {
  return requestJson<TurnEvidence>(`/api/v1/public/turns/${turnId}/evidence`);
}

export async function submitFeedback(
  turnId: string,
  feedbackType: string,
  note: string,
): Promise<TurnFeedbackReceipt> {
  return requestJson<TurnFeedbackReceipt>(`/api/v1/public/turns/${turnId}/feedback`, {
    method: "POST",
    data: {
      feedbackType,
      note,
    },
  });
}

export async function sendTurn(
  sessionId: string,
  input: string,
  actingCharacterId: CharacterId,
  mode: ConversationMode,
): Promise<SendTurnResult> {
  return new Promise((resolve, reject) => {
    const requestTask = Taro.request({
      url: `${BASE_URL}/api/v1/public/sessions/${sessionId}/turns/stream`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      enableChunked: true,
      responseType: "text",
      data: {
        input,
        mode,
        actingCharacterId,
        showEvidenceHint: true,
      },
      success: (response) => {
        const text = String(response.data ?? "");
        const events = parseSsePayload(text);
        const metadata = events.find((item) => item.type === "answer.metadata");
        const completed = events.find((item) => item.type === "answer.completed");
        const errorEvent = events.find((item) => item.type === "answer.error");

        if (errorEvent && "message" in errorEvent) {
          reject(new Error(errorEvent.message));
          return;
        }

        if (!metadata || metadata.type !== "answer.metadata") {
          reject(new Error("小程序未收到 turn metadata"));
          return;
        }

        if (!completed || completed.type !== "answer.completed") {
          reject(new Error("小程序暂未拿到完整回答"));
          return;
        }

        resolve({
          turnId: metadata.turnId,
          answer: completed.answer,
        });
      },
      fail: () => {
        reject(new Error("小程序请求公共对话接口失败"));
      },
    });

    requestTask.onChunkReceived?.((chunk) => {
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(chunk.data);
      const events = parseSsePayload(text);
      const completed = events.find((item) => item.type === "answer.completed");
      const metadata = events.find((item) => item.type === "answer.metadata");
      const errorEvent = events.find((item) => item.type === "answer.error");

      if (errorEvent && "message" in errorEvent) {
        reject(new Error(errorEvent.message));
        requestTask.abort();
        return;
      }

      if (
        metadata &&
        metadata.type === "answer.metadata" &&
        completed &&
        completed.type === "answer.completed"
      ) {
        resolve({
          turnId: metadata.turnId,
          answer: completed.answer,
        });
        requestTask.abort();
      }
    });
  });
}

async function requestJson<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    data?: unknown;
  } = {},
): Promise<T> {
  const response = await Taro.request<T>({
    url: `${BASE_URL}${path}`,
    method: options.method ?? "GET",
    data: options.data,
    header: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      typeof response.data === "string" ? response.data : "公共接口请求失败",
    );
  }

  return response.data;
}

type ParsedEvent =
  | { type: "answer.metadata"; turnId: string }
  | { type: "answer.completed"; answer: string }
  | { type: "answer.error"; message: string }
  | { type: "answer.delta"; delta: string };

function parseSsePayload(payload: string): ParsedEvent[] {
  return payload
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const eventLine = block
        .split("\n")
        .find((line) => line.startsWith("event:"));
      const dataLine = block
        .split("\n")
        .find((line) => line.startsWith("data:"));
      const type = eventLine?.replace("event:", "").trim();
      const dataText = dataLine?.replace("data:", "").trim();

      if (!type || !dataText) {
        return null;
      }

      try {
        const payloadObject = JSON.parse(dataText) as Record<string, string>;
        if (type === "answer.metadata") {
          return { type, turnId: payloadObject.turnId ?? "" };
        }
        if (type === "answer.completed") {
          return { type, answer: payloadObject.answer ?? "" };
        }
        if (type === "answer.error") {
          return { type, message: payloadObject.message ?? "回答失败" };
        }
        return { type: "answer.delta", delta: payloadObject.delta ?? "" };
      } catch {
        return null;
      }
    })
    .filter((item): item is ParsedEvent => item !== null);
}
