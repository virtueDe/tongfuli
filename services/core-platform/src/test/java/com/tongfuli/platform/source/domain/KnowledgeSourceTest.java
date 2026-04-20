package com.tongfuli.platform.source.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class KnowledgeSourceTest {

    @Test
    void shouldBlockLowTrustSourceFromPublishing() {
        KnowledgeSource source = new KnowledgeSource(
            "source_001",
            SourceType.WEB,
            "路边梗文",
            "某站点",
            "https://example.com/source-001",
            TrustLevel.LOW,
            ReviewStatus.APPROVED
        );

        assertFalse(source.canPublish());
    }

    @Test
    void shouldAllowApprovedMediumTrustSourceToPublish() {
        KnowledgeSource source = new KnowledgeSource(
            "source_002",
            SourceType.ARTICLE,
            "角色关系梳理",
            "资料站",
            "https://example.com/source-002",
            TrustLevel.MEDIUM,
            ReviewStatus.APPROVED
        );

        assertTrue(source.canPublish());
    }
}
