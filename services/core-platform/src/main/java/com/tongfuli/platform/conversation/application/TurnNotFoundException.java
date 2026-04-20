package com.tongfuli.platform.conversation.application;

public class TurnNotFoundException extends RuntimeException {

    public TurnNotFoundException(String turnId) {
        super("未找到轮次: " + turnId);
    }
}
