package com.tongfuli.platform.content.domain;

import java.util.List;
import java.util.Objects;

public record CharacterDraft(
    String id,
    String universeId,
    String name,
    List<String> aliases,
    String profileSummary,
    List<String> evidenceRefs,
    ContentLifecycleStatus status,
    int version
) {

    public CharacterDraft {
        if (isBlank(id) || isBlank(universeId) || isBlank(name)) {
            throw new IllegalArgumentException("角色主键、世界观和名称不能为空");
        }

        aliases = aliases == null ? List.of() : aliases.stream()
            .filter(alias -> !isBlank(alias))
            .map(String::trim)
            .distinct()
            .toList();

        if (isBlank(profileSummary)) {
            throw new IllegalArgumentException("角色简介不能为空");
        }

        evidenceRefs = evidenceRefs == null ? List.of() : evidenceRefs.stream()
            .filter(ref -> !isBlank(ref))
            .map(String::trim)
            .distinct()
            .toList();

        if (evidenceRefs.isEmpty()) {
            throw new IllegalArgumentException("角色设定必须保留至少一条来源证据");
        }

        status = Objects.requireNonNullElse(status, ContentLifecycleStatus.DRAFT);

        if (version < 1) {
            throw new IllegalArgumentException("版本号必须从 1 开始");
        }
    }

    public CharacterDraft moveTo(ContentLifecycleStatus targetStatus) {
        if (targetStatus == ContentLifecycleStatus.PUBLISHED && evidenceRefs.isEmpty()) {
            throw new IllegalStateException("缺少证据时不能发布角色设定");
        }

        return new CharacterDraft(
            id,
            universeId,
            name,
            aliases,
            profileSummary,
            evidenceRefs,
            targetStatus,
            version
        );
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
