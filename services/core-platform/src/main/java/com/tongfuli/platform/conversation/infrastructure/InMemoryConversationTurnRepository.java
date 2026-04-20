package com.tongfuli.platform.conversation.infrastructure;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.tongfuli.platform.conversation.application.ConversationTurnRepository;
import com.tongfuli.platform.conversation.domain.ConversationTurn;

@Repository
public class InMemoryConversationTurnRepository implements ConversationTurnRepository {

    private final Map<String, ConversationTurn> turns = new ConcurrentHashMap<>();

    @Override
    public ConversationTurn save(ConversationTurn turn) {
        turns.put(turn.turnId(), turn);
        return turn;
    }

    @Override
    public Optional<ConversationTurn> findById(String turnId) {
        return Optional.ofNullable(turns.get(turnId));
    }
}
