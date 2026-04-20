# Web App

Tongfuli 的主站前端，当前承接 `T020` 的首版真实对话体验。

## 当前能力

- 首页直接进入对话页，不要求登录。
- 首次发送自动创建匿名会话。
- 支持消费 `answer.metadata`、`answer.delta`、`answer.completed`、`answer.error`。
- 支持角色切换、模式切换、最近一轮依据展开。

## 当前入口

- 页面入口：`app/page.tsx`
- 对话壳层：`app/_components/conversation-shell.tsx`
- API 客户端：`app/_lib/conversation-client.ts`

## 启动

```powershell
pnpm --filter web dev
```

如需指定后端地址，可设置：

```powershell
$env:NEXT_PUBLIC_CORE_PLATFORM_BASE_URL = "http://127.0.0.1:8080"
```

## 验证

```powershell
pnpm --filter web build
```

## 后续任务

- `T021` Web 专题页与分享落地页
- 更真实的依据内容与分享链路
- 浏览器级联调与 E2E
