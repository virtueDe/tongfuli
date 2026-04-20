package com.tongfuli.platform.admin.api;

import java.util.List;

public record TurnDiagnosticResponse(
    String turnId,
    String actingCharacterId,
    String mode,
    String riskLevel,
    List<String> evidenceTitles,
    String strategyName
) {
}
