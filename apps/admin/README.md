# Admin App

Tongfuli 的后台管理端，对应 `T022`，当前仍是治理工作台骨架。

## 当前状态

- 已有后台首页与四个工作台入口卡片。
- 尚未接入真实 API、鉴权、审核流和发布流。

## 当前入口

- 首页：`app/page.tsx`

## 启动

```powershell
pnpm --filter admin dev
```

默认端口为 `3100`。

## 验证

```powershell
pnpm --filter admin build
```

## 后续任务

- 内容资产工作台
- 来源治理工作台
- AI 策略工作台
- 问答诊断工作台
