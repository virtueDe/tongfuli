package com.tongfuli.platform.conversation.application;

import java.util.Optional;

import com.tongfuli.platform.conversation.domain.ConversationSession;

public interface ConversationSessionRepository {

    ConversationSession save(ConversationSession session);

    Optional<ConversationSession> findById(String sessionId);
}
