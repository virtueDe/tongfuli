package com.tongfuli.platform.conversation.domain;

public record TurnEvidenceItem(
    String evidenceId,
    String sourceType,
    String title,
    String snippet
) {
}
