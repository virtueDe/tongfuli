from dataclasses import dataclass


@dataclass(slots=True)
class RetrievalPlan:
    question_type: str
    layers: list[str]
    strategies: list[str]


class RetrievalService:
    """首版多路检索规划服务。"""

    def list_layers(self) -> list[str]:
        return ["canonical", "interpretation", "entertainment"]

    def plan(self, question_type: str, mode: str) -> RetrievalPlan:
        if question_type == "fact":
            layers = ["canonical"]
            strategies = ["keyword", "scene_link"]
        elif question_type == "meme":
            layers = ["canonical", "entertainment"] if mode == "fun" else ["canonical"]
            strategies = ["meme_tag", "keyword"]
        else:
            layers = ["canonical", "interpretation"]
            strategies = ["keyword", "character_graph"]

        return RetrievalPlan(
            question_type=question_type,
            layers=layers,
            strategies=strategies,
        )
