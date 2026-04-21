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

## 3. 视频资料入库

```json
{
  "title": "武林外传人物关系解析",
  "sourceType": "video",
  "sourceName": "bilibili:wulinyz",
  "platform": "bilibili",
  "platformVideoId": "BV1xx411c7mD",
  "sourceUrl": "https://www.bilibili.com/video/BV1xx411c7mD",
  "authorName": "江湖研究社",
  "publishedAt": "2026-04-21T08:00:00Z",
  "trustLevel": "medium",
  "contentLanguage": "zh-CN",
  "summary": "分析佟湘玉与白展堂关系演进",
  "transcript": "这一段主要讲的是……",
  "evidence": [
    {
      "snippetId": "snippet_vid_001",
      "kind": "transcript",
      "content": "湘玉已经默认老白会留下来",
      "timeOffsetSeconds": 128,
      "confidence": 0.93
    }
  ]
}
```

## 4. 审核结果

```json
{
  "reviewTaskId": "review_xxx",
  "decision": "approved",
  "reviewer": "ops_a",
  "note": "角色关系证据链完整",
  "targetIds": ["doc_xxx"]
}
```

## 5. 发布快照

```json
{
  "snapshotVersion": "2026.04.05-01",
  "releaseNote": "新增第 23 集相关梗点"
}
```
