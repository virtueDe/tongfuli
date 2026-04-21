# Core Platform

Tongfuli 的主业务系统，当前承接 `T013`、`T018`、部分 `T025`。

## 当前能力

- 健康检查：`GET /api/internal/health`
- 公共会话 API：
  - `POST /api/v1/public/sessions`
  - `POST /api/v1/public/sessions/{sessionId}/character-switch`
  - `POST /api/v1/public/sessions/{sessionId}/mode-switch`
  - `POST /api/v1/public/sessions/{sessionId}/turns/stream`
  - `GET /api/v1/public/turns/{turnId}/evidence`
  - `GET /api/v1/public/sessions/recent`
  - `POST /api/v1/public/turns/{turnId}/feedback`

## 当前限制

- 会话、turn、反馈仍是内存仓储，重启即丢。
- 还没有真实持久化、契约测试、风控与限流。
- 后台治理 API 尚未开始。

## 关键目录

- 公共对话 API：`src/main/java/com/tongfuli/platform/conversation/api`
- 会话服务：`src/main/java/com/tongfuli/platform/conversation/application`
- 内存仓储：`src/main/java/com/tongfuli/platform/conversation/infrastructure`

## 启动

```powershell
. .\..\..\infra\scripts\use-dev-env.ps1
.\gradlew.bat bootRun
```

服务默认监听 `8080`。

如需在 VS Code 中启动，优先使用工作区里的 `Run and Debug -> Core Platform`，不要直接点击 `CorePlatformApplication.java` 文件上的默认运行按钮。

## 验证

```powershell
.\gradlew.bat test --tests "*PublicConversationControllerTest"
```

## 后续任务

- `T010` 公共/后台契约测试
- `T017` 风控、降级、限流
- `T019` 后台治理 API
