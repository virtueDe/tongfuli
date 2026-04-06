package com.tongfuli.platform.conversation.api;

import jakarta.validation.constraints.NotBlank;

public record StreamTurnRequest(
    @NotBlank String input,
    @NotBlank String mode,
    @NotBlank String actingCharacterId,
    boolean showEvidenceHint
) {
}
