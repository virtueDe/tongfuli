package com.tongfuli.platform.admin.api;

import jakarta.validation.constraints.NotBlank;

public record CreateScriptImportRequest(
    @NotBlank String scriptTitle,
    @NotBlank String sourceName,
    int episodeNo
) {
}
