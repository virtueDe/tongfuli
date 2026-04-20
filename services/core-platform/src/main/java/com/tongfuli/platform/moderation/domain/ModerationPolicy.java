package com.tongfuli.platform.moderation.domain;

public class ModerationPolicy {

    public ModerationDecision evaluate(String input) {
        String normalized = input == null ? "" : input.trim();

        if (normalized.contains("违法") || normalized.contains("绕过限制")) {
            return new ModerationDecision(RiskLevel.HIGH, true, "unsafe_content");
        }

        if (normalized.length() >= 30) {
            return new ModerationDecision(RiskLevel.MEDIUM, false, "long_input");
        }

        return new ModerationDecision(RiskLevel.LOW, false, "ok");
    }
}
