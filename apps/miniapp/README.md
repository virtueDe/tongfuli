# Miniapp

Tongfuli 的小程序端，对应 `T023`，当前仍处于首页骨架阶段。

## 当前状态

- 已有首页文案、输入框和按钮占位。
- 真实会话 API、分享承接页和回流链路尚未接入。

## 当前入口

- 首页：`src/pages/index/index.tsx`

## 启动

```powershell
pnpm --filter miniapp dev
```

## 构建

```powershell
pnpm --filter miniapp build
```

## 后续任务

- 主对话页接 `T018` 公共会话 API
- 分享承接页
- 小程序侧 UI 和宿主适配
