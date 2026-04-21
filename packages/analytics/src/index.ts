export type AnalyticsEventName =
  | "conversation_started"
  | "conversation_answer_received"
  | "conversation_feedback_submitted"
  | "topic_opened"
  | "share_landing_opened"
  | "admin_review_decided"
  | "admin_publish_triggered";

export interface TrackingEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  name: AnalyticsEventName;
  timestamp: string;
  sessionId?: string;
  actor?: "web" | "miniapp" | "admin" | "system";
  payload: TPayload;
}

export interface ConversationStartedPayload {
  entryPoint: "home" | "topic" | "share" | "miniapp";
  characterId: string;
  mode: string;
}

export interface ConversationAnswerPayload {
  turnId: string;
  characterId: string;
  mode: string;
  questionType?: string;
  degraded?: boolean;
}

export interface FeedbackSubmittedPayload {
  turnId: string;
  feedbackType: string;
}

export interface TopicOpenedPayload {
  slug: string;
  source: "web" | "miniapp" | "share";
}

export interface ShareLandingPayload {
  slug: string;
  source: "web" | "miniapp";
}

export interface AdminReviewPayload {
  taskId: string;
  decision: "approved" | "rejected";
}

export interface AdminPublishPayload {
  releaseId?: string;
  snapshotVersion: string;
}

export interface AnalyticsEnvelope {
  schemaVersion: "2026-04-21";
  event: TrackingEvent;
}

export function createTrackingEvent<TPayload extends Record<string, unknown>>(
  name: AnalyticsEventName,
  payload: TPayload,
  options: {
    sessionId?: string;
    actor?: "web" | "miniapp" | "admin" | "system";
    timestamp?: string;
  } = {},
): TrackingEvent<TPayload> {
  return {
    name,
    payload,
    sessionId: options.sessionId,
    actor: options.actor,
    timestamp: options.timestamp ?? new Date().toISOString(),
  };
}

export function toAnalyticsEnvelope(event: TrackingEvent): AnalyticsEnvelope {
  return {
    schemaVersion: "2026-04-21",
    event,
  };
}

/**
 * 统一埋点入口，当前先返回标准化事件对象，后续再接真实收集端。
 */
export function trackEvent<TPayload extends Record<string, unknown>>(
  event: TrackingEvent<TPayload>,
) {
  return toAnalyticsEnvelope(event);
}
