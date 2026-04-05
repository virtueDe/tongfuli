class IndexingService:
    """索引服务占位，后续对接 OpenSearch、pgvector 与 Neo4j。"""

    def targets(self) -> list[str]:
        return ["opensearch", "pgvector", "neo4j"]
