package com.example.logologolab.exception;

import com.example.logologolab.exception.errorcode.ErrorCode;

public record ErrorResponse(
        String code,
        String message,
        int status
) {
    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(
                errorCode.getCode(),
                errorCode.getMessage(),
                errorCode.getStatus().value()
        );
    }
}
