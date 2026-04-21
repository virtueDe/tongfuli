import json
from pathlib import Path

from app.evals.scorer import EvalCase, evaluate_case, summarize_results
from app.orchestration.service import OrchestrationService


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    dataset_path = root / "evals" / "foundation_cases.json"
    raw_cases = json.loads(dataset_path.read_text(encoding="utf-8"))

    service = OrchestrationService()
    results = [
        evaluate_case(service, EvalCase(**case))
        for case in raw_cases
    ]
    summary = summarize_results(results)

    print(json.dumps(
        {
            "summary": summary,
            "results": [
                {
                    "case_id": result.case_id,
                    "passed": result.passed,
                    "score": result.score,
                    "details": result.details,
                }
                for result in results
            ],
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == "__main__":
    main()
