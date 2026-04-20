package com.tongfuli.platform.admin.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.tongfuli.platform.admin.application.AdminService;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/scripts/import")
    ResponseEntity<ReviewTaskResponse> importScript(@Valid @RequestBody CreateScriptImportRequest request) {
        return ResponseEntity.ok(ReviewTaskResponse.fromTask(adminService.createScriptImport(request)));
    }

    @PostMapping("/sources")
    ResponseEntity<ReviewTaskResponse> createSource(@Valid @RequestBody CreateSourceRequest request) {
        return ResponseEntity.ok(ReviewTaskResponse.fromTask(adminService.createSource(request)));
    }

    @GetMapping("/review-tasks")
    ResponseEntity<List<ReviewTaskResponse>> reviewTasks() {
        return ResponseEntity.ok(
            adminService.listReviewTasks().stream()
                .map(ReviewTaskResponse::fromTask)
                .toList()
        );
    }

    @PostMapping("/review-tasks/{taskId}/decision")
    ResponseEntity<ReviewTaskResponse> decideReviewTask(
        @PathVariable String taskId,
        @Valid @RequestBody ReviewDecisionRequest request
    ) {
        return ResponseEntity.ok(ReviewTaskResponse.fromTask(adminService.decideReviewTask(taskId, request)));
    }

    @PostMapping("/knowledge/publish")
    ResponseEntity<PublishKnowledgeResponse> publishKnowledge(
        @Valid @RequestBody PublishKnowledgeRequest request
    ) {
        return ResponseEntity.ok(PublishKnowledgeResponse.fromReceipt(adminService.publishKnowledge(request)));
    }
}
