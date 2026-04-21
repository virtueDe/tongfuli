const DEFAULT_BASE_URL = "http://127.0.0.1:8080";

export interface ReviewTaskSummary {
  taskId: string;
  taskType: string;
  targetType: string;
  targetId: string;
  status: string;
  note: string;
}

export interface PublishKnowledgeReceipt {
  releaseId: string;
  snapshotVersion: string;
  status: string;
}

export interface StrategyVersionSummary {
  strategyId: string;
  strategyName: string;
  targetScope: string;
  versionNumber: number;
  releaseStatus: string;
  changedBy: string;
  configPayload: Record<string, unknown>;
}

export interface TurnDiagnosticSummary {
  turnId: string;
  characterId: string;
  mode: string;
  riskLevel: string;
  evidenceLabels: string[];
  strategyId: string;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

export function getAdminApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_CORE_PLATFORM_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function importScript(payload: {
  sourceName: string;
  scriptTitle: string;
  language: string;
  rawContent: string;
}): Promise<ReviewTaskSummary> {
  return requestJson("/api/v1/admin/scripts/import", {
    method: "POST",
    body: payload,
  });
}

export async function createSource(payload: {
  title: string;
  sourceType: string;
  sourceSite: string;
  url: string;
}): Promise<ReviewTaskSummary> {
  return requestJson("/api/v1/admin/sources", {
    method: "POST",
    body: payload,
  });
}

export async function listReviewTasks(): Promise<ReviewTaskSummary[]> {
  return requestJson("/api/v1/admin/review-tasks");
}

export async function decideReviewTask(
  taskId: string,
  payload: { decision: string; note: string },
): Promise<ReviewTaskSummary> {
  return requestJson(`/api/v1/admin/review-tasks/${taskId}/decision`, {
    method: "POST",
    body: payload,
  });
}

export async function publishKnowledge(payload: {
  snapshotVersion: string;
  note: string;
}): Promise<PublishKnowledgeReceipt> {
  return requestJson("/api/v1/admin/knowledge/publish", {
    method: "POST",
    body: payload,
  });
}

export async function createStrategy(payload: {
  strategyName: string;
  targetScope: string;
  changedBy: string;
  configPayload: Record<string, unknown>;
}): Promise<StrategyVersionSummary> {
  return requestJson("/api/v1/admin/strategies", {
    method: "POST",
    body: payload,
  });
}

export async function grayReleaseStrategy(
  strategyId: string,
  payload: { operator: string; note: string; rolloutRatio: number },
): Promise<StrategyVersionSummary> {
  return requestJson(`/api/v1/admin/strategies/${strategyId}/gray-release`, {
    method: "POST",
    body: payload,
  });
}

export async function getTurnDiagnostic(
  turnId: string,
): Promise<TurnDiagnosticSummary> {
  return requestJson(`/api/v1/admin/diagnostics/turns/${turnId}`);
}

async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${getAdminApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `后台请求失败：${response.status}`);
  }

  return (await response.json()) as T;
}
