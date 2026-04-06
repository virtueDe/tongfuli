package com.tongfuli.platform.conversation.infrastructure;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.tongfuli.platform.conversation.application.ConversationSessionRepository;
import com.tongfuli.platform.conversation.domain.ConversationSession;

@Repository
public class InMemoryConversationSessionRepository implements ConversationSessionRepository {

    private final Map<String, ConversationSession> sessions = new ConcurrentHashMap<>();

    @Override
    public ConversationSession save(ConversationSession session) {
        sessions.put(session.sessionId(), session);
        return session;
    }

    @Override
    public Optional<ConversationSession> findById(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }
}
