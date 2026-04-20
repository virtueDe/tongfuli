package com.tongfuli.platform.admin.api;

import jakarta.validation.constraints.NotBlank;

public record ReviewDecisionRequest(
    @NotBlank String decision,
    String note
) {
}
