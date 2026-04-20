package com.tongfuli.platform.admin.api;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldImportScript() throws Exception {
        mockMvc.perform(post("/api/v1/admin/scripts/import")
                .contentType("application/json")
                .content("""
                    {
                      "scriptTitle": "武林外传第一集",
                      "sourceName": "wulinwaizhuan-s01",
                      "episodeNo": 1
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.taskType").value("script_import"))
            .andExpect(jsonPath("$.targetType").value("script"));
    }

    @Test
    void shouldCreateSourceAndListReviewTasks() throws Exception {
        mockMvc.perform(post("/api/v1/admin/sources")
                .contentType("application/json")
                .content("""
                    {
                      "title": "百科专题稿",
                      "sourceType": "web",
                      "sourceSite": "百科站",
                      "sourceUrl": "https://example.com/topic",
                      "trustLevel": "medium"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.taskType").value("source_review"));

        mockMvc.perform(get("/api/v1/admin/review-tasks"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void shouldDecideReviewTaskAndPublishKnowledge() throws Exception {
        mockMvc.perform(post("/api/v1/admin/review-tasks/{taskId}/decision", "review_demo_001")
                .contentType("application/json")
                .content("""
                    {
                      "decision": "approved",
                      "note": "内容可信，允许进入发布环节"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("approved"));

        mockMvc.perform(post("/api/v1/admin/knowledge/publish")
                .contentType("application/json")
                .content("""
                    {
                      "snapshotVersion": "snapshot_2026_04_21",
                      "triggeredBy": "ops_001"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("published"))
            .andExpect(jsonPath("$.snapshotVersion").value("snapshot_2026_04_21"));
    }
}
