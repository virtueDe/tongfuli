package com.tongfuli.platform.conversation.infrastructure;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Repository;

import com.tongfuli.platform.conversation.application.TurnFeedbackRepository;
import com.tongfuli.platform.conversation.domain.ConversationTurnFeedback;

@Repository
public class InMemoryTurnFeedbackRepository implements TurnFeedbackRepository {

    private final List<ConversationTurnFeedback> feedbackEntries = new CopyOnWriteArrayList<>();

    @Override
    public ConversationTurnFeedback save(ConversationTurnFeedback feedback) {
        feedbackEntries.add(feedback);
        return feedback;
    }
}
