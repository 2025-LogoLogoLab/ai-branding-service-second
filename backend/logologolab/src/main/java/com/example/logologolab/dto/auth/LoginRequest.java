package com.example.logologolab.dto.auth;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String email;
    private String password;
}
