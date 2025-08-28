package com.example.logologolab.dto.auth;

import com.example.logologolab.domain.RoleType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private RoleType role;
}