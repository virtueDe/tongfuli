"use client";

import { useEffect, useState } from "react";

import {
  createSource,
  createStrategy,
  decideReviewTask,
  getAdminApiBaseUrl,
  getTurnDiagnostic,
  grayReleaseStrategy,
  importScript,
  listReviewTasks,
  publishKnowledge,
  type PublishKnowledgeReceipt,
  type ReviewTaskSummary,
  type StrategyVersionSummary,
  type TurnDiagnosticSummary,
} from "./_lib/admin-client";

type PanelStatus = "idle" | "loading" | "success" | "error";

const WORKBENCHES = [
  {
    title: "内容与来源",
    summary: "导入剧本、登记外部来源，并把审核任务拉出来直接处理。",
  },
  {
    title: "知识发布",
    summary: "发布知识快照，先把 release receipt 跑通，后面再补回滚。",
  },
  {
    title: "AI 策略",
    summary: "创建策略版本、执行灰度发布，验证后台策略工作台最小闭环。",
  },
  {
    title: "问答诊断",
    summary: "按 turnId 查询诊断，给运营和调参留出检查入口。",
  },
];

const INITIAL_SCRIPT = {
  sourceName: "wulinwaizhuan-official-script",
  scriptTitle: "武林外传第一回",
  language: "zh-CN",
  rawContent: "掌柜的催得紧，老白嘴上贫，心里已经开始盘算怎么圆场。",
};

const INITIAL_SOURCE = {
  title: "百科专题稿",
  sourceType: "web",
  sourceSite: "tongfuli-wiki",
  url: "https://example.com/wiki/laobai",
};

const INITIAL_DECISION = {
  taskId: "review_demo_001",
  decision: "approved",
  note: "首版后台工作台验证通过",
};

const INITIAL_PUBLISH = {
  snapshotVersion: "snapshot-2026-04-21",
  note: "foundation 首版发布演练",
};

const INITIAL_STRATEGY = {
  strategyName: "default-role-answer",
  targetScope: "character",
  changedBy: "foundation-admin",
  configPayload: `{
  "characterId": "char_baizhantang",
  "temperature": 0.4,
  "style": "canon"
}`,
};

const INITIAL_GRAY_RELEASE = {
  strategyId: "strategy_demo_001",
  operator: "foundation-admin",
  note: "先放 20% 给白展堂链路",
  rolloutRatio: "20",
};

const INITIAL_DIAGNOSTIC = {
  turnId: "turn_demo_001",
};

