package com.example.logologolab.security;

import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.domain.RoleType;

public class CustomUserPrincipal {
    private final String email;
    private final ProviderType provider;
    private final RoleType role;


    public CustomUserPrincipal(String email, ProviderType provider, RoleType role) {
        this.email = email;
        this.provider = provider;
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public ProviderType getProvider() {
        return provider;
    }

    public RoleType getRole() {return role;}
}
