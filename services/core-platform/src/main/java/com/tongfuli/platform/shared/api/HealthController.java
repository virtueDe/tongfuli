package com.tongfuli.platform.shared.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 基础健康检查接口。
 */
@RestController
@RequestMapping("/api/internal")
public class HealthController {

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("core-platform", "UP", "主业务系统骨架已初始化");
    }
}
