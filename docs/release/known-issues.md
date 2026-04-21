# 当前已知问题

## Miniapp 工程依赖不完整

- 当前缺 `@tarojs/taro` 与 `@tarojs/cli`
- 结果是 `pnpm --filter miniapp build` 目前无法通过
- 影响：不阻塞 Web / Admin / 后端联调，但阻塞小程序正式验收

## AI 编排仍是模板回答

- `ai-orchestrator` 还未接真实模型与真实检索
- 影响：当前更适合演示链路，不适合对回答质量做上线级承诺

## Core Platform 仍是内存态

- 会话、turn、反馈重启即丢
- 影响：无法支撑真实生产持久化场景

## Admin 缺鉴权与回滚发布

- 当前 Admin 是首版工作台，不是完整治理后台
- 影响：只能作为开发联调和功能演示基线

## 观测栈是本地单机配置

- 只有本地 compose 和基础配置，没有生产 Dashboard / Alert
- 影响：当前只适合开发联调阶段
