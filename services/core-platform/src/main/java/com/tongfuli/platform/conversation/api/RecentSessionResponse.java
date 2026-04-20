package com.tongfuli.platform.conversation.api;

import java.time.Instant;

import com.tongfuli.platform.conversation.domain.ConversationSession;

public record RecentSessionResponse(
    String sessionId,
    String currentMode,
    CharacterSummary currentCharacter,
    Instant updatedAt
) {
    public static RecentSessionResponse fromSession(ConversationSession session) {
        return new RecentSessionResponse(
            session.sessionId(),
            session.currentMode().value(),
            new CharacterSummary(
                session.currentCharacter().id(),
                session.currentCharacter().displayName()
            ),
            session.updatedAt()
        );
    }
}
