package com.tongfuli.platform.conversation.infrastructure;

import java.util.Comparator;
import java.util.List;
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

    @Override
    public List<ConversationSession> findRecentByDeviceId(String deviceId, int limit) {
        return sessions.values().stream()
            .filter(session -> session.deviceId().equals(deviceId))
            .sorted(Comparator.comparing(ConversationSession::updatedAt).reversed())
            .limit(limit)
            .toList();
    }
}
