# Tongfuli 实施任务清单

以下任务基于当前 `spec.md`、`plan.md`、`research.md`、`data-model.md`、`contracts/` 与 `quickstart.md` 生成。任务按依赖顺序排列，可直接作为工程执行入口。

## Task List

- `T001` 初始化 monorepo 与基础开发规范
  - 主要文件：`package.json`、`pnpm-workspace.yaml`、`turbo.json`、`.editorconfig`、`.eslintrc.*`
  - 依赖：无

- `T002` [P] 建立 Web 主站脚手架
  - 主要文件：`apps/web/**`
  - 依赖：`T001`

- `T003` [P] 建立后台管理台脚手架
  - 主要文件：`apps/admin/**`
  - 依赖：`T001`

- `T004` [P] 建立小程序脚手架
  - 主要文件：`apps/miniapp/**`
  - 依赖：`T001`

- `T005` [P] 创建共享包
  - 主要文件：`packages/ui/**`、`packages/domain-sdk/**`、`packages/analytics/**`
  - 依赖：`T001`

- `T006` 建立主业务后端骨架
  - 主要文件：`services/core-platform/**`
  - 依赖：`T001`

- `T007` 建立 AI 编排服务骨架
  - 主要文件：`services/ai-orchestrator/**`
  - 依赖：`T001`

- `T008` 建立知识处理平台骨架
  - 主要文件：`services/knowledge-pipeline/**`
  - 依赖：`T001`

- `T009` [P] 基础设施编排与本地开发环境
  - 主要文件：`infra/deploy/**`
  - 依赖：`T001`

- `T010` [P] 公共与后台 API 契约测试
  - 主要文件：`services/core-platform/tests/contracts/**`
  - 依赖：`T006`

- `T011` [P] 事件与导入格式契约测试
  - 主要文件：`services/core-platform/tests/events/**`、`services/knowledge-pipeline/tests/contracts/**`
  - 依赖：`T006`、`T008`

- `T012` [P] 建立内容与来源治理域模型
  - 主要文件：`services/core-platform/src/main/java/**/content/**`、`services/core-platform/src/main/java/**/source/**`
  - 依赖：`T006`

- `T013` [P] 建立会话与策略域模型
  - 主要文件：`services/core-platform/src/main/java/**/conversation/**`、`services/core-platform/src/main/java/**/strategy/**`
  - 依赖：`T006`

- `T014` 建立剧本导入、外部资料采集与结构化抽取管线
  - 主要文件：`services/knowledge-pipeline/app/pipeline/**`
  - 依赖：`T008`、`T011`、`T012`

- `T015` 建立审核、发布与索引刷新工作流
  - 主要文件：`services/knowledge-pipeline/app/workflows/**`、`services/knowledge-pipeline/app/indexing/**`
  - 依赖：`T014`

- `T016` 建立 AI 编排主链路与多路检索
  - 主要文件：`services/ai-orchestrator/app/orchestration/**`、`services/ai-orchestrator/app/retrieval/**`
  - 依赖：`T007`、`T013`、`T015`

- `T017` 建立后校验、降级、风控与限流
  - 主要文件：`services/ai-orchestrator/app/postcheck/**`、`services/core-platform/src/main/java/**/moderation/**`
  - 依赖：`T016`

- `T018` 实现公共会话 API
  - 主要文件：`services/core-platform/src/main/java/**/api/public/**`
  - 依赖：`T013`、`T016`、`T017`、`T010`

- `T019` 实现后台内容、来源、策略与诊断 API
  - 主要文件：`services/core-platform/src/main/java/**/api/admin/**`
  - 依赖：`T012`、`T013`、`T015`、`T016`、`T017`、`T010`

- `T020` 实现 Web 主对话页、角色切换与依据展开
  - 主要文件：`apps/web/app/**`
  - 依赖：`T002`、`T005`、`T018`

- `T021` 实现 Web 梗专题与分享落地页
  - 主要文件：`apps/web/app/topics/**`、`apps/web/app/share/**`
  - 依赖：`T002`、`T019`

- `T022` 实现后台内容资产、来源治理与 AI 策略工作台
  - 主要文件：`apps/admin/app/**`
  - 依赖：`T003`、`T019`

- `T023` 实现小程序主对话页与分享承接
  - 主要文件：`apps/miniapp/src/**`
  - 依赖：`T004`、`T018`

- `T024` [P] 建立埋点、分析与问答评测体系
  - 主要文件：`packages/analytics/**`、`services/ai-orchestrator/evals/**`
  - 依赖：`T005`、`T016`

- `T025` [P] 建立观测与发布运行手册
  - 主要文件：`infra/observability/**`、`docs/runbooks/**`
  - 依赖：`T006`、`T007`、`T008`、`T009`

- `T026` 收尾与首发验收
  - 主要文件：`docs/release/**`
  - 依赖：`T020`、`T021`、`T022`、`T023`、`T024`、`T025`

## 并行执行建议

- 第一组：`T002`、`T003`、`T004`、`T005`
- 第二组：`T010`、`T011`、`T012`、`T013`
- 第三组：`T020`、`T021`、`T022`、`T023`
- 第四组：`T024`、`T025`
