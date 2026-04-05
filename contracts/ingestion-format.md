# 导入格式契约

## 1. 剧本导入包

支持格式：

- `.docx`
- `.pdf`
- `.txt`
- `.md`

必填元数据：

```json
{
  "title": "武林外传剧本批次 1",
  "sourceType": "script",
  "licenseStatus": "commercial_authorized",
  "versionTag": "v1",
  "language": "zh-CN"
}
```

## 2. 外部资料入库

```json
{
  "title": "某站梗指南文章",
  "sourceType": "web",
  "sourceSite": "example.com",
  "sourceUrl": "https://example.com/post/123",
  "trustLevel": "medium",
  "capturedAt": "2026-04-05T12:00:00Z",
  "licenseStatus": "to_be_verified"
}
```

## 3. 审核结果

```json
{
  "reviewTaskId": "review_xxx",
  "decision": "approved",
  "reviewer": "ops_a",
  "note": "角色关系证据链完整",
  "targetIds": ["doc_xxx"]
}
```

## 4. 发布快照

```json
{
  "snapshotVersion": "2026.04.05-01",
  "releaseNote": "新增第 23 集相关梗点"
}
```
