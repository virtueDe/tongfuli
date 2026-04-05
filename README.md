# Tongfuli

《武林外传》主题的企业级 AI 对话问答平台，面向 C 端用户，支持 `Web + 小程序` 双端，后台覆盖内容治理、AI 策略治理、审核发布、问答诊断与运营分析。

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

## 技术栈

- 前端：`Next.js 15`、`React 19`、`TypeScript`、`Tailwind CSS`
- 小程序：`Taro + React + TypeScript`
- 主业务后端：`Java 21`、`Spring Boot 3`、`Spring Modulith`
- AI 与知识处理：`Python 3.12`、`FastAPI`
- 数据与基础设施：`PostgreSQL`、`Redis`、`OpenSearch`、`pgvector`、`Neo4j`、`Kafka`、`Temporal`

## 文档入口

- 架构总览：[docs/architecture/overview.md](docs/architecture/overview.md)
- 数据模型：[docs/architecture/data-model.md](docs/architecture/data-model.md)
- 技术研究：[docs/architecture/research.md](docs/architecture/research.md)
- 立项规格：[docs/initiatives/000-foundation/spec.md](docs/initiatives/000-foundation/spec.md)
- 实施计划：[docs/initiatives/000-foundation/plan.md](docs/initiatives/000-foundation/plan.md)
- 实施任务：[docs/initiatives/000-foundation/tasks.md](docs/initiatives/000-foundation/tasks.md)

## 当前状态

- [x] 第一版架构与规格文档完成
- [x] Git 仓库初始化
- [x] 仓库目录治理完成
- [ ] 前端与服务骨架初始化
- [ ] CI / CODEOWNERS / 质量门禁落地

## 启动原则

- 契约优先：先改 `contracts/` 再改服务实现
- 文档常驻：架构与 ADR 在 `docs/` 中持续维护
- 分层清晰：业务主系统、AI 编排、知识处理各司其职
- 测试先行：关键链路必须有单元、集成与 E2E 覆盖
