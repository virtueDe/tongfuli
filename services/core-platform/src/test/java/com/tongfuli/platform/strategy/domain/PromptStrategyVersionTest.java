package com.tongfuli.platform.strategy.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

class PromptStrategyVersionTest {

    @Test
    void shouldRequireGrayBeforePublished() {
        PromptStrategyVersion draft = new PromptStrategyVersion(
            "strategy_001",
            "default-role-answer",
            StrategyTargetScope.CHARACTER,
            1,
            Map.of("characterId", "char_baizhantang", "temperature", 0.4),
            StrategyReleaseStatus.DRAFT,
            "ops_001"
        );

        assertThrows(IllegalStateException.class, () -> draft.moveTo(StrategyReleaseStatus.PUBLISHED));
        assertEquals(
            StrategyReleaseStatus.PUBLISHED,
            draft.moveTo(StrategyReleaseStatus.GRAY).moveTo(StrategyReleaseStatus.PUBLISHED).releaseStatus()
        );
    }

    @Test
    void shouldMatchTargetScopeByConfigKey() {
        PromptStrategyVersion strategy = new PromptStrategyVersion(
            "strategy_002",
            "fun-mode-answer",
            StrategyTargetScope.MODE,
            2,
            Map.of("mode", "fun", "temperature", 0.8),
            StrategyReleaseStatus.GRAY,
            "ops_002"
        );

        assertTrue(strategy.appliesTo("mode"));
    }
}
