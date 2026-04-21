import json
from pathlib import Path

from app.evals.scorer import EvalCase, evaluate_case, summarize_results
from app.orchestration.service import OrchestrationService


def test_foundation_eval_cases_should_pass() -> None:
    dataset_path = Path(__file__).resolve().parents[1] / "evals" / "foundation_cases.json"
    raw_cases = json.loads(dataset_path.read_text(encoding="utf-8"))

    service = OrchestrationService()
    results = [
        evaluate_case(service, EvalCase(**case))
        for case in raw_cases
    ]
    summary = summarize_results(results)

    assert summary["total"] == 3
    assert summary["failed"] == 0
    assert summary["average_score"] == 1.0
    assert all(result.passed for result in results)
