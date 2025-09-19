package com.example.logologolab.dto.admin.user;

import com.example.logologolab.domain.RoleType;

public record AdminUserUpdateRequest(
        String nickname,
        RoleType role
) {}