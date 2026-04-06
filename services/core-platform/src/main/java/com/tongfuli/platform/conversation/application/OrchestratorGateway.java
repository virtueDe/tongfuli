package com.tongfuli.platform.conversation.application;

import com.tongfuli.platform.conversation.domain.CharacterProfile;
import com.tongfuli.platform.conversation.domain.ConversationMode;

public interface OrchestratorGateway {

    GeneratedAnswer generateAnswer(Request request);

    record Request(
        String sessionId,
        String userInput,
        CharacterProfile actingCharacter,
        ConversationMode mode
    ) {
    }
}
