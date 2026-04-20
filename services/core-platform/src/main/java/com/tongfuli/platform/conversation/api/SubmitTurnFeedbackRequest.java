package com.tongfuli.platform.conversation.api;

import jakarta.validation.constraints.NotBlank;

public record SubmitTurnFeedbackRequest(
    @NotBlank String feedbackType,
    String note
) {
}
