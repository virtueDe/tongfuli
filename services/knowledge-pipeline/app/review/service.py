class ReviewService:
    """审核工作流占位。"""

    def states(self) -> list[str]:
        return ["draft", "reviewing", "published", "archived"]
