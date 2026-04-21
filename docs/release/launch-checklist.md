# 首发验收清单

## 1. 代码与任务状态

- [x] `docs/initiatives/000-foundation/tasks.md` 已更新到当前实现状态
- [x] Web / Admin / Miniapp / Python / Java / Infra README 已同步当前状态
- [ ] `T026` 之外的所有首发必需任务达到“可验收”标准

## 2. Web 体验

- [x] 主对话页可构建
- [x] 专题页与分享落地页可构建
- [ ] 接入真实后台内容资产
- [ ] 浏览器级 E2E

## 3. Admin 工作台

- [x] 工作台页面可构建
- [x] 内容导入、来源治理、审核决策、知识发布、策略灰度、诊断首版可操作
- [ ] 接鉴权与更真实数据源
- [ ] 补回滚发布入口

## 4. Miniapp

- [x] 主对话页与分享承接页代码已落地
- [ ] 补 `@tarojs/taro` / `@tarojs/cli` 等工程依赖
- [ ] 完成小程序构建验证
- [ ] 完成宿主环境联调

## 5. 后端服务

- [x] `core-platform` 可启动
- [x] `ai-orchestrator` 测试与本地评测通过
- [x] `knowledge-pipeline` 首版工作流与测试已落地
- [ ] `core-platform` / `knowledge-pipeline` 的更多契约与生产化链路仍待补

## 6. 观测与运维

- [x] 本地 observability compose 与 runbook 已补齐
- [ ] 真实指标埋点
- [ ] Dashboard
- [ ] 告警与值班链路

## 7. 发布前必须再确认

- [ ] 所有首发目标环境变量已确认
- [ ] 所有服务镜像能成功构建
- [ ] 发布回滚步骤已演练
- [ ] 关键路径截图或录屏已沉淀
