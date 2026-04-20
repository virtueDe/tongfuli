package com.tongfuli.platform.conversation.api;

import jakarta.validation.constraints.NotBlank;

public record SwitchModeRequest(@NotBlank String targetMode) {
}
