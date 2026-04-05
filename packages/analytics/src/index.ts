export interface TrackingEvent {
  name: string;
  payload?: Record<string, unknown>;
}

/**
 * 统一埋点入口，当前先保留接口边界。
 */
export function trackEvent(event: TrackingEvent) {
  return event;
}
