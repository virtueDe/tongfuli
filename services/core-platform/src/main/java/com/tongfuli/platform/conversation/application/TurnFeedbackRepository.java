package com.tongfuli.platform.conversation.application;

import com.tongfuli.platform.conversation.domain.ConversationTurnFeedback;

public interface TurnFeedbackRepository {

    ConversationTurnFeedback save(ConversationTurnFeedback feedback);
}
