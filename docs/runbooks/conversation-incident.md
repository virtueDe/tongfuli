# 对话链路故障排查

## 适用范围

用于排查 Web / 小程序发起提问后，回答失败、卡住或内容异常的问题。

## 首轮检查

按顺序确认：

1. `core-platform` 是否可访问：`http://127.0.0.1:8080/api/internal/health`
2. `ai-orchestrator` 是否可访问：`http://127.0.0.1:8001/health`
3. Web 是否能正常打开：`http://127.0.0.1:3000`

## 常见现象与处理

### 现象：`bootRun` 看起来一直卡住

- 如果日志已经出现 `Tomcat started on port 8080` 和 `Started CorePlatformApplication`，说明服务已经启动成功
- 终端停在 `bootRun` 是正常现象，因为它会持续前台运行等待请求

### 现象：Web 发送后无回答

- 打开浏览器网络面板，确认是否成功请求：
  - `POST /api/v1/public/sessions`
  - `POST /api/v1/public/sessions/{sessionId}/turns/stream`
- 如果建会话成功但流式回答失败，继续检查 `ai-orchestrator` 是否健康

### 现象：回答内容明显不对

- 当前 `ai-orchestrator` 仍是模板回答，不是真实检索
- 先确认这是否属于当前阶段的已知限制，不要误判成线上数据问题
- 如需判断是否回退，可跑本地评测：

```powershell
Set-Location .\services\ai-orchestrator
.\.venv\Scripts\python.exe -m pytest tests/test_conversation_api.py tests/test_eval_runner.py -q
.\.venv\Scripts\python.exe scripts/run_eval.py
```

### 现象：依据展开失败

- 检查最近一轮是否已有 `turnId`
- 确认接口 `GET /api/v1/public/turns/{turnId}/evidence` 是否返回 200
- 当前 evidence 仍是首版内存数据，服务重启后可能丢失

## 建议保留的排查证据

- 出问题的输入问题
- `sessionId`
- `turnId`
- 前端报错截图
- `core-platform` / `ai-orchestrator` 日志片段
