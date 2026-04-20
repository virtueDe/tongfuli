package com.tongfuli.platform.conversation.api;

import com.tongfuli.platform.conversation.domain.TurnEvidenceItem;

public record EvidenceItemResponse(
    String evidenceId,
    String sourceType,
    String title,
    String snippet
) {
    public static EvidenceItemResponse fromItem(TurnEvidenceItem item) {
        return new EvidenceItemResponse(
            item.evidenceId(),
            item.sourceType(),
            item.title(),
            item.snippet()
        );
    }
}
