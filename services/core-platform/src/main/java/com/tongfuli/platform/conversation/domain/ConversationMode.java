package com.tongfuli.platform.conversation.domain;

import java.util.Arrays;

public enum ConversationMode {
    CANON("canon", "原剧模式"),
    EXTENDED("extended", "扩展模式"),
    FUN("fun", "娱乐模式");

    private final String value;
    private final String label;

    ConversationMode(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public String value() {
        return value;
    }

    public String label() {
        return label;
    }

    public static ConversationMode fromValue(String rawValue) {
        return Arrays.stream(values())
            .filter(mode -> mode.value.equals(rawValue))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("不支持的模式: " + rawValue));
    }
}
