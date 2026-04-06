package com.tongfuli.platform.conversation.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("tongfuli.orchestrator")
public record OrchestratorProperties(String baseUrl) {
}
