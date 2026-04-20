package com.tongfuli.platform.admin.api;

import jakarta.validation.constraints.NotBlank;

public record GrayReleaseStrategyRequest(
    @NotBlank String operator,
    @NotBlank String note
) {
}
