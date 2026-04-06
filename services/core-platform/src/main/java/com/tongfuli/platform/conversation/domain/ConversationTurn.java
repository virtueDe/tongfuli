package com.tongfuli.platform.conversation.domain;

import java.time.Instant;

public record ConversationTurn(
    String turnId,
    String sessionId,
    String input,
    String answer,
    CharacterProfile actingCharacter,
    ConversationMode mode,
    Instant createdAt
) {
}
