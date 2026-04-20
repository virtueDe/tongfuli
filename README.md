# Tongfuli

《武林外传》主题的企业级 AI 对话问答平台，面向 C 端用户，覆盖 `Web + 小程序 + 后台治理`，当前以“首条真实对话链路”作为基础能力继续向前推进。

## 仓库结构

```text
tongfuli/
  apps/
    web/
    admin/
    miniapp/
  services/
    core-platform/
    ai-orchestrator/
    knowledge-pipeline/
  packages/
    ui/
    domain-sdk/
    analytics/
    shared-utils/
  contracts/
  docs/
  infra/
  .boss/
```

## 当前进展

| 模块 | 状态 | 说明 |
|------|------|------|
| `apps/web` | 进行中 | 已支持匿名建会话、SSE 流式回答、角色切换、模式切换、依据展开。 |
| `apps/admin` | 骨架 | 已有后台首页骨架，真实治理工作台未开始。 |
| `apps/miniapp` | 骨架 | 已有首页骨架，真实会话与分享承接未开始。 |
| `services/core-platform` | 进行中 | 公共会话 API 首版已接通，仍是内存态实现。 |
| `services/ai-orchestrator` | 进行中 | 有内部回答接口，但仍是模板化回答，不是真实检索编排。 |
| `services/knowledge-pipeline` | 骨架 | 仅有健康检查、工作流占位与索引占位。 |

## 任务状态

基础任务状态以 [docs/initiatives/000-foundation/tasks.md](docs/initiatives/000-foundation/tasks.md) 为准。当前重点结论：

- `T001-T009` 已完成。
- `T013`、`T016`、`T018`、`T020`、`T025` 进行中。
- `T010-T012`、`T014-T015`、`T017`、`T019`、`T021-T024`、`T026` 未开始。

## 本地启动

先加载项目环境：

```powershell
. .\infra\scripts\use-dev-env.ps1
```

常用启动命令：

```powershell
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter miniapp dev
Set-Location .\services\core-platform; .\gradlew.bat bootRun
Set-Location .\services\ai-orchestrator; uv run uvicorn app.main:app --reload --port 8001
Set-Location .\services\knowledge-pipeline; uv run uvicorn app.main:app --reload --port 8002
```

## 常用验证

```powershell
pnpm --filter web build
Set-Location .\services\core-platform; .\gradlew.bat test --tests "*PublicConversationControllerTest"
Set-Location .\services\ai-orchestrator; uv run pytest tests/test_conversation_api.py -q
```

## 文档入口

- 需求规格：[docs/initiatives/000-foundation/spec.md](docs/initiatives/000-foundation/spec.md)
- 实施计划：[docs/initiatives/000-foundation/plan.md](docs/initiatives/000-foundation/plan.md)
- 实施任务：[docs/initiatives/000-foundation/tasks.md](docs/initiatives/000-foundation/tasks.md)
- 公共 API 契约：[contracts/public-api.md](contracts/public-api.md)
- 后台 API 契约：[contracts/admin-api.md](contracts/admin-api.md)
- 本地环境说明：[docs/runbooks/local-setup.md](docs/runbooks/local-setup.md)
