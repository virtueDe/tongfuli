package com.tongfuli.platform.content.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;

class CharacterDraftTest {

    @Test
    void shouldNormalizeAliasesAndKeepEvidence() {
        CharacterDraft draft = new CharacterDraft(
            "char_001",
            "universe_wulin",
            "白展堂",
            List.of(" 老白 ", "白少侠", "老白"),
            "同福客栈跑堂，嘴贫但机灵。",
            List.of("scene:1:line:3"),
            ContentLifecycleStatus.DRAFT,
            1
        );

        assertEquals(List.of("老白", "白少侠"), draft.aliases());
        assertEquals(ContentLifecycleStatus.PUBLISHED, draft.moveTo(ContentLifecycleStatus.PUBLISHED).status());
    }

    @Test
    void shouldRejectCharacterWithoutEvidence() {
        assertThrows(IllegalArgumentException.class, () -> new CharacterDraft(
            "char_001",
            "universe_wulin",
            "白展堂",
            List.of(),
            "同福客栈跑堂，嘴贫但机灵。",
            List.of(),
            ContentLifecycleStatus.DRAFT,
            1
        ));
    }
}
