# Tongfuli 实施计划

## Summary

Tongfuli 项目以《武林外传》剧本为核心真源，构建一个面向 C 端用户的企业级角色化 AI 对话平台。首发形态采用 `Web + 小程序` 双端，首页直达主对话场景；后台优先建设内容资产治理与 AI 策略治理能力。项目采用模块化单体主业务后端、独立 AI 编排服务和独立知识处理平台的组合架构，以降低首发复杂度并保留企业级扩展空间。

## Technical Context

### 语言与运行时

- 前端：TypeScript
- 主业务后端：Java 21
- AI 与数据处理：Python 3.12

### 主要框架与工具

- Web / Admin：Next.js 15、React 19、Tailwind CSS、shadcn/ui
- 小程序：Taro + React
- 主业务后端：Spring Boot 3、Spring Modulith、Spring Security
- AI 服务：FastAPI、Pydantic
- 工作流：Temporal
- 消息队列：Kafka

### 存储与索引

- PostgreSQL：业务主数据、审核流、配置、版本
- Redis：缓存、限流、热点状态
- OpenSearch：全文检索与日志检索
- pgvector：首期向量索引
- Neo4j：关系图与事件图
- 对象存储：原始剧本、抓取原文、导入文件与审计附件

### 测试与质量

- 前端：Vitest、Playwright
- Java：JUnit 5、Testcontainers
- Python：Pytest
- 契约测试：OpenAPI / 事件载荷样例校验
- AI 评测：事实问答集、角色一致性集、越界回拉集

### 平台与运维

- 容器化：Docker
- 部署：Kubernetes、Helm、Argo CD
- 观测：OpenTelemetry、Prometheus、Grafana、Loki

### 性能与规模目标

- 首 token：2.5s - 4s
- 中等复杂度完整回答：6s - 12s
- 按 1 万 - 10 万 DAU 设计，预留活动峰值弹性

## Constitution Check

### 最小必要复杂度

- 不采用一开始全微服务方案，避免新项目被服务治理反噬。
- 使用模块化单体承载业务域，独立拆出 AI 编排与知识处理两个高异步、高演进模块。

### 数据结构优先

- 先建设剧本的深度结构化世界模型，再建设复杂问答能力。
- 所有结构化结论必须可追溯到原文证据或审核通过的资料来源。

### 兼容与回滚

- 线上只读发布态知识快照。
- 内容发布、策略发布、模型路由发布都必须带版本和回滚能力。

### 事实与表演分离

- 事实判断以 Canonical 为最高优先级。
- 角色表达和娱乐增强不得污染事实层。

## Project Structure

项目建议采用 monorepo：

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
  infra/
    deploy/
    observability/
    scripts/
  docs/
    architecture/
    adr/
    runbooks/
```

## Phase 0: Research

### 目标

在开工前把高影响技术决策钉死，避免项目刚起步就被错误边界拖死。

### 研究议题

1. 线上主回答使用闭源模型，离线处理使用开源模型的网关设计。
2. 剧本深度结构化的实体边界与证据追溯方案。
3. `PostgreSQL + pgvector + OpenSearch + Neo4j` 的职责分配与索引重建机制。
4. Web 与小程序双端下的共享逻辑与宿主隔离边界。
5. 匿名增长场景下的限流、风控与成本分层策略。

### 产出

- `research.md`
- `data-model.md`
- `contracts/`
- `quickstart.md`

## Phase 1: Design Artifacts

### 数据模型

- 定义 Universe、Character、Episode、Scene、Line、Event、Relationship、Meme、KnowledgeSource、ConversationSession、Turn、Mode 等核心实体。
- 定义知识对象的版本、审核与发布态。

### 契约

- 公共 API：会话、对话、角色切换、来源展开、分享承接。
- 后台 API：导入、审核、发布、策略配置、问答诊断。
- 事件契约：知识导入、审核通过、发布、索引完成、反馈提交。
- 导入格式：剧本导入包、外部资料入库格式、审核结果格式。

### 验证路径

- 主成功路径：匿名用户发起对话，切换角色，追问剧情，展开依据。
- 边界场景：用户在娱乐模式下问剧外话题，系统短答后回拉。
- 失败场景：导入的外部资料来源评级不足，被系统阻断发布。

## Phase 2: Task Generation Approach

`tasks.md` 将按以下顺序生成并执行：

1. 建立 monorepo 与基础工具链。
2. 初始化三大核心服务与双端前端骨架。
3. 搭建数据库、搜索、向量与图谱基础设施。
4. 建立知识导入、审核发布与索引链路。
5. 建立在线问答链路、角色切换与模式系统。
6. 建立后台内容资产、来源治理、AI 策略与诊断台。
7. 建立评测、观测、风控与降级体系。

## Complexity Tracking

### 复杂度来源

- 深度结构化剧本与外部资料双源治理
- 角色表达与事实准确率的双目标拉扯
- Web 与小程序双端并行建设
- 在线回答与离线知识处理的双 SLA 差异

### 控制手段

- 首发不做全微服务
- 首发不做长期记忆
- 首发不做多角色群聊核心体验
- 通过发布快照、事件流和独立 AI 编排服务降低耦合

## Progress Tracking

- [x] 产品方向确认
- [x] 总体架构方案确认
- [x] 知识治理策略确认
- [x] AI 链路与模式系统确认
- [x] 前后台能力地图确认
- [x] 第一版文档产物输出
- [ ] 代码仓结构初始化
- [ ] 基础设施与服务脚手架创建
- [ ] 第一阶段研发执行

## Open Risks

- 剧本文档原始格式未知，解析脚本可能需要针对性适配。
- 外部站点的版权边界、抓取限制和页面结构差异会影响采集效率。
- 若首发后增长速度快于预期，需要提前准备流量分层与缓存扩展策略。

## Recommendation

当前规划已可进入工程拆解与执行阶段，下一步应以 `tasks.md` 为实施入口，同时尽快把仓库骨架、ADR 目录与基础服务结构落下来。
