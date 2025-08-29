package com.example.logologolab.exception.handler;

import com.example.logologolab.exception.ErrorResponse;
import com.example.logologolab.exception.custom.*;
import com.example.logologolab.exception.errorcode.ErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception) {
        return toResponse(exception.getErrorCode());
    }

    @ExceptionHandler(UnauthenticatedUserException.class)
    public ResponseEntity<ErrorResponse> handleUnauthenticatedUserException(UnauthenticatedUserException exception) {
        return toResponse(exception.getErrorCode());
    }

    @ExceptionHandler(OwnerMismatchException.class)
    public ResponseEntity<ErrorResponse> handleCommentOwnerMismatch(OwnerMismatchException exception) {
        return toResponse(exception.getErrorCode());
    }

    private ResponseEntity<ErrorResponse> toResponse(ErrorCode errorCode) {
        return ResponseEntity.status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));
    }
}
