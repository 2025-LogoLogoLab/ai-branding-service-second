package com.example.logologolab.exception.custom;

import com.example.logologolab.exception.errorcode.ErrorCode;
import lombok.Getter;

@Getter
public class OwnerMismatchException extends RuntimeException{
    private final ErrorCode errorCode;

    public OwnerMismatchException() {
        this.errorCode = ErrorCode.OWNER_MISMATCH;
    }
}