export default function AdminHomePage() {
  const [reviewTasks, setReviewTasks] = useState<ReviewTaskSummary[]>([]);
  const [reviewStatus, setReviewStatus] = useState<PanelStatus>("idle");
  const [reviewError, setReviewError] = useState("");

  const [scriptForm, setScriptForm] = useState(INITIAL_SCRIPT);
  const [sourceForm, setSourceForm] = useState(INITIAL_SOURCE);
  const [decisionForm, setDecisionForm] = useState(INITIAL_DECISION);
  const [publishForm, setPublishForm] = useState(INITIAL_PUBLISH);
  const [strategyForm, setStrategyForm] = useState(INITIAL_STRATEGY);
  const [grayReleaseForm, setGrayReleaseForm] = useState(INITIAL_GRAY_RELEASE);
  const [diagnosticForm, setDiagnosticForm] = useState(INITIAL_DIAGNOSTIC);

  const [lastReviewTask, setLastReviewTask] = useState<ReviewTaskSummary | null>(null);
  const [publishReceipt, setPublishReceipt] = useState<PublishKnowledgeReceipt | null>(null);
  const [strategyVersion, setStrategyVersion] = useState<StrategyVersionSummary | null>(null);
  const [diagnostic, setDiagnostic] = useState<TurnDiagnosticSummary | null>(null);

  const [scriptStatus, setScriptStatus] = useState<PanelStatus>("idle");
  const [sourceStatus, setSourceStatus] = useState<PanelStatus>("idle");
  const [decisionStatus, setDecisionStatus] = useState<PanelStatus>("idle");
  const [publishStatus, setPublishStatus] = useState<PanelStatus>("idle");
  const [strategyStatus, setStrategyStatus] = useState<PanelStatus>("idle");
  const [diagnosticStatus, setDiagnosticStatus] = useState<PanelStatus>("idle");

  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    void refreshReviewTasks();
  }, []);

  async function refreshReviewTasks() {
    setReviewStatus("loading");
    setReviewError("");

    try {
      const tasks = await listReviewTasks();
      setReviewTasks(tasks);
      setReviewStatus("success");
    } catch (error) {
      setReviewStatus("error");
      setReviewError(normalizeError(error));
    }
  }

  async function handleScriptImport() {
    setScriptStatus("loading");
    setFeedbackMessage("");

    try {
      const created = await importScript(scriptForm);
      setLastReviewTask(created);
      setScriptStatus("success");
      setFeedbackMessage(`已创建剧本导入审核任务：${created.taskId}`);
      await refreshReviewTasks();
    } catch (error) {
      setScriptStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  async function handleCreateSource() {
    setSourceStatus("loading");
    setFeedbackMessage("");

    try {
      const created = await createSource(sourceForm);
      setLastReviewTask(created);
      setSourceStatus("success");
      setFeedbackMessage(`已创建来源审核任务：${created.taskId}`);
      await refreshReviewTasks();
    } catch (error) {
      setSourceStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  async function handleDecision() {
    setDecisionStatus("loading");
    setFeedbackMessage("");

    try {
      const updated = await decideReviewTask(decisionForm.taskId, {
        decision: decisionForm.decision,
        note: decisionForm.note,
      });
      setLastReviewTask(updated);
      setDecisionStatus("success");
      setFeedbackMessage(`审核任务 ${updated.taskId} 已更新为 ${updated.status}`);
      await refreshReviewTasks();
    } catch (error) {
      setDecisionStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  async function handlePublish() {
    setPublishStatus("loading");
    setFeedbackMessage("");

    try {
      const receipt = await publishKnowledge(publishForm);
      setPublishReceipt(receipt);
      setPublishStatus("success");
      setFeedbackMessage(`发布成功：${receipt.releaseId}`);
    } catch (error) {
      setPublishStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  async function handleStrategyCreate() {
    setStrategyStatus("loading");
    setFeedbackMessage("");

    try {
      const created = await createStrategy({
        strategyName: strategyForm.strategyName,
        targetScope: strategyForm.targetScope,
        changedBy: strategyForm.changedBy,
        configPayload: safeParseJson(strategyForm.configPayload),
      });
      setStrategyVersion(created);
      setGrayReleaseForm((current) => ({ ...current, strategyId: created.strategyId }));
      setStrategyStatus("success");
      setFeedbackMessage(`策略版本已创建：${created.strategyId}`);
    } catch (error) {
      setStrategyStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  async function handleGrayRelease() {
    setStrategyStatus("loading");
    setFeedbackMessage("");

    try {
      const released = await grayReleaseStrategy(grayReleaseForm.strategyId, {
        operator: grayReleaseForm.operator,
        note: grayReleaseForm.note,
        rolloutRatio: Number.parseInt(grayReleaseForm.rolloutRatio, 10),
      });
      setStrategyVersion(released);
      setStrategyStatus("success");
      setFeedbackMessage(`灰度发布已执行：${released.strategyId}`);
    } catch (error) {
      setStrategyStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  async function handleDiagnosticLookup() {
    setDiagnosticStatus("loading");
    setFeedbackMessage("");

    try {
      const detail = await getTurnDiagnostic(diagnosticForm.turnId);
      setDiagnostic(detail);
      setDiagnosticStatus("success");
      setFeedbackMessage(`诊断已拉取：${detail.turnId}`);
    } catch (error) {
      setDiagnosticStatus("error");
      setFeedbackMessage(normalizeError(error));
    }
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <p className="sidebar-kicker">Tongfuli / Admin</p>
        <h1>基础治理工作台</h1>
        <p className="sidebar-lead">
          这版先把 `T019` 已有的后台接口真正接起来，让内容、审核、发布、策略和诊断至少都能从页面操作。
        </p>
        <dl className="sidebar-meta">
          <div>
            <dt>后端地址</dt>
            <dd>{getAdminApiBaseUrl()}</dd>
          </div>
          <div>
            <dt>当前阶段</dt>
            <dd>T022 第一组</dd>
          </div>
        </dl>

        <div className="sidebar-list">
          {WORKBENCHES.map((item) => (
            <article className="sidebar-card" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </aside>

      <section className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">治理工作台</p>
            <h2>把后台骨架推进成可操作页面</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => void refreshReviewTasks()}>
            刷新审核列表
          </button>
        </header>

        {feedbackMessage ? (
          <p className={`feedback-banner ${feedbackMessage.includes("失败") ? "error" : ""}`}>
            {feedbackMessage}
          </p>
        ) : null}

        <section className="admin-grid">
          <article className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">内容资产</p>
                <h3>剧本导入</h3>
              </div>
              <span className={`status-badge ${scriptStatus}`}>{renderStatus(scriptStatus)}</span>
            </div>
            <label>
              来源标识
              <input
                value={scriptForm.sourceName}
                onChange={(event) =>
                  setScriptForm((current) => ({ ...current, sourceName: event.target.value }))
                }
              />
            </label>
            <label>
              剧本标题
              <input
                value={scriptForm.scriptTitle}
                onChange={(event) =>
                  setScriptForm((current) => ({ ...current, scriptTitle: event.target.value }))
                }
              />
            </label>
            <label>
              语言
              <input
                value={scriptForm.language}
                onChange={(event) =>
                  setScriptForm((current) => ({ ...current, language: event.target.value }))
                }
              />
            </label>
            <label>
              原始内容
              <textarea
                rows={5}
                value={scriptForm.rawContent}
                onChange={(event) =>
                  setScriptForm((current) => ({ ...current, rawContent: event.target.value }))
                }
              />
            </label>
            <button className="primary-button" type="button" onClick={() => void handleScriptImport()}>
              创建导入任务
            </button>
          </article>

          <article className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">来源治理</p>
                <h3>登记外部来源</h3>
              </div>
              <span className={`status-badge ${sourceStatus}`}>{renderStatus(sourceStatus)}</span>
            </div>
            <label>
              标题
              <input
                value={sourceForm.title}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>
            <label>
              来源类型
              <input
                value={sourceForm.sourceType}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, sourceType: event.target.value }))
                }
              />
            </label>
            <label>
              来源站点
              <input
                value={sourceForm.sourceSite}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, sourceSite: event.target.value }))
                }
              />
            </label>
            <label>
              URL
              <input
                value={sourceForm.url}
                onChange={(event) =>
                  setSourceForm((current) => ({ ...current, url: event.target.value }))
                }
              />
            </label>
            <button className="primary-button" type="button" onClick={() => void handleCreateSource()}>
              创建来源任务
            </button>
          </article>

          <article className="panel-card wide">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">审核工作台</p>
                <h3>审核任务列表</h3>
              </div>
              <span className={`status-badge ${reviewStatus}`}>{renderStatus(reviewStatus)}</span>
            </div>
            {reviewError ? <p className="inline-error">{reviewError}</p> : null}
            <div className="review-list">
              {reviewTasks.map((task) => (
                <article className="review-item" key={task.taskId}>
                  <div>
                    <strong>{task.taskId}</strong>
                    <p>
                      {task.taskType} / {task.targetType} / {task.targetId}
                    </p>
                  </div>
                  <span className={`pill ${task.status}`}>{task.status}</span>
                </article>
              ))}
            </div>
            <div className="inline-form">
              <label>
                任务 ID
                <input
                  value={decisionForm.taskId}
                  onChange={(event) =>
                    setDecisionForm((current) => ({ ...current, taskId: event.target.value }))
                  }
                />
              </label>
              <label>
                决策
                <select
                  value={decisionForm.decision}
                  onChange={(event) =>
                    setDecisionForm((current) => ({ ...current, decision: event.target.value }))
                  }
                >
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <label className="grow">
                备注
                <input
                  value={decisionForm.note}
                  onChange={(event) =>
                    setDecisionForm((current) => ({ ...current, note: event.target.value }))
                  }
                />
              </label>
            </div>
            <button className="primary-button" type="button" onClick={() => void handleDecision()}>
              提交审核决策
            </button>
          </article>

          <article className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">知识发布</p>
                <h3>发布知识快照</h3>
              </div>
              <span className={`status-badge ${publishStatus}`}>{renderStatus(publishStatus)}</span>
            </div>
            <label>
              快照版本
              <input
                value={publishForm.snapshotVersion}
                onChange={(event) =>
                  setPublishForm((current) => ({
                    ...current,
                    snapshotVersion: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              备注
              <textarea
                rows={4}
                value={publishForm.note}
                onChange={(event) =>
                  setPublishForm((current) => ({ ...current, note: event.target.value }))
                }
              />
            </label>
            <button className="primary-button" type="button" onClick={() => void handlePublish()}>
              发布知识快照
            </button>
            {publishReceipt ? (
              <div className="result-card">
                <strong>{publishReceipt.releaseId}</strong>
                <p>{publishReceipt.snapshotVersion}</p>
                <p>状态：{publishReceipt.status}</p>
              </div>
            ) : null}
          </article>

          <article className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">AI 策略</p>
                <h3>创建与灰度发布</h3>
              </div>
              <span className={`status-badge ${strategyStatus}`}>{renderStatus(strategyStatus)}</span>
            </div>
            <label>
              策略名
              <input
                value={strategyForm.strategyName}
                onChange={(event) =>
                  setStrategyForm((current) => ({
                    ...current,
                    strategyName: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              目标范围
              <input
                value={strategyForm.targetScope}
                onChange={(event) =>
                  setStrategyForm((current) => ({
                    ...current,
                    targetScope: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              操作人
              <input
                value={strategyForm.changedBy}
                onChange={(event) =>
                  setStrategyForm((current) => ({
                    ...current,
                    changedBy: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              配置 JSON
              <textarea
                rows={7}
                value={strategyForm.configPayload}
                onChange={(event) =>
                  setStrategyForm((current) => ({
                    ...current,
                    configPayload: event.target.value,
                  }))
                }
              />
            </label>
            <div className="action-row">
              <button className="primary-button" type="button" onClick={() => void handleStrategyCreate()}>
                创建策略版本
              </button>
              <button className="ghost-button" type="button" onClick={() => void handleGrayRelease()}>
                执行灰度发布
              </button>
            </div>
            <div className="inline-form">
              <label>
                策略 ID
                <input
                  value={grayReleaseForm.strategyId}
                  onChange={(event) =>
                    setGrayReleaseForm((current) => ({
                      ...current,
                      strategyId: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                操作人
                <input
                  value={grayReleaseForm.operator}
                  onChange={(event) =>
                    setGrayReleaseForm((current) => ({
                      ...current,
                      operator: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                灰度比例
                <input
                  value={grayReleaseForm.rolloutRatio}
                  onChange={(event) =>
                    setGrayReleaseForm((current) => ({
                      ...current,
                      rolloutRatio: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              灰度说明
              <input
                value={grayReleaseForm.note}
                onChange={(event) =>
                  setGrayReleaseForm((current) => ({ ...current, note: event.target.value }))
                }
              />
            </label>
            {strategyVersion ? (
              <div className="result-card">
                <strong>{strategyVersion.strategyId}</strong>
                <p>
                  {strategyVersion.strategyName} / v{strategyVersion.versionNumber}
                </p>
                <p>状态：{strategyVersion.releaseStatus}</p>
              </div>
            ) : null}
          </article>

          <article className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">问答诊断</p>
                <h3>按 turnId 拉取诊断</h3>
              </div>
              <span className={`status-badge ${diagnosticStatus}`}>
                {renderStatus(diagnosticStatus)}
              </span>
            </div>
            <label>
              Turn ID
              <input
                value={diagnosticForm.turnId}
                onChange={(event) =>
                  setDiagnosticForm({ turnId: event.target.value })
                }
              />
            </label>
            <button className="primary-button" type="button" onClick={() => void handleDiagnosticLookup()}>
              查询诊断
            </button>
            {diagnostic ? (
              <div className="result-card">
                <strong>{diagnostic.turnId}</strong>
                <p>
                  {diagnostic.characterId} / {diagnostic.mode} / 风险 {diagnostic.riskLevel}
                </p>
                <p>策略：{diagnostic.strategyId}</p>
                <div className="tag-row">
                  {diagnostic.evidenceLabels.map((item) => (
                    <span className="pill neutral" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <article className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">最近结果</p>
                <h3>最近创建或更新的审核任务</h3>
              </div>
            </div>
            {lastReviewTask ? (
              <div className="result-card">
                <strong>{lastReviewTask.taskId}</strong>
                <p>
                  {lastReviewTask.taskType} / {lastReviewTask.targetType}
                </p>
                <p>
                  {lastReviewTask.targetId} / 状态 {lastReviewTask.status}
                </p>
                <p>{lastReviewTask.note || "无备注"}</p>
              </div>
            ) : (
              <p className="empty-copy">这里会显示最近一次导入、来源创建或审核决策结果。</p>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

function safeParseJson(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    throw new Error("策略配置 JSON 解析失败");
  }
}

function normalizeError(error: unknown): string {
  return error instanceof Error ? error.message : "后台请求失败";
}

function renderStatus(status: PanelStatus): string {
  switch (status) {
    case "loading":
      return "处理中";
    case "success":
      return "已完成";
    case "error":
      return "失败";
    case "idle":
    default:
      return "待操作";
  }
}
