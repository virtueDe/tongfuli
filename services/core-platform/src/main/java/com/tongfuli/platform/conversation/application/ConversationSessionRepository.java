package com.tongfuli.platform.conversation.application;

import java.util.List;
import java.util.Optional;

import com.tongfuli.platform.conversation.domain.ConversationSession;

public interface ConversationSessionRepository {

    ConversationSession save(ConversationSession session);

    Optional<ConversationSession> findById(String sessionId);

    List<ConversationSession> findRecentByDeviceId(String deviceId, int limit);
}
