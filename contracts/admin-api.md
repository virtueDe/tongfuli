# 后台 API 契约

本文档定义 Tongfuli 管理后台的核心接口边界，覆盖内容资产、来源治理、AI 策略与问答诊断。

## 1. 剧本导入

- 方法：`POST /api/v1/admin/scripts/import`
- 权限：`content:write`

## 2. 创建外部来源

- 方法：`POST /api/v1/admin/sources`
- 权限：`source:write`

## 3. 获取审核任务列表

- 方法：`GET /api/v1/admin/review-tasks`
- 权限：`review:read`

## 4. 审核通过或退回

- 方法：`POST /api/v1/admin/review-tasks/{taskId}/decision`
- 权限：`review:write`

## 5. 发布知识快照

- 方法：`POST /api/v1/admin/knowledge/publish`
- 权限：`publish:write`

## 6. 创建或更新策略版本

- 方法：`POST /api/v1/admin/strategies`
- 权限：`strategy:write`

## 7. 灰度发布策略

- 方法：`POST /api/v1/admin/strategies/{strategyId}/gray-release`
- 权限：`strategy:release`

## 8. 查看问答诊断

- 方法：`GET /api/v1/admin/diagnostics/turns/{turnId}`
- 权限：`diagnostic:read`

## 9. 回滚发布

- 方法：`POST /api/v1/admin/releases/{releaseId}/rollback`
- 权限：`publish:rollback`
