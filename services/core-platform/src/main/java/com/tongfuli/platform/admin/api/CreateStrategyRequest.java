package com.tongfuli.platform.admin.api;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateStrategyRequest(
    @NotBlank String strategyName,
    @NotBlank String targetScope,
    @NotNull Map<String, Object> configPayload,
    @NotBlank String changedBy
) {
}
