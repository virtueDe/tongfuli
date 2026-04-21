from dataclasses import dataclass
from typing import Any

from app.orchestration.service import OrchestrationRequest, OrchestrationService


@dataclass(slots=True)
class EvalCase:
    case_id: str
    user_input: str
    acting_character_id: str
    mode: str
    expected_question_type: str
    expected_layers: list[str]
    must_include: list[str]
    expected_degraded: bool


@dataclass(slots=True)
class EvalCaseResult:
    case_id: str
    passed: bool
    score: float
    details: dict[str, Any]


def evaluate_case(
    service: OrchestrationService,
    case: EvalCase,
) -> EvalCaseResult:
    answer = service.generate_answer(
        OrchestrationRequest(
            session_id=f"eval_{case.case_id}",
            user_input=case.user_input,
            acting_character_id=case.acting_character_id,
            mode=case.mode,
        )
    )

    checks = {
        "question_type": answer.question_type == case.expected_question_type,
        "retrieval_layers": answer.retrieval_plan.layers == case.expected_layers,
        "degraded": answer.postcheck.degraded == case.expected_degraded,
        "must_include": all(token in answer.answer for token in case.must_include),
    }
    score = sum(1 for item in checks.values() if item) / len(checks)

    return EvalCaseResult(
      case_id=case.case_id,
      passed=all(checks.values()),
      score=score,
      details={
          "checks": checks,
          "question_type": answer.question_type,
          "retrieval_layers": answer.retrieval_plan.layers,
          "degraded": answer.postcheck.degraded,
          "answer": answer.answer,
      },
    )


def summarize_results(results: list[EvalCaseResult]) -> dict[str, Any]:
    passed = sum(1 for result in results if result.passed)
    average_score = sum(result.score for result in results) / len(results)
    return {
        "total": len(results),
        "passed": passed,
        "failed": len(results) - passed,
        "average_score": round(average_score, 3),
    }
