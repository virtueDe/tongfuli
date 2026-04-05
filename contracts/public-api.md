# 公共 API 契约

本文档定义 Tongfuli 面向 Web 与小程序前台的核心接口边界。接口风格为 REST + SSE 流式输出。

## 1. 创建会话

- 方法：`POST /api/v1/public/sessions`

请求体：

```json
{
  "clientType": "web",
  "initialMode": "canon",
  "initialCharacterId": "char_baizhantang",
  "deviceId": "web_visitor_xxx"
}
```

## 2. 发送消息并获取流式回答

- 方法：`POST /api/v1/public/sessions/{sessionId}/turns/stream`

请求体：

```json
{
  "input": "老白为什么怕佟掌柜？",
  "mode": "canon",
  "actingCharacterId": "char_baizhantang",
  "showEvidenceHint": false
}
```

SSE 事件：

- `answer.delta`
- `answer.completed`
- `answer.metadata`
- `answer.error`

## 3. 切换当前角色

- 方法：`POST /api/v1/public/sessions/{sessionId}/character-switch`

请求体：

```json
{
  "targetCharacterId": "char_guofurong"
}
```

## 4. 切换模式

- 方法：`POST /api/v1/public/sessions/{sessionId}/mode-switch`

请求体：

```json
{
  "targetMode": "fun"
}
```

## 5. 展开依据

- 方法：`GET /api/v1/public/turns/{turnId}/evidence`

## 6. 获取最近会话

- 方法：`GET /api/v1/public/sessions/recent`
- 查询参数：`deviceId`

## 7. 提交反馈

- 方法：`POST /api/v1/public/turns/{turnId}/feedback`

请求体：

```json
{
  "feedbackType": "incorrect_fact",
  "note": "这里的剧情顺序不对"
}
```
