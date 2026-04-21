# Web App

Tongfuli 的主站前端，当前承接 `T020/T021` 的首版用户体验。

## 当前能力

- 首页直接进入主对话页，不要求登录。
- 首次发送自动创建匿名会话。
- 支持消费 `answer.metadata`、`answer.delta`、`answer.completed`、`answer.error`。
- 支持角色切换、模式切换、最近一轮依据展开。
- 已补专题入口页 `/topics` 与分享落地页 `/share/[slug]` 的首版静态链路。

## 当前入口

- 主对话页：`app/page.tsx`
- 专题页：`app/topics/page.tsx`
- 分享页：`app/share/[slug]/page.tsx`
- 对话壳层：`app/_components/conversation-shell.tsx`
- 话题数据：`app/_lib/topic-content.ts`
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

## 当前状态

- `T020`：进行中，主对话页首版已接通。
- `T021`：进行中，专题页与分享落地页首版已补齐，但仍是静态样例链路。

## 后续任务

- 把专题与分享页接到真实后台内容资产和发布数据。
- 支持带预设角色、模式、问题的深链跳转。
- 补浏览器级联调与 E2E。
