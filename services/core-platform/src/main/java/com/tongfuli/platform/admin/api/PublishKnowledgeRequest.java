package com.tongfuli.platform.admin.api;

import jakarta.validation.constraints.NotBlank;

public record PublishKnowledgeRequest(
    @NotBlank String snapshotVersion,
    @NotBlank String triggeredBy
) {
}
