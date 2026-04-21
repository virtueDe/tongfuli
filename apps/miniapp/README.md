# Miniapp

Tongfuli 的小程序端，对应 `T023`，当前已推进到第一组主对话与分享承接页。

## 当前状态

- 首页已升级为小程序主对话页。
- 已接公共会话链路中的建会话、角色切换、模式切换、最近会话、依据展开和反馈入口。
- 已补分享承接页 `pages/share/index`。
- 流式回答仍是首版兼容实现，后续还需要更稳的宿主级 SSE / 流式消费方案。

## 当前入口

- 主对话页：`src/pages/index/index.tsx`
- 分享承接页：`src/pages/share/index.tsx`
- 公共会话客户端：`src/lib/public-conversation-client.ts`

## 启动

```powershell
pnpm --filter miniapp dev
```

## 构建

```powershell
pnpm --filter miniapp build
```

## 当前任务状态

- `T023`：进行中，小程序主对话与分享承接首版已补齐，但仍缺更稳的流式链路、深链回流和宿主适配细节。

## 后续任务

- 优化小程序端 SSE / 流式消费兼容性。
- 支持分享页带预设问题和角色跳回主对话页。
- 补宿主环境样式、登录态和更真实的回流链路。
