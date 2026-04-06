package com.tongfuli.platform.conversation.api;

import jakarta.validation.constraints.NotBlank;

public record CreateSessionRequest(
    @NotBlank String clientType,
    @NotBlank String initialMode,
    @NotBlank String initialCharacterId,
    @NotBlank String deviceId
) {
}
