# AI Orchestrator

Tongfuli 的 AI 编排服务，当前承接 `T016` 的首版内部回答链路。

## 当前能力

- 健康检查：`GET /health`
- 内部回答接口：`POST /internal/orchestration/answers`
- 根据角色和模式返回模板化回答，供 `core-platform` 调用

## 当前限制

- 仍是模板化回答，不包含真实检索、重排、模型路由与后校验。
- 没有评测集、风控、降级和限流。

## 关键目录

- 应用入口：`app/main.py`
- 对话 API：`app/api/conversation.py`
- 编排服务：`app/orchestration/service.py`
- 测试：`tests/test_conversation_api.py`

## 启动

```powershell
uv run uvicorn app.main:app --reload --port 8001
```

## 验证

```powershell
uv run pytest tests/test_conversation_api.py -q
```

## 后续任务

- 多路检索与上下文拼装
- 真实模型网关
- 后校验、风控、限流、评测
