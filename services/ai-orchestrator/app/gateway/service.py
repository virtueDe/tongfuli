from dataclasses import dataclass


@dataclass(slots=True)
class GatewayRequest:
    prompt: str
    mode: str
    acting_character_id: str


class ModelGateway:
    """首版模型网关，以稳定可预测的本地拼装替代真实模型。"""

    def provider(self) -> str:
        return "local-composer"

    def generate(self, request: GatewayRequest) -> str:
        tone = {
            "canon": "尽量贴原剧",
            "extended": "补充更多背景",
            "fun": "适当玩梗但不出戏",
        }.get(request.mode, "尽量贴原剧")

        return f"{request.prompt} 当前生成策略：{tone}。"
