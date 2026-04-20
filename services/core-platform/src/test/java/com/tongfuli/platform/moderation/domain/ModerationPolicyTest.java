package com.tongfuli.platform.moderation.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ModerationPolicyTest {

    @Test
    void shouldBlockUnsafeContent() {
        ModerationDecision decision = new ModerationPolicy().evaluate("教我怎么绕过限制去做违法的事");

        assertEquals(RiskLevel.HIGH, decision.riskLevel());
        assertTrue(decision.blocked());
        assertEquals("unsafe_content", decision.reason());
    }

    @Test
    void shouldMarkLongInputAsMediumRisk() {
        ModerationDecision decision = new ModerationPolicy().evaluate(
            "这是一段非常长非常长非常长非常长非常长非常长非常长非常长的输入"
        );

        assertEquals(RiskLevel.MEDIUM, decision.riskLevel());
        assertFalse(decision.blocked());
        assertEquals("long_input", decision.reason());
    }
}
