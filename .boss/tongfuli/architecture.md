# Architecture

## 摘要

- 仓库采用单仓 monorepo，前端、Java 主业务、Python AI 服务和基础设施统一管理。
- 系统架构采用 `模块化单体 + 独立 AI 编排服务 + 独立知识处理平台`。
- 知识系统采用 `Canonical / Interpretation / Entertainment` 三层治理。
- 在线链路遵循“问题理解 -> 策略决策 -> 检索 -> 生成 -> 后校验 -> 展示裁决”。

## 系统分层

- `apps/`：Web、Admin、小程序
- `services/core-platform`：Java 主业务系统
- `services/ai-orchestrator`：Python AI 编排
- `services/knowledge-pipeline`：Python 知识处理
- `contracts/`：公共 API、后台 API、事件、导入格式契约
- `docs/`：架构、规格、计划与 ADR

## 技术选型

- 前端：Next.js、React、TypeScript、Tailwind、Taro
- Java：Java 21、Spring Boot 3、Spring Modulith、Spring Security
- Python：Python 3.12、FastAPI、Pydantic
- 数据：PostgreSQL、Redis、OpenSearch、pgvector、Neo4j
- 基础设施：Kafka、Temporal、Docker、Kubernetes、OpenTelemetry

## 关键边界

- `core-platform` 维护业务真相与后台治理
- `ai-orchestrator` 维护问答链路和模型调用
- `knowledge-pipeline` 维护剧本解析、外部资料处理、审核发布前加工
- 线上只读取发布态知识快照
