package com.tongfuli.platform.admin.api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.HttpMediaTypeNotAcceptableException;

@RestControllerAdvice
public class AdminErrorHandler {

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    ResponseEntity<?> handleBadRequest(Exception exception, NativeWebRequest request) {
        String accept = request.getHeader(HttpHeaders.ACCEPT);
        boolean acceptsJson = accept == null
            || accept.contains(MediaType.ALL_VALUE)
            || accept.contains(MediaType.APPLICATION_JSON_VALUE);

        if (!acceptsJson) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .contentType(MediaType.APPLICATION_JSON)
            .body(new AdminApiError("后台请求参数不合法"));
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    ResponseEntity<Void> handleNotAcceptable(HttpMediaTypeNotAcceptableException exception) {
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
    }
}
