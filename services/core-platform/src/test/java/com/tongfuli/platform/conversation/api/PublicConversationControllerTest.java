package com.tongfuli.platform.conversation.api;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
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
                Instant.now()
            )));

        String sessionPayload = mockMvc.perform(post("/api/v1/public/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "clientType": "web",
                      "initialMode": "canon",
                      "initialCharacterId": "char_baizhantang",
                      "deviceId": "device_123"
                    }
                    """))
            .andReturn()
            .getResponse()
            .getContentAsString();

        String sessionId = sessionPayload.replaceAll(".*\"sessionId\":\"([^\"]+)\".*", "$1");

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
}
