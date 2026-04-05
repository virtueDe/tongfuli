# 事件契约

Tongfuli 通过 Kafka 传递关键异步事件。事件均包含通用头：

```json
{
  "eventId": "evt_xxx",
  "eventType": "knowledge.published",
  "occurredAt": "2026-04-05T12:00:00Z",
  "traceId": "trace_xxx",
  "producer": "knowledge-pipeline"
}
```

## 关键事件

- `source.ingested`
- `knowledge.extracted`
- `knowledge.reviewed`
- `knowledge.published`
- `retrieval.indexed`
- `conversation.completed`
- `answer.flagged`
