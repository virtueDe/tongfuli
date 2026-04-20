package com.tongfuli.platform.admin.api;

import jakarta.validation.constraints.NotBlank;

public record CreateSourceRequest(
    @NotBlank String title,
    @NotBlank String sourceType,
    @NotBlank String sourceSite,
    @NotBlank String sourceUrl,
    @NotBlank String trustLevel
) {
}
