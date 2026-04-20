# Knowledge Pipeline

Tongfuli 的知识处理平台，对应 `T014`、`T015`，当前仍是服务骨架。

## 当前状态

- 已有 FastAPI 应用入口和健康检查。
- 工作流服务、索引服务仍是占位实现。
- 剧本导入、采集、抽取、审核、发布尚未开始。

## 关键目录

- 应用入口：`app/main.py`
- 工作流占位：`app/workflows/service.py`
- 索引占位：`app/indexing/service.py`

## 启动

```powershell
uv run uvicorn app.main:app --reload --port 8002
```

## 后续任务

- 剧本导入与结构化抽取
- 外部资料采集与审核
- 发布与索引刷新
