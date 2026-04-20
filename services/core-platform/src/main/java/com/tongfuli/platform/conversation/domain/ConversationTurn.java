package com.tongfuli.platform.conversation.domain;

import java.time.Instant;
import java.util.List;

public record ConversationTurn(
    String turnId,
    String sessionId,
    String input,
    String answer,
    CharacterProfile actingCharacter,
    ConversationMode mode,
    List<TurnEvidenceItem> evidence,
    Instant createdAt
) {
}
