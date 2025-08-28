package com.example.logologolab.security;

import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.domain.RoleType;
import com.example.logologolab.service.auth.LogoutService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final LogoutService logoutService;

    // permitAll 경로는 필터 자체를 건너뛰도록 처리
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // SecurityConfig의 permitAll 규칙과 일치하도록 유지
        if (path.startsWith("/swagger-ui/") || path.startsWith("/v3/api-docs")) return true;
        if (path.equals("/") || path.equals("/index.html")) return true;
        if (path.startsWith("/static/") || path.startsWith("/css/") || path.startsWith("/js/")
                || path.startsWith("/assets/") || path.equals("/favicon.ico")) return true;
        if (path.equals("/api/signup") || path.equals("/api/login")
                || path.equals("/api/login/social") || path.equals("/api/logout")) return true;
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/api/logos/")) return true;
        if ("GET".equalsIgnoreCase(method) && path.startsWith("/app/")) return true;

        // 에러 페이지는 항상 개방
        if (path.equals("/error")) return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // [CHANGED] 로그인/회원가입 예외는 shouldNotFilter에서 이미 처리되지만, 이중 안전장치 유지
        if (path.startsWith("/api/login") || path.startsWith("/api/signup")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1) 쿠키(또는 Authorization 헤더)에서 토큰 추출
        String token = resolveToken(request);

        // 토큰이 없거나 유효하지 않으면 '그냥 통과'
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            SecurityContextHolder.clearContext(); // 보수적 초기화
            filterChain.doFilter(request, response);
            return;
        }

        // 블랙리스트여도 여기서 401/403 쓰지 말고 컨텍스트만 비우고 통과
        if (logoutService.isBlacklisted(token)) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        // 3) 클레임 파싱 (널/형식 방어)
        String email = jwtTokenProvider.getEmail(token);
        String providerStr = jwtTokenProvider.getProvider(token);
        String roleStr = jwtTokenProvider.getRole(token);

        // 클레임 이상 시에도 직접 401 쓰지 않고 통과 → 인가 규칙이 최종 판단
        if (email == null || providerStr == null || roleStr == null) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        ProviderType provider;
        RoleType role;
        try {
            provider = ProviderType.valueOf(providerStr.toUpperCase());
            role = RoleType.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            // 잘못된 enum도 통과(익명 처리). 보호 리소스면 최종 401/403은 Security가 냄
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        // 4) Principal/권한 세팅
        CustomUserPrincipal principal = new CustomUserPrincipal(email, provider, role);
        List<SimpleGrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        // Authorization: Bearer ... (테스트 편의)
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring(7);
        }
        // HttpOnly 쿠키
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if ("access-token".equals(c.getName())) { // 기존 코드 유지
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
