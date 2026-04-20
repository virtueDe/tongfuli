package com.tongfuli.platform.admin.api;

import com.tongfuli.platform.admin.application.AdminReviewTask;

public record ReviewTaskResponse(
    String taskId,
    String taskType,
    String targetType,
    String targetId,
    String status,
    String note
) {
    public static ReviewTaskResponse fromTask(AdminReviewTask task) {
        return new ReviewTaskResponse(
            task.taskId(),
            task.taskType(),
            task.targetType(),
            task.targetId(),
            task.status(),
            task.note()
        );
    }
}
