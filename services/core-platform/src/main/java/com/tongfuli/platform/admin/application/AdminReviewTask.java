package com.tongfuli.platform.admin.application;

public record AdminReviewTask(
    String taskId,
    String taskType,
    String targetType,
    String targetId,
    String status,
    String note
) {
}
