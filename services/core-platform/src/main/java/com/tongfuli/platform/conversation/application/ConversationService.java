package com.tongfuli.platform.conversation.application;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.tongfuli.platform.conversation.api.CreateSessionRequest;
import com.tongfuli.platform.conversation.api.StreamTurnRequest;
import com.tongfuli.platform.conversation.domain.CharacterProfile;
import com.tongfuli.platform.conversation.domain.ConversationMode;
import com.tongfuli.platform.conversation.domain.ConversationSession;
import com.tongfuli.platform.conversation.domain.ConversationTurn;

@Service
public class ConversationService {

    private final ConversationSessionRepository sessionRepository;
    private final OrchestratorGateway orchestratorGateway;

    public ConversationService(
        ConversationSessionRepository sessionRepository,
        OrchestratorGateway orchestratorGateway
    ) {
        this.sessionRepository = sessionRepository;
        this.orchestratorGateway = orchestratorGateway;
    }

    public ConversationSession createSession(CreateSessionRequest request) {
        ConversationSession session = new ConversationSession(
            "session_" + UUID.randomUUID().toString().replace("-", ""),
            request.clientType(),
            CharacterProfile.fromId(request.initialCharacterId()),
            ConversationMode.fromValue(request.initialMode()),
            Instant.now()
        );

        return sessionRepository.save(session);
    }

    public GeneratedAnswer prepareAnswer(String sessionId, StreamTurnRequest request) {
        ConversationSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new SessionNotFoundException(sessionId));

        CharacterProfile actingCharacter = CharacterProfile.fromId(request.actingCharacterId());
        ConversationMode mode = ConversationMode.fromValue(request.mode());

        sessionRepository.save(new ConversationSession(
            session.sessionId(),
            session.clientType(),
            actingCharacter,
            mode,
            session.createdAt()
        ));

        GeneratedAnswer answer = orchestratorGateway.generateAnswer(
            new OrchestratorGateway.Request(
                sessionId,
                request.input().trim(),
                actingCharacter,
                mode
            )
        );

        ConversationTurn turn = answer.turn();
        return new GeneratedAnswer(
            new ConversationTurn(
                turn.turnId(),
                sessionId,
                request.input().trim(),
                turn.answer(),
                turn.actingCharacter(),
                turn.mode(),
                Instant.now()
            )
        );
    }
}
