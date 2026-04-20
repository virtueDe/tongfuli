package com.tongfuli.platform.strategy.domain;

import java.util.Map;

public record PromptStrategyVersion(
    String id,
    String strategyName,
    StrategyTargetScope targetScope,
    int versionNo,
    Map<String, Object> configPayload,
    StrategyReleaseStatus releaseStatus,
    String changedBy
) {

    public PromptStrategyVersion {
        if (isBlank(id) || isBlank(strategyName) || targetScope == null) {
            throw new IllegalArgumentException("策略主键、名称和作用范围不能为空");
        }

        if (versionNo < 1) {
            throw new IllegalArgumentException("策略版本号必须从 1 开始");
        }

        configPayload = configPayload == null ? Map.of() : Map.copyOf(configPayload);

        if (configPayload.isEmpty()) {
            throw new IllegalArgumentException("策略配置不能为空");
        }

        if (isBlank(changedBy)) {
            throw new IllegalArgumentException("策略变更人不能为空");
        }

        releaseStatus = releaseStatus == null ? StrategyReleaseStatus.DRAFT : releaseStatus;
    }

    public PromptStrategyVersion moveTo(StrategyReleaseStatus targetStatus) {
        if (targetStatus == StrategyReleaseStatus.PUBLISHED && releaseStatus == StrategyReleaseStatus.DRAFT) {
            throw new IllegalStateException("草稿策略不能直接发布，必须先进入灰度");
        }

        if (targetStatus == StrategyReleaseStatus.GRAY && releaseStatus == StrategyReleaseStatus.ROLLED_BACK) {
            throw new IllegalStateException("已回滚策略不能再次进入灰度");
        }

        return new PromptStrategyVersion(
            id,
            strategyName,
            targetScope,
            versionNo,
            configPayload,
            targetStatus,
            changedBy
        );
    }

    public boolean appliesTo(String scopeKey) {
        return switch (targetScope) {
            case GLOBAL -> true;
            case CHARACTER, MODE, RETRIEVAL -> configPayload.containsKey(scopeKey);
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
