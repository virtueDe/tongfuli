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

export interface RecentSessionSummary extends SessionSummary {
  updatedAt: string;
}

export interface CreateSessionRequest {
  clientType: ClientType;
  initialMode: ConversationMode;
  initialCharacterId: CharacterId;
  deviceId: string;
}

export interface SwitchCharacterRequest {
  targetCharacterId: CharacterId;
}

export interface SwitchModeRequest {
  targetMode: ConversationMode;
}

export interface SendTurnRequest {
  input: string;
  mode: ConversationMode;
  actingCharacterId: CharacterId;
  showEvidenceHint: boolean;
}

export interface TurnEvidenceItem {
  evidenceId: string;
  sourceType: "canonical" | "character" | "mode";
  title: string;
  snippet: string;
}

export interface TurnEvidence {
  turnId: string;
  items: TurnEvidenceItem[];
}

export interface TurnFeedbackRequest {
  feedbackType: "incorrect_fact" | "bad_style" | "unsafe" | "other";
  note?: string;
}

export interface TurnFeedbackReceipt {
  turnId: string;
  feedbackType: string;
  recordedAt: string;
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
