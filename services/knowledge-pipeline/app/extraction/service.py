from dataclasses import dataclass

from app.contracts import ScriptImportContract


@dataclass(slots=True)
class ExtractionSummary:
    character_count: int
    line_count: int
    entities: list[str]
    meme_candidates: int


class ExtractionService:
    """从剧本导入结果里抽取结构化实体的第一版实现。"""

    def entities(self) -> list[str]:
        return ["character", "scene", "event", "relationship", "meme"]

    def extract_script(self, contract: ScriptImportContract) -> ExtractionSummary:
        speakers = {item.speaker.strip() for item in contract.items if item.speaker.strip()}
        lines = [item.line.strip() for item in contract.items if item.line.strip()]
        meme_candidates = sum(1 for line in lines if len(line) <= 18)

        return ExtractionSummary(
            character_count=len(speakers),
            line_count=len(lines),
            entities=self.entities(),
            meme_candidates=meme_candidates,
        )
