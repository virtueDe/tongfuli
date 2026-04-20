package com.tongfuli.platform.conversation.api;

import java.time.Instant;

import com.tongfuli.platform.conversation.domain.ConversationTurnFeedback;

public record TurnFeedbackAcceptedResponse(
    String turnId,
    String feedbackType,
    Instant recordedAt
) {
    public static TurnFeedbackAcceptedResponse fromFeedback(ConversationTurnFeedback feedback) {
        return new TurnFeedbackAcceptedResponse(
            feedback.turnId(),
            feedback.feedbackType(),
            feedback.recordedAt()
        );
    }
}
