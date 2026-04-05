class PostCheckService:
    """后校验占位，后续负责事实支撑、角色一致性和越界检查。"""

    def evaluate(self, answer_text: str) -> dict[str, object]:
        return {
            "answerLength": len(answer_text),
            "needsRewrite": False,
        }
