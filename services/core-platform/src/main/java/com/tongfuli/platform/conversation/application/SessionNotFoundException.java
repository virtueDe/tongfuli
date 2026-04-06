package com.tongfuli.platform.conversation.application;

public class SessionNotFoundException extends RuntimeException {

    public SessionNotFoundException(String sessionId) {
        super("未找到会话: " + sessionId);
    }
}
