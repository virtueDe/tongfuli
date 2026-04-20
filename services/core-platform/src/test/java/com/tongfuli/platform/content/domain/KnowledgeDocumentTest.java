package com.tongfuli.platform.content.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class KnowledgeDocumentTest {

    @Test
    void shouldAllowPublishOnlyWhenSourceApproved() {
        KnowledgeDocument document = new KnowledgeDocument(
            "doc_001",
            "source_001",
            KnowledgeLayer.CANONICAL,
            "老白怕佟掌柜，核心还是因为掌柜拿捏住了他的处境。",
            ContentLifecycleStatus.REVIEWING,
            1
        );

        assertTrue(document.canPublish(true));
        assertFalse(document.canPublish(false));
    }
}
