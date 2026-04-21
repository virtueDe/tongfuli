# 观测栈运行手册

## 目标

用于本地启动 Tongfuli 的基础观测栈，覆盖指标、日志与 OTLP 接收入口。

## 组成

- Prometheus：查看抓取目标与时间序列
- Grafana：统一看板入口
- Loki：日志存储
- OpenTelemetry Collector：接收 OTLP 并转发到本地观测组件

## 启动

在仓库根目录执行：

```powershell
docker compose -f infra/observability/compose.observability.yml up -d
```

## 验证

### 验证容器状态

```powershell
docker compose -f infra/observability/compose.observability.yml ps
```

### 验证关键端口

```powershell
Invoke-WebRequest http://127.0.0.1:9090/-/ready
Invoke-WebRequest http://127.0.0.1:3001/login
Invoke-WebRequest http://127.0.0.1:3100/ready
Invoke-WebRequest http://127.0.0.1:9464/metrics
```

### 验证业务服务可被抓取

- `core-platform` 需要本地启动并暴露 `8080`
- `ai-orchestrator` 需要本地启动并暴露 `8001`
- `knowledge-pipeline` 需要本地启动并暴露 `8002`

Prometheus Targets 页面检查：

- `core-platform-health`
- `ai-orchestrator-health`
- `knowledge-pipeline-health`
- `otel-collector`

## 常见问题

### `core-platform-health` 抓取失败

- 先确认 Spring Boot 已启动
- 再确认 `management.endpoints.web.exposure.include=prometheus` 已打开
- 如在 Windows Docker Desktop 上运行，确认 `host.docker.internal` 可用

### `ai-orchestrator` / `knowledge-pipeline` 抓取失败

- 当前首版只抓健康检查，服务未启动时会直接标红
- 如果后续补 `/metrics`，需要同步修改 `prometheus.yml`

### Grafana 打不开

- 默认账户：`admin / admin`
- 首次登录后建议立刻修改密码

## 当前限制

- 还没有预置 dashboard、alert rule、contact point
- 还没有接业务埋点和 Trace ID 回查
