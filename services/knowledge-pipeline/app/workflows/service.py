class WorkflowService:
    """工作流占位，后续由 Temporal 任务驱动。"""

    def list_flows(self) -> list[str]:
        return ["ingestion", "extraction", "review", "publish"]
