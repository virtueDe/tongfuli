package com.tongfuli.platform.conversation.domain;

import java.time.Instant;

public record ConversationSession(
    String sessionId,
    String clientType,
    CharacterProfile currentCharacter,
    ConversationMode currentMode,
    Instant createdAt
) {
}
