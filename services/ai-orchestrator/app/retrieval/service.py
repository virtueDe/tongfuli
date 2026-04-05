class RetrievalService:
    """检索服务占位，后续会接入全文、向量、标签与图谱检索。"""

    def list_layers(self) -> list[str]:
        return ["canonical", "interpretation", "entertainment"]
