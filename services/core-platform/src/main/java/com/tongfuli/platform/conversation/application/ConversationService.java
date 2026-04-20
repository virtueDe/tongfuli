package com.tongfuli.platform.conversation.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tongfuli.platform.conversation.api.CreateSessionRequest;
import com.tongfuli.platform.conversation.api.SubmitTurnFeedbackRequest;
import com.tongfuli.platform.conversation.api.StreamTurnRequest;
import com.tongfuli.platform.conversation.api.SwitchCharacterRequest;
import com.tongfuli.platform.conversation.api.SwitchModeRequest;
import com.tongfuli.platform.conversation.domain.CharacterProfile;
import com.tongfuli.platform.conversation.domain.ConversationMode;
import com.tongfuli.platform.conversation.domain.ConversationSession;
import com.tongfuli.platform.conversation.domain.ConversationTurn;
import com.tongfuli.platform.conversation.domain.ConversationTurnFeedback;
import com.tongfuli.platform.conversation.domain.TurnEvidenceItem;

@Service
public class ConversationService {

    private final ConversationSessionRepository sessionRepository;
    private final ConversationTurnRepository turnRepository;
    private final TurnFeedbackRepository feedbackRepository;
    private final OrchestratorGateway orchestratorGateway;

    public ConversationService(
        ConversationSessionRepository sessionRepository,
        ConversationTurnRepository turnRepository,
        TurnFeedbackRepository feedbackRepository,
        OrchestratorGateway orchestratorGateway
    ) {
        this.sessionRepository = sessionRepository;
        this.turnRepository = turnRepository;
        this.feedbackRepository = feedbackRepository;
        this.orchestratorGateway = orchestratorGateway;
    }

    public ConversationSession createSession(CreateSessionRequest request) {
        Instant now = Instant.now();
        ConversationSession session = new ConversationSession(
            "session_" + UUID.randomUUID().toString().replace("-", ""),
            request.clientType(),
            request.deviceId(),
            CharacterProfile.fromId(request.initialCharacterId()),
            ConversationMode.fromValue(request.initialMode()),
            now,
            now
        );

        return sessionRepository.save(session);
    }

    public ConversationSession switchCharacter(String sessionId, SwitchCharacterRequest request) {
        ConversationSession session = loadSession(sessionId);
        return saveUpdatedSession(
            session,
            CharacterProfile.fromId(request.targetCharacterId()),
            session.currentMode()
        );
    }

    public ConversationSession switchMode(String sessionId, SwitchModeRequest request) {
        ConversationSession session = loadSession(sessionId);
        return saveUpdatedSession(
            session,
            session.currentCharacter(),
            ConversationMode.fromValue(request.targetMode())
        );
    }

    public GeneratedAnswer prepareAnswer(String sessionId, StreamTurnRequest request) {
        ConversationSession session = loadSession(sessionId);
        CharacterProfile actingCharacter = CharacterProfile.fromId(request.actingCharacterId());
        ConversationMode mode = ConversationMode.fromValue(request.mode());
        saveUpdatedSession(session, actingCharacter, mode);

        GeneratedAnswer answer = orchestratorGateway.generateAnswer(
            new OrchestratorGateway.Request(
                sessionId,
                request.input().trim(),
                actingCharacter,
                mode
            )
        );

        ConversationTurn turn = answer.turn();
        return new GeneratedAnswer(turnRepository.save(
            new ConversationTurn(
                turn.turnId(),
                sessionId,
                request.input().trim(),
                turn.answer(),
                turn.actingCharacter(),
                turn.mode(),
                buildEvidence(request.input().trim(), turn.answer(), turn.actingCharacter(), turn.mode()),
                Instant.now()
            )
        ));
    }

    public ConversationTurn getTurn(String turnId) {
        return turnRepository.findById(turnId)
            .orElseThrow(() -> new TurnNotFoundException(turnId));
    }

    public List<ConversationSession> getRecentSessions(String deviceId) {
        return sessionRepository.findRecentByDeviceId(deviceId.trim(), 10);
    }

    public ConversationTurnFeedback submitFeedback(String turnId, SubmitTurnFeedbackRequest request) {
        getTurn(turnId);
        return feedbackRepository.save(
            new ConversationTurnFeedback(
                turnId,
                request.feedbackType().trim(),
                request.note() == null ? "" : request.note().trim(),
                Instant.now()
            )
        );
    }

    private ConversationSession loadSession(String sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new SessionNotFoundException(sessionId));
    }

    private ConversationSession saveUpdatedSession(
        ConversationSession session,
        CharacterProfile currentCharacter,
        ConversationMode currentMode
    ) {
        return sessionRepository.save(
            new ConversationSession(
                session.sessionId(),
                session.clientType(),
                session.deviceId(),
                currentCharacter,
                currentMode,
                session.createdAt(),
                Instant.now()
            )
        );
    }

    private List<TurnEvidenceItem> buildEvidence(
        String input,
        String answer,
        CharacterProfile actingCharacter,
        ConversationMode mode
    ) {
        String evidenceKey = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return List.of(
            new TurnEvidenceItem(
                "ev_canonical_" + evidenceKey,
                "canonical",
                "问题锚点",
                "用户问题：" + input
            ),
            new TurnEvidenceItem(
                "ev_character_" + evidenceKey,
                "character",
                actingCharacter.displayName() + " 角色口吻",
                "本轮回答按 " + actingCharacter.displayName() + " 的身份组织表达。"
            ),
            new TurnEvidenceItem(
                "ev_mode_" + evidenceKey,
                "mode",
                mode.label(),
                "当前模式为 " + mode.label() + "，回答摘要：" + answer
            )
        );
    }
}
