package com.tongfuli.platform.conversation.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.tongfuli.platform.conversation.application.GeneratedAnswer;
import com.tongfuli.platform.conversation.application.OrchestratorGateway;
import com.tongfuli.platform.conversation.domain.CharacterProfile;
import com.tongfuli.platform.conversation.domain.ConversationMode;
import com.tongfuli.platform.conversation.domain.ConversationTurn;

@SpringBootTest
@AutoConfigureMockMvc
class PublicConversationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrchestratorGateway orchestratorGateway;

    @Test
    void shouldCreateAnonymousSession() throws Exception {
        mockMvc.perform(post("/api/v1/public/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "clientType": "web",
                      "initialMode": "canon",
                      "initialCharacterId": "char_baizhantang",
                      "deviceId": "device_123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId").exists())
            .andExpect(jsonPath("$.currentMode").value("canon"))
            .andExpect(jsonPath("$.currentCharacter.id").value("char_baizhantang"));
    }

    @Test
    void shouldStreamConversationAnswer() throws Exception {
        when(orchestratorGateway.generateAnswer(any()))
            .thenReturn(new GeneratedAnswer(new ConversationTurn(
                "turn_123",
                "session_123",
                "老白为什么怕佟掌柜？",
                "展堂我先把话撂这儿，你问的是“老白为什么怕佟掌柜？”。",
                CharacterProfile.BAI_ZHAN_TANG,
                ConversationMode.CANON,
                java.util.List.of(),
                Instant.now()
            )));

        String sessionId = createSession("device_123");

        MvcResult result = mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/turns/stream", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "input": "老白为什么怕佟掌柜？",
                      "mode": "canon",
                      "actingCharacterId": "char_baizhantang",
                      "showEvidenceHint": false
                    }
                    """))
            .andExpect(request().asyncStarted())
            .andReturn();

        mockMvc.perform(asyncDispatch(result))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("event:answer.metadata")))
            .andExpect(content().string(containsString("event:answer.completed")))
            .andExpect(content().string(containsString("turn_123")));
    }

    @Test
    void shouldRejectUnknownSession() throws Exception {
        mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/turns/stream", "missing_session")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "input": "老白为什么怕佟掌柜？",
                      "mode": "canon",
                      "actingCharacterId": "char_baizhantang",
                      "showEvidenceHint": false
                    }
                    """))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("未找到会话: missing_session"));
    }

    @Test
    void shouldSwitchCharacterAndMode() throws Exception {
        String sessionId = createSession("device_switch_123");

        mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/character-switch", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "targetCharacterId": "char_guofurong"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentCharacter.id").value("char_guofurong"));

        mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/mode-switch", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "targetMode": "fun"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentMode").value("fun"));
    }

    @Test
    void shouldReturnEvidenceAndAcceptFeedback() throws Exception {
        when(orchestratorGateway.generateAnswer(any()))
            .thenReturn(new GeneratedAnswer(new ConversationTurn(
                "turn_456",
                "session_for_evidence",
                "佟掌柜怎么看老白？",
                "额觉着这事得从同福客栈的规矩说起。",
                CharacterProfile.TONG_XIANG_YU,
                ConversationMode.EXTENDED,
                java.util.List.of(),
                Instant.now()
            )));

        String sessionId = createSession("device_evidence_123");

        MvcResult result = mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/turns/stream", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "input": "佟掌柜怎么看老白？",
                      "mode": "extended",
                      "actingCharacterId": "char_tongxiangyu",
                      "showEvidenceHint": true
                    }
                    """))
            .andExpect(request().asyncStarted())
            .andReturn();

        mockMvc.perform(asyncDispatch(result))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/public/turns/{turnId}/evidence", "turn_456"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.turnId").value("turn_456"))
            .andExpect(jsonPath("$.items", hasSize(3)));

        mockMvc.perform(post("/api/v1/public/turns/{turnId}/feedback", "turn_456")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "feedbackType": "incorrect_fact",
                      "note": "这句还可以更贴近原剧。"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.turnId").value("turn_456"))
            .andExpect(jsonPath("$.feedbackType").value("incorrect_fact"));
    }

    @Test
    void shouldReturnRecentSessionsForDevice() throws Exception {
        createSession("device_recent_123");
        createSession("device_recent_123");
        createSession("device_other_123");

        mockMvc.perform(get("/api/v1/public/sessions/recent")
                .queryParam("deviceId", "device_recent_123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }

    private String createSession(String deviceId) throws Exception {
        String sessionPayload = mockMvc.perform(post("/api/v1/public/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "clientType": "web",
                      "initialMode": "canon",
                      "initialCharacterId": "char_baizhantang",
                      "deviceId": "%s"
                    }
                    """.formatted(deviceId)))
            .andReturn()
            .getResponse()
            .getContentAsString();

        return sessionPayload.replaceAll(".*\"sessionId\":\"([^\"]+)\".*", "$1");
    }
}
