package com.tongfuli.platform.conversation.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.tongfuli.platform.conversation.application.ConversationIntegrationException;
import com.tongfuli.platform.conversation.application.SessionNotFoundException;

@RestControllerAdvice
public class ConversationErrorHandler {

    @ExceptionHandler(SessionNotFoundException.class)
    ResponseEntity<PublicApiError> handleSessionNotFound(SessionNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new PublicApiError(exception.getMessage()));
    }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    ResponseEntity<PublicApiError> handleBadRequest(Exception exception) {
        return ResponseEntity.badRequest()
            .body(new PublicApiError("请求参数不合法"));
    }

    @ExceptionHandler(ConversationIntegrationException.class)
    ResponseEntity<PublicApiError> handleIntegration(ConversationIntegrationException exception) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(new PublicApiError(exception.getMessage()));
    }
}
