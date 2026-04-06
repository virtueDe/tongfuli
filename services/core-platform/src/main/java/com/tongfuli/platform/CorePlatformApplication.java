package com.tongfuli.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Java 主业务系统入口。
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class CorePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(CorePlatformApplication.class, args);
    }
}
