# Observability

这里放 Tongfuli 的日志、指标、链路追踪和告警相关配置。

## 当前内容

- `compose.observability.yml`
  - 本地启动 Prometheus、Grafana、Loki、OpenTelemetry Collector
- `prometheus.yml`
  - 采集 `core-platform`、`ai-orchestrator`、`knowledge-pipeline` 的健康与指标入口
- `otel-collector-config.yml`
  - 接收 OTLP 数据并导出到日志与 Prometheus
- `loki-config.yml`
  - Loki 单机本地配置

## 启动

```powershell
docker compose -f infra/observability/compose.observability.yml up -d
```

## 当前默认端口

- Prometheus: `9090`
- Grafana: `3001`
- Loki: `3100`
- OTel Collector: `4317` / `4318`

## 当前限制

- 仍是本地开发态单机配置，没有告警路由、持久卷治理和生产权限收敛。
- 业务服务本身还没有全面接入真实 OTLP SDK 与自定义业务指标。
