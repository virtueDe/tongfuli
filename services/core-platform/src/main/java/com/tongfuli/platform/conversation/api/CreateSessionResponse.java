package com.tongfuli.platform.conversation.api;

import com.tongfuli.platform.conversation.domain.ConversationSession;

public record CreateSessionResponse(
    String sessionId,
    String currentMode,
    CharacterSummary currentCharacter
) {
    public static CreateSessionResponse fromSession(ConversationSession session) {
        return new CreateSessionResponse(
            session.sessionId(),
            session.currentMode().value(),
            new CharacterSummary(
                session.currentCharacter().id(),
                session.currentCharacter().displayName()
            )
        );
    }
}
