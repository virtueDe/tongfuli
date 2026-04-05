class IngestionService:
    """导入服务占位，后续处理剧本与外部资料入库。"""

    def supported_sources(self) -> list[str]:
        return ["script", "web", "article", "manual_card"]
