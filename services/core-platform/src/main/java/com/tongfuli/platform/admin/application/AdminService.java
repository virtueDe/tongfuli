package com.tongfuli.platform.admin.application;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tongfuli.platform.admin.api.CreateScriptImportRequest;
import com.tongfuli.platform.admin.api.CreateSourceRequest;
import com.tongfuli.platform.admin.api.CreateStrategyRequest;
import com.tongfuli.platform.admin.api.GrayReleaseStrategyRequest;
import com.tongfuli.platform.admin.api.PublishKnowledgeRequest;
import com.tongfuli.platform.admin.api.ReviewDecisionRequest;
import com.tongfuli.platform.admin.api.TurnDiagnosticResponse;
import com.tongfuli.platform.strategy.domain.PromptStrategyVersion;
import com.tongfuli.platform.strategy.domain.StrategyReleaseStatus;
import com.tongfuli.platform.strategy.domain.StrategyTargetScope;

@Service
public class AdminService {

    public AdminReviewTask createScriptImport(CreateScriptImportRequest request) {
        return new AdminReviewTask(
            "review_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10),
            "script_import",
            "script",
            request.sourceName(),
            "pending",
            request.scriptTitle()
        );
    }

    public AdminReviewTask createSource(CreateSourceRequest request) {
        return new AdminReviewTask(
            "review_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10),
            "source_review",
            request.sourceType(),
            request.title(),
            "pending",
            request.sourceSite()
        );
    }

    public List<AdminReviewTask> listReviewTasks() {
        return List.of(
            new AdminReviewTask("review_demo_001", "source_review", "web", "百科专题稿", "pending", "等待审核"),
            new AdminReviewTask("review_demo_002", "knowledge_review", "script", "wulinwaizhuan-s01", "approved", "已通过")
        );
    }

    public AdminReviewTask decideReviewTask(String taskId, ReviewDecisionRequest request) {
        String normalizedDecision = request.decision().trim().toLowerCase();
        String status = normalizedDecision.equals("approved") ? "approved" : "rejected";

        return new AdminReviewTask(
            taskId,
            "source_review",
            "web",
            "百科专题稿",
            status,
            request.note() == null ? "" : request.note().trim()
        );
    }

    public KnowledgePublishReceipt publishKnowledge(PublishKnowledgeRequest request) {
        return new KnowledgePublishReceipt(
            "release_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10),
            request.snapshotVersion(),
            "published"
        );
    }

    public PromptStrategyVersion createStrategy(CreateStrategyRequest request) {
        return new PromptStrategyVersion(
            "strategy_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10),
            request.strategyName(),
            StrategyTargetScope.valueOf(request.targetScope().trim().toUpperCase()),
            1,
            request.configPayload(),
            StrategyReleaseStatus.DRAFT,
            request.changedBy()
        );
    }

    public PromptStrategyVersion grayReleaseStrategy(
        String strategyId,
        GrayReleaseStrategyRequest request
    ) {
        return new PromptStrategyVersion(
            strategyId,
            "default-role-answer",
            StrategyTargetScope.CHARACTER,
            2,
            Map.of("characterId", "char_baizhantang", "temperature", 0.4, "note", request.note()),
            StrategyReleaseStatus.GRAY,
            request.operator()
        );
    }

    public TurnDiagnosticResponse getTurnDiagnostic(String turnId) {
        return new TurnDiagnosticResponse(
            turnId,
            "char_baizhantang",
            "canon",
            "low",
            List.of("问题锚点", "白展堂角色口吻", "原剧模式"),
            "default-role-answer"
        );
    }
}
