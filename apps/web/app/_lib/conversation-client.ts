"use client";

import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_MODE,
  type CreateSessionRequest,
  type PublicApiError,
  type SwitchCharacterRequest,
  type SwitchModeRequest,
  type SendTurnRequest,
  type SessionSummary,
  type TurnEvidence,
  type StreamAnswerCompletedEvent,
  type StreamAnswerDeltaEvent,
  type StreamAnswerErrorEvent,
  type StreamAnswerEvent,
  type StreamAnswerMetadataEvent,
} from "@tongfuli/domain-sdk";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CORE_PLATFORM_BASE_URL ?? "http://127.0.0.1:8080";

interface StreamTurnOptions {
  sessionId: string;
  request: SendTurnRequest;
  onEvent: (event: StreamAnswerEvent) => void;
}

export async function createSession(
  request: Partial<CreateSessionRequest> = {},
): Promise<SessionSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientType: "web",
      initialMode: DEFAULT_MODE,
      initialCharacterId: DEFAULT_CHARACTER_ID,
      deviceId: getOrCreateDeviceId(),
      ...request,
    } satisfies CreateSessionRequest),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "创建会话失败，请稍后重试。"));
  }

  return (await response.json()) as SessionSummary;
}

export async function streamTurn({
  sessionId,
  request,
  onEvent,
}: StreamTurnOptions): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/sessions/${sessionId}/turns/stream`,
    {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response, "回答失败，请稍后重试。"));
  }

  if (!response.body) {
    throw new Error("回答流为空，无法继续解析。");
  }

  await readEventStream(response.body, onEvent);
}

export async function switchCharacter(
  sessionId: string,
  request: SwitchCharacterRequest,
): Promise<SessionSummary> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/sessions/${sessionId}/character-switch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response, "切换角色失败，请稍后重试。"));
  }

  return (await response.json()) as SessionSummary;
}

export async function switchMode(
  sessionId: string,
  request: SwitchModeRequest,
): Promise<SessionSummary> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/sessions/${sessionId}/mode-switch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(await readApiError(response, "切换模式失败，请稍后重试。"));
  }

  return (await response.json()) as SessionSummary;
}

export async function getTurnEvidence(turnId: string): Promise<TurnEvidence> {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/turns/${turnId}/evidence`);

  if (!response.ok) {
    throw new Error(await readApiError(response, "读取依据失败，请稍后重试。"));
  }

  return (await response.json()) as TurnEvidence;
}

function getOrCreateDeviceId(): string {
  const storageKey = "tongfuli.device-id";
  const cached = window.localStorage.getItem(storageKey);

  if (cached) {
    return cached;
  }

  const deviceId = `web_${crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, deviceId);
  return deviceId;
}

async function readApiError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as PublicApiError;
    return payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function readEventStream(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: StreamAnswerEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    buffer = drainBuffer(buffer, onEvent);

    if (done) {
      break;
    }
  }

  const tail = buffer.trim();
  if (tail) {
    emitChunk(tail, onEvent);
  }
}

function drainBuffer(
  buffer: string,
  onEvent: (event: StreamAnswerEvent) => void,
): string {
  const normalized = buffer.replace(/\r\n/g, "\n");
  let next = normalized;
  let boundary = next.indexOf("\n\n");

  while (boundary >= 0) {
    const chunk = next.slice(0, boundary).trim();
    if (chunk) {
      emitChunk(chunk, onEvent);
    }
    next = next.slice(boundary + 2);
    boundary = next.indexOf("\n\n");
  }

  return next;
}

function emitChunk(
  chunk: string,
  onEvent: (event: StreamAnswerEvent) => void,
): void {
  const lines = chunk.split("\n");
  let eventName = "";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim());
    }
  }

  if (!eventName || dataLines.length === 0) {
    return;
  }

  const payload = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
  const event = coerceEvent(eventName, payload);

  if (event) {
    onEvent(event);
  }
}

function coerceEvent(
  eventName: string,
  payload: Record<string, unknown>,
): StreamAnswerEvent | null {
  switch (eventName) {
    case "answer.metadata":
      return {
        type: "answer.metadata",
        turnId: String(payload.turnId ?? ""),
        actingCharacterId: String(payload.actingCharacterId ?? "") as StreamAnswerMetadataEvent["actingCharacterId"],
        mode: String(payload.mode ?? DEFAULT_MODE) as StreamAnswerMetadataEvent["mode"],
      };
    case "answer.delta":
      return {
        type: "answer.delta",
        turnId: String(payload.turnId ?? ""),
        delta: String(payload.delta ?? ""),
      } satisfies StreamAnswerDeltaEvent;
    case "answer.completed":
      return {
        type: "answer.completed",
        turnId: String(payload.turnId ?? ""),
        answer: String(payload.answer ?? ""),
      } satisfies StreamAnswerCompletedEvent;
    case "answer.error":
      return {
        type: "answer.error",
        message: String(payload.message ?? "回答失败，请稍后重试。"),
      } satisfies StreamAnswerErrorEvent;
    default:
      return null;
  }
}
