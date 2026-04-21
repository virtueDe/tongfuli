# 首发发布计划

## 发布目标

基于当前 foundation 任务，形成一个“可演示、可联调、可继续迭代”的首发基线。

## 建议发布顺序

1. 启动 `ai-orchestrator`
2. 启动 `core-platform`
3. 启动 `knowledge-pipeline`
4. 启动 Web 与 Admin
5. 启动 observability stack
6. 验证公共对话、后台治理、评测脚本与基础观测

## 发布前验证命令

```powershell
pnpm --filter web build
pnpm --filter admin build
pnpm exec tsc -p packages/analytics/tsconfig.json --noEmit
Set-Location .\services\ai-orchestrator
.\.venv\Scripts\python.exe -m pytest tests/test_conversation_api.py tests/test_eval_runner.py -q
.\.venv\Scripts\python.exe scripts/run_eval.py
Set-Location ..\..
docker compose -f infra/observability/compose.observability.yml config
```

## 发布后冒烟检查

- 打开 Web 首页，确认主对话页加载正常
- 打开 `/topics` 与 `/share/laobai-fear-chain`
- 打开 Admin 首页，确认工作台渲染正常
- 访问 `http://127.0.0.1:8080/api/internal/health`
- 访问 `http://127.0.0.1:8001/health`
- 访问 Prometheus `http://127.0.0.1:9090`

## 当前不纳入首发阻断的事项

- Miniapp 构建未完成
- 后台鉴权未完成
- 真实内容资产与发布回滚未完成
- 线上观测与告警未完成
