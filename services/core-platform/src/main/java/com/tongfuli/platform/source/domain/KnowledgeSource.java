package com.tongfuli.platform.source.domain;

public record KnowledgeSource(
    String id,
    SourceType sourceType,
    String title,
    String sourceSite,
    String sourceUrl,
    TrustLevel trustLevel,
    ReviewStatus reviewStatus
) {

    public KnowledgeSource {
        if (isBlank(id) || sourceType == null || isBlank(title)) {
            throw new IllegalArgumentException("来源主键、类型和标题不能为空");
        }

        if (isBlank(sourceSite) || isBlank(sourceUrl)) {
            throw new IllegalArgumentException("来源站点和原始地址不能为空");
        }

        trustLevel = trustLevel == null ? TrustLevel.MEDIUM : trustLevel;
        reviewStatus = reviewStatus == null ? ReviewStatus.DRAFT : reviewStatus;
    }

    public boolean canPublish() {
        if (reviewStatus != ReviewStatus.APPROVED) {
            return false;
        }

        return trustLevel != TrustLevel.LOW;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
