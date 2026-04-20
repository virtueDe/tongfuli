package com.tongfuli.platform.admin.api;

import com.tongfuli.platform.admin.application.KnowledgePublishReceipt;

public record PublishKnowledgeResponse(
    String releaseId,
    String snapshotVersion,
    String status
) {
    public static PublishKnowledgeResponse fromReceipt(KnowledgePublishReceipt receipt) {
        return new PublishKnowledgeResponse(
            receipt.releaseId(),
            receipt.snapshotVersion(),
            receipt.status()
        );
    }
}
