# AI Orchestrator

Tongfuli 的 AI 编排服务，当前承接 `T016/T017/T024` 的首版内部回答链路。

## 当前能力

- 健康检查：`GET /health`
- 内部回答接口：`POST /internal/orchestration/answers`
- 根据角色和模式返回模板化回答，供 `core-platform` 调用
- 已补首版本地评测集、评分器和评测脚本

## 当前限制

- 仍是模板化回答，不包含真实检索、重排、模型路由与后校验。
- 评测仍是规则型离线验证，不是线上评估闭环。

## 关键目录

- 应用入口：`app/main.py`
- 对话 API：`app/api/conversation.py`
- 编排服务：`app/orchestration/service.py`
- 评测评分器：`app/evals/scorer.py`
- 评测数据：`evals/foundation_cases.json`
- 评测脚本：`scripts/run_eval.py`
- 测试：`tests/test_conversation_api.py`、`tests/test_eval_runner.py`

## 启动

```powershell
uv run uvicorn app.main:app --reload --port 8001
```

## 验证

```powershell
uv run pytest tests/test_conversation_api.py tests/test_eval_runner.py -q
python scripts/run_eval.py
```

## 后续任务

- 多路检索与上下文拼装
- 真实模型网关
- 线上埋点联动和自动化回归评测
