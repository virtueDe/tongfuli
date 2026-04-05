package com.tongfuli.platform.shared.api;

/**
 * 健康检查响应体。
 *
 * @param service 服务名
 * @param status 状态
 * @param message 说明
 */
public record HealthResponse(String service, String status, String message) {
}
