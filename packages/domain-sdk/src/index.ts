export type ClientType = "web" | "miniapp";
export type ConversationMode = "canon" | "extended" | "fun";

export interface CharacterSummary {
  id: string;
  name: string;
}

export interface SessionSummary {
  sessionId: string;
  currentMode: ConversationMode;
  currentCharacter: CharacterSummary;
}
