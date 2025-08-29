package com.example.logologolab.exception.custom;

import com.example.logologolab.exception.errorcode.ErrorCode;
import lombok.Getter;

@Getter
public class UnauthenticatedUserException extends RuntimeException {
    private final ErrorCode errorCode;

    public UnauthenticatedUserException() {
        super(ErrorCode.UNAUTHENTICATED_USER.getMessage());
        this.errorCode = ErrorCode.UNAUTHENTICATED_USER;
    }
}
