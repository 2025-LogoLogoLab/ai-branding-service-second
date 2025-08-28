package com.example.logologolab.security;

import com.example.logologolab.domain.User;
import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.exception.custom.UnauthenticatedUserException;
import com.example.logologolab.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LoginUserProvider {
    private final UserRepository userRepository;

    public User getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
            !authentication.isAuthenticated() ||
            authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String email = principal.getEmail();
        ProviderType provider = principal.getProvider();

        return userRepository.findByEmailAndProvider(email, provider).orElseThrow(UnauthenticatedUserException::new);
    }

    public User getLoginUserIfExists() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
            !authentication.isAuthenticated() ||
            authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String email = principal.getEmail();
        ProviderType provider = principal.getProvider();

        return userRepository.findByEmailAndProvider(email, provider).orElseThrow(UnauthenticatedUserException::new);
    }
}
