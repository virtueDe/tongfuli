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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
class PublicConversationContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrchestratorGateway orchestratorGateway;

    @Test
    void shouldHonorCreateSessionContract() throws Exception {
        mockMvc.perform(post("/api/v1/public/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loadContract("tests/contracts/public/create-session.request.json")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sessionId").exists())
            .andExpect(jsonPath("$.currentMode").value("canon"))
            .andExpect(jsonPath("$.currentCharacter.id").value("char_baizhantang"))
            .andExpect(jsonPath("$.currentCharacter.name").value("白展堂"));
    }

    @Test
    void shouldHonorSwitchContracts() throws Exception {
        String sessionId = createSession();

        mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/character-switch", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(loadContract("tests/contracts/public/switch-character.request.json")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentCharacter.id").value("char_guofurong"))
            .andExpect(jsonPath("$.currentCharacter.name").value("郭芙蓉"));

        mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/mode-switch", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(loadContract("tests/contracts/public/switch-mode.request.json")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentMode").value("fun"));
    }

    @Test
    void shouldHonorStreamEvidenceRecentAndFeedbackContracts() throws Exception {
        when(orchestratorGateway.generateAnswer(any()))
            .thenReturn(new GeneratedAnswer(new ConversationTurn(
                "turn_contract_001",
                "session_contract_001",
                "老白为什么怕佟掌柜？",
                "展堂我先把话撂这儿，你问的是“老白为什么怕佟掌柜？”。",
                CharacterProfile.BAI_ZHAN_TANG,
                ConversationMode.CANON,
                java.util.List.of(),
                Instant.now()
            )));

        String sessionId = createSession();

        MvcResult result = mockMvc.perform(post("/api/v1/public/sessions/{sessionId}/turns/stream", sessionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(loadContract("tests/contracts/public/stream-turn.request.json")))
            .andExpect(request().asyncStarted())
            .andReturn();

        mockMvc.perform(asyncDispatch(result))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("event:answer.metadata")))
            .andExpect(content().string(containsString("event:answer.completed")));

        mockMvc.perform(get("/api/v1/public/turns/{turnId}/evidence", "turn_contract_001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.turnId").value("turn_contract_001"))
            .andExpect(jsonPath("$.items", hasSize(3)))
            .andExpect(jsonPath("$.items[0].sourceType").value("canonical"));

        mockMvc.perform(get("/api/v1/public/sessions/recent")
                .queryParam("deviceId", "contract_device_public_001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].sessionId").value(sessionId));

        mockMvc.perform(post("/api/v1/public/turns/{turnId}/feedback", "turn_contract_001")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loadContract("tests/contracts/public/turn-feedback.request.json")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.turnId").value("turn_contract_001"))
            .andExpect(jsonPath("$.feedbackType").value("incorrect_fact"))
            .andExpect(jsonPath("$.recordedAt").exists());
    }

    private String createSession() throws Exception {
        String sessionPayload = mockMvc.perform(post("/api/v1/public/sessions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loadContract("tests/contracts/public/create-session.request.json")))
            .andReturn()
            .getResponse()
            .getContentAsString();

        return sessionPayload.replaceAll(".*\"sessionId\":\"([^\"]+)\".*", "$1");
    }

    private String loadContract(String path) throws IOException {
        return Files.readString(Path.of(path));
    }
}
