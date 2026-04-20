package com.tongfuli.platform.moderation.domain;

public record ModerationDecision(
    RiskLevel riskLevel,
    boolean blocked,
    String reason
) {
}
