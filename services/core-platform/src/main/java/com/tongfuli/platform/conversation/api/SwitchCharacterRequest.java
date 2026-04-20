package com.tongfuli.platform.conversation.api;

import jakarta.validation.constraints.NotBlank;

public record SwitchCharacterRequest(@NotBlank String targetCharacterId) {
}
