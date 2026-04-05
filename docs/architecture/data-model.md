# Tongfuli 数据模型

## 1. 领域概览

Tongfuli 的数据模型分为五大类：

- 内容真源与结构化世界模型
- 外部资料与来源治理
- 会话与问答运行时
- 后台审核与发布
- 运营、分析与风控

## 2. 核心实体

### 2.1 Universe

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| code | string | 世界观编码 |
| name | string | 世界观名称 |
| status | enum | `draft/published/archived` |
| owner_team | string | 数据归属团队 |

### 2.2 Character

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| universe_id | UUID | 所属世界观 |
| name | string | 角色名 |
| aliases | string[] | 别名、常用称谓 |
| profile_summary | text | 角色简介 |
| speaking_style | jsonb | 语言风格约束 |
| behavior_traits | jsonb | 行为倾向 |
| knowledge_boundary | jsonb | 角色认知边界 |
| taboo_rules | jsonb | 出戏禁忌 |
| status | enum | `draft/reviewing/published/archived` |
| version | int | 版本号 |

关键校验：

- `name` 在同一 `universe_id` 内唯一
- 结构化设定必须保留来源证据引用

### 2.3 Episode

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| universe_id | UUID | 所属世界观 |
| episode_no | int | 集序号 |
| title | string | 标题 |
| synopsis | text | 摘要 |
| source_document_id | UUID | 来源剧本文档 |
| status | enum | 发布状态 |
| version | int | 版本号 |

### 2.4 Scene

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| episode_id | UUID | 所属集 |
| scene_no | int | 场景序号 |
| title | string | 场景标题或摘要 |
| location | string | 发生地点 |
| participants | UUID[] | 出场角色 |
| text_start_offset | int | 原文起始位置 |
| text_end_offset | int | 原文结束位置 |
| mood_tags | string[] | 情绪标签 |
| conflict_tags | string[] | 冲突标签 |

### 2.5 Line

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| scene_id | UUID | 所属场景 |
| speaker_id | UUID | 说话人 |
| audience_ids | UUID[] | 主要对话对象 |
| content | text | 台词原文 |
| canonical_quote | boolean | 是否经典台词 |
| meme_trigger | boolean | 是否梗点触发句 |
| start_offset | int | 原文起始位置 |
| end_offset | int | 原文结束位置 |

### 2.6 Event

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| scene_id | UUID | 所属场景 |
| event_type | string | 事件类型 |
| actor_ids | UUID[] | 发起角色 |
| target_ids | UUID[] | 目标角色 |
| summary | text | 事件摘要 |
| result_summary | text | 结果摘要 |
| evidence_line_ids | UUID[] | 证据台词 |
| timeline_order | int | 场景内时序 |

### 2.7 Relationship

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| source_character_id | UUID | 角色 A |
| target_character_id | UUID | 角色 B |
| relation_type | string | 关系类型 |
| strength | decimal | 强度 |
| effective_from_episode | int | 生效开始集 |
| effective_to_episode | int | 生效结束集，可空 |
| derived_from | enum | `canonical/interpretation/manual` |
| evidence_refs | jsonb | 证据引用 |

### 2.8 Meme

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| name | string | 梗名 |
| source_scene_id | UUID | 来源场景 |
| source_line_ids | UUID[] | 来源台词 |
| related_character_ids | UUID[] | 相关角色 |
| layer | enum | `canonical/interpretation/entertainment` |
| explanation | text | 解释 |
| modern_mapping | text | 现代语境映射 |
| usage_boundary | text | 使用边界 |

### 2.9 KnowledgeSource

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| source_type | enum | `script/web/article/manual_card` |
| title | string | 来源标题 |
| source_site | string | 来源站点 |
| author | string | 作者 |
| source_url | string | 原始地址 |
| license_status | string | 许可状态 |
| trust_level | enum | `high/medium/low` |
| capture_time | timestamptz | 抓取时间 |
| review_status | enum | 审核状态 |
| raw_object_key | string | 原始文件位置 |

### 2.10 KnowledgeDocument

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| source_id | UUID | 对应来源 |
| layer | enum | 知识层级 |
| parsed_text | text | 规范化文本 |
| chunk_manifest | jsonb | 切片清单 |
| status | enum | `draft/reviewing/published/archived` |
| version | int | 版本号 |

### 2.11 ConversationSession

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| visitor_id | string | 游客或账号标识 |
| client_type | enum | `web/miniapp` |
| current_mode | enum | `canon/extended/fun` |
| current_character_id | UUID | 当前角色 |
| title | string | 会话标题 |
| status | enum | `active/closed/blocked` |
| started_at | timestamptz | 创建时间 |
| ended_at | timestamptz | 结束时间，可空 |

### 2.12 Turn

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| session_id | UUID | 所属会话 |
| turn_no | int | 轮次 |
| actor_type | enum | `user/assistant/system` |
| acting_character_id | UUID | 当前说话角色，可空 |
| mode | enum | 回答模式 |
| question_type | enum | `fact/roleplay/meme/boundary/hybrid` |
| user_input | text | 用户原始输入 |
| answer_text | text | 系统回答 |
| evidence_refs | jsonb | 命中依据 |
| moderation_result | jsonb | 风控结果 |
| latency_ms | int | 端到端耗时 |
| confidence_score | decimal | 置信度 |

### 2.13 PromptStrategyVersion

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| strategy_name | string | 策略名 |
| target_scope | string | 作用范围 |
| version_no | int | 版本号 |
| config_payload | jsonb | 策略配置 |
| release_status | enum | `draft/gray/published/rolled_back` |
| changed_by | string | 变更人 |

### 2.14 ReviewTask

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | UUID | 主键 |
| task_type | enum | `source_review/knowledge_review/publish_review` |
| target_type | string | 目标对象类型 |
| target_id | UUID | 目标对象 |
| assignee | string | 审核人 |
| status | enum | `pending/in_review/approved/rejected` |
| decision_note | text | 审核备注 |
| decided_at | timestamptz | 审核时间 |

## 3. 状态流转

- 知识对象：`draft -> reviewing -> published -> archived`
- 策略对象：`draft -> gray -> published -> rolled_back`
- 会话对象：`active -> closed`，异常时可为 `blocked`

## 4. 关键规则

- 外部资料若 `trust_level=low` 且未人工终审，不得进入 `published`
- `Turn.question_type=fact` 时，`evidence_refs` 不得为空
- `Relationship.derived_from=canonical` 时，必须具备剧本文本证据
- 角色切换不会修改历史 `Turn.acting_character_id`

## 5. 数据归属

- 内容真源与结构化数据：内容运营团队
- 来源可信度与审核：审核团队
- Prompt 策略与模型路由：AI 运营团队
- 会话日志与埋点：平台数据团队
- 风控标记与封禁记录：安全运营团队
