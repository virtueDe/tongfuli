package com.tongfuli.platform.admin.api;

import java.util.Map;

import com.tongfuli.platform.strategy.domain.PromptStrategyVersion;

public record StrategyVersionResponse(
    String id,
    String strategyName,
    String targetScope,
    int versionNo,
    Map<String, Object> configPayload,
    String releaseStatus,
    String changedBy
) {
    public static StrategyVersionResponse fromVersion(PromptStrategyVersion version) {
        return new StrategyVersionResponse(
            version.id(),
            version.strategyName(),
            version.targetScope().name().toLowerCase(),
            version.versionNo(),
            version.configPayload(),
            version.releaseStatus().name().toLowerCase(),
            version.changedBy()
        );
    }
}
