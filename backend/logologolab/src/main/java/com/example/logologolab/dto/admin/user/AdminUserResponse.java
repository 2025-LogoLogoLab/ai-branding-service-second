package com.example.logologolab.dto.admin.user;

import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.domain.RoleType;
import com.example.logologolab.domain.User;
import java.time.OffsetDateTime;

public record AdminUserResponse(
        Long id,
        String email,
        String nickname,
        ProviderType provider,
        RoleType role
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProvider(),
                user.getRole()
        );
    }
}