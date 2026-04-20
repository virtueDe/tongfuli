package com.tongfuli.platform.conversation.infrastructure;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.tongfuli.platform.conversation.application.ConversationIntegrationException;
import com.tongfuli.platform.conversation.application.GeneratedAnswer;
import com.tongfuli.platform.conversation.application.OrchestratorGateway;
import com.tongfuli.platform.conversation.domain.CharacterProfile;
import com.tongfuli.platform.conversation.domain.ConversationMode;
import com.tongfuli.platform.conversation.domain.ConversationTurn;

@Component
public class HttpOrchestratorGateway implements OrchestratorGateway {

    private final RestClient restClient;

    public HttpOrchestratorGateway(RestClient.Builder builder, OrchestratorProperties properties) {
        this.restClient = builder.baseUrl(properties.baseUrl()).build();
    }

    @Override
    public GeneratedAnswer generateAnswer(Request request) {
        try {
            OrchestratorResponse response = restClient.post()
                .uri("/internal/orchestration/answers")
                .body(new OrchestratorRequest(
                    request.sessionId(),
                    request.userInput(),
                    request.actingCharacter().id(),
                    request.mode().value()
                ))
                .retrieve()
                .body(OrchestratorResponse.class);

            if (response == null) {
                throw new ConversationIntegrationException("编排服务返回空响应", null);
            }

            return new GeneratedAnswer(
                new ConversationTurn(
                    response.turnId(),
                    request.sessionId(),
                    request.userInput(),
                    response.answer(),
                    CharacterProfile.fromId(response.actingCharacterId()),
                    ConversationMode.fromValue(response.mode()),
                    List.of(),
                    Instant.now()
                )
            );
        } catch (RestClientException exception) {
            throw new ConversationIntegrationException("调用编排服务失败", exception);
        }
    }

    record OrchestratorRequest(
        String sessionId,
        String userInput,
        String actingCharacterId,
        String mode
    ) {
    }

    record OrchestratorResponse(
        String turnId,
        String answer,
        String actingCharacterId,
        String mode
    ) {
    }
}
