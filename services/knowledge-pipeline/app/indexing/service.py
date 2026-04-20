from dataclasses import dataclass


@dataclass(slots=True)
class IndexRefreshPlan:
    document_id: str
    targets: list[str]
    snapshot_version: str


class IndexingService:
    """发布后索引刷新计划的第一版实现。"""

    def targets(self) -> list[str]:
        return ["opensearch", "pgvector", "neo4j"]

    def plan_refresh(self, document_id: str, snapshot_version: str) -> IndexRefreshPlan:
        return IndexRefreshPlan(
            document_id=document_id,
            targets=self.targets(),
            snapshot_version=snapshot_version,
        )
