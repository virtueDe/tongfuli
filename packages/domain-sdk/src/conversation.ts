export const DEFAULT_CHARACTER_ID = "char_baizhantang" as const;
export const DEFAULT_MODE = "canon" as const;

export type ClientType = "web" | "miniapp";
export type ConversationMode = "canon" | "extended" | "fun";
export type CharacterId =
  | "char_baizhantang"
  | "char_tongxiangyu"
  | "char_guofurong";

export interface CharacterSummary {
  id: CharacterId;
  name: string;
}

export interface SessionSummary {
  sessionId: string;
  currentMode: ConversationMode;
  currentCharacter: CharacterSummary;
}

export interface CreateSessionRequest {
  clientType: ClientType;
  initialMode: ConversationMode;
  initialCharacterId: CharacterId;
  deviceId: string;
}

export interface SendTurnRequest {
  input: string;
  mode: ConversationMode;
  actingCharacterId: CharacterId;
  showEvidenceHint: boolean;
}

export interface StreamAnswerDeltaEvent {
  type: "answer.delta";
  turnId: string;
  delta: string;
}

export interface StreamAnswerMetadataEvent {
  type: "answer.metadata";
  turnId: string;
  actingCharacterId: CharacterId;
  mode: ConversationMode;
}

export interface StreamAnswerCompletedEvent {
  type: "answer.completed";
  turnId: string;
  answer: string;
}

export interface StreamAnswerErrorEvent {
  type: "answer.error";
  message: string;
}

export type StreamAnswerEvent =
  | StreamAnswerDeltaEvent
  | StreamAnswerMetadataEvent
  | StreamAnswerCompletedEvent
  | StreamAnswerErrorEvent;

export interface PublicApiError {
  message: string;
}
