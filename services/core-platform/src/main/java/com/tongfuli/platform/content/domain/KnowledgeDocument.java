package com.tongfuli.platform.content.domain;

public record KnowledgeDocument(
    String id,
    String sourceId,
    KnowledgeLayer layer,
    String parsedText,
    ContentLifecycleStatus status,
    int version
) {

    public KnowledgeDocument {
        if (isBlank(id) || isBlank(sourceId) || layer == null) {
            throw new IllegalArgumentException("知识文档主键、来源和层级不能为空");
        }

        if (isBlank(parsedText)) {
            throw new IllegalArgumentException("规范化文本不能为空");
        }

        status = status == null ? ContentLifecycleStatus.DRAFT : status;

        if (version < 1) {
            throw new IllegalArgumentException("知识文档版本号必须从 1 开始");
        }
    }

    public boolean canPublish(boolean sourceApproved) {
        return sourceApproved && !parsedText.isBlank();
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
