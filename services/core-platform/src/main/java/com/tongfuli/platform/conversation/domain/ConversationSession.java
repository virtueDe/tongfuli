package com.tongfuli.platform.conversation.domain;

import java.time.Instant;

public record ConversationSession(
    String sessionId,
    String clientType,
    String deviceId,
    CharacterProfile currentCharacter,
    ConversationMode currentMode,
    Instant createdAt,
    Instant updatedAt
) {
}
