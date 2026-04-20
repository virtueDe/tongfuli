package com.tongfuli.platform.conversation.application;

import java.util.Optional;

import com.tongfuli.platform.conversation.domain.ConversationTurn;

public interface ConversationTurnRepository {

    ConversationTurn save(ConversationTurn turn);

    Optional<ConversationTurn> findById(String turnId);
}
