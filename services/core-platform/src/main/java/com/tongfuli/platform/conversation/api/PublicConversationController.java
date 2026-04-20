package com.tongfuli.platform.conversation.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.validation.Valid;

import com.tongfuli.platform.conversation.application.ConversationService;
import com.tongfuli.platform.conversation.domain.ConversationTurn;

@RestController
@RequestMapping("/api/v1/public")
public class PublicConversationController {

    private static final int CHUNK_SIZE = 16;

    private final ConversationService conversationService;

    public PublicConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping("/sessions")
    ResponseEntity<CreateSessionResponse> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(CreateSessionResponse.fromSession(conversationService.createSession(request)));
    }

    @PostMapping("/sessions/{sessionId}/character-switch")
    ResponseEntity<CreateSessionResponse> switchCharacter(
        @PathVariable String sessionId,
        @Valid @RequestBody SwitchCharacterRequest request
    ) {
        return ResponseEntity.ok(CreateSessionResponse.fromSession(conversationService.switchCharacter(sessionId, request)));
    }

    @PostMapping("/sessions/{sessionId}/mode-switch")
    ResponseEntity<CreateSessionResponse> switchMode(
        @PathVariable String sessionId,
        @Valid @RequestBody SwitchModeRequest request
    ) {
        return ResponseEntity.ok(CreateSessionResponse.fromSession(conversationService.switchMode(sessionId, request)));
    }

    @PostMapping(path = "/sessions/{sessionId}/turns/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter streamTurn(
        @PathVariable String sessionId,
        @Valid @RequestBody StreamTurnRequest request
    ) {
        ConversationTurn turn = conversationService.prepareAnswer(sessionId, request).turn();
        SseEmitter emitter = new SseEmitter(0L);
        CompletableFuture.runAsync(() -> emitAnswer(emitter, turn));
        return emitter;
    }

    @GetMapping("/turns/{turnId}/evidence")
    ResponseEntity<TurnEvidenceResponse> getEvidence(@PathVariable String turnId) {
        return ResponseEntity.ok(TurnEvidenceResponse.fromTurn(conversationService.getTurn(turnId)));
    }

    @GetMapping("/sessions/recent")
    ResponseEntity<List<RecentSessionResponse>> recentSessions(@RequestParam String deviceId) {
        return ResponseEntity.ok(
            conversationService.getRecentSessions(deviceId).stream()
                .map(RecentSessionResponse::fromSession)
                .toList()
        );
    }

    @PostMapping("/turns/{turnId}/feedback")
    ResponseEntity<TurnFeedbackAcceptedResponse> submitFeedback(
        @PathVariable String turnId,
        @Valid @RequestBody SubmitTurnFeedbackRequest request
    ) {
        return ResponseEntity.ok(
            TurnFeedbackAcceptedResponse.fromFeedback(conversationService.submitFeedback(turnId, request))
        );
    }

    private void emitAnswer(SseEmitter emitter, ConversationTurn turn) {
        try {
            emitter.send(SseEmitter.event()
                .name("answer.metadata")
                .data(new AnswerMetadataEvent(
                    turn.turnId(),
                    turn.actingCharacter().id(),
                    turn.mode().value()
                )));

            for (String chunk : chunk(turn.answer())) {
                emitter.send(SseEmitter.event()
                    .name("answer.delta")
                    .data(new AnswerDeltaEvent(turn.turnId(), chunk)));
            }

            emitter.send(SseEmitter.event()
                .name("answer.completed")
                .data(new AnswerCompletedEvent(turn.turnId(), turn.answer())));
            emitter.complete();
        } catch (IOException exception) {
            try {
                emitter.send(SseEmitter.event()
                    .name("answer.error")
                    .data(new PublicApiError("回答流写出失败")));
            } catch (IOException ignored) {
                emitter.completeWithError(exception);
                return;
            }
            emitter.completeWithError(exception);
        }
    }

    private List<String> chunk(String answer) {
        List<String> result = new ArrayList<>();
        for (int index = 0; index < answer.length(); index += CHUNK_SIZE) {
            int end = Math.min(index + CHUNK_SIZE, answer.length());
            result.add(answer.substring(index, end));
        }
        return result;
    }

    record AnswerMetadataEvent(String turnId, String actingCharacterId, String mode) {
    }

    record AnswerDeltaEvent(String turnId, String delta) {
    }

    record AnswerCompletedEvent(String turnId, String answer) {
    }
}
