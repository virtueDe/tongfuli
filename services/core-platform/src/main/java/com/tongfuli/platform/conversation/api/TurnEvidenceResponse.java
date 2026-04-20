package com.tongfuli.platform.conversation.api;

import java.util.List;

import com.tongfuli.platform.conversation.domain.ConversationTurn;

public record TurnEvidenceResponse(
    String turnId,
    List<EvidenceItemResponse> items
) {
    public static TurnEvidenceResponse fromTurn(ConversationTurn turn) {
        return new TurnEvidenceResponse(
            turn.turnId(),
            turn.evidence().stream()
                .map(EvidenceItemResponse::fromItem)
                .toList()
        );
    }
}
