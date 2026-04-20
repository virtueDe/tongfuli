package com.tongfuli.platform.conversation.domain;

import java.time.Instant;

public record ConversationTurnFeedback(
    String turnId,
    String feedbackType,
    String note,
    Instant recordedAt
) {
}
