package com.example.logologolab.config;

import com.example.logologolab.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))  // <- 명시 연결
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1. 기존 공개 엔드포인트
                        .requestMatchers("/api/signup", "/api/login", "/api/login/social",
                                "/swagger-ui/**", "/v3/api-docs/**", "/api/logout", "/error", "/app/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/", "/index.html", "/static/**", "/favicon.ico", "/assets/**").permitAll()

                        // 2. 생성(Generate) API
                        .requestMatchers(HttpMethod.POST,
                                "/api/logo/generate",
                                "/api/color-guide/generate",
                                "/api/brand-strategy/generate").permitAll()

                        // 3. 조회(GET) API
                        .requestMatchers(HttpMethod.GET,
                                "/api/logo", "/api/logo/{id}",
                                "/api/color-guides", "/api/color-guide/{id}",
                                "/api/brand-strategies", "/api/brand-strategy/{id}").permitAll()

                        .requestMatchers(
                                "/api/logo/save", "/api/color-guide/save", "/api/brand-strategy/save",
                                "/api/project/**" // 프로젝트 관련은 모두 인증 필요
                        ).authenticated()

                        // 보호 엔드포인트
                        .requestMatchers("/api/protected").authenticated()

                        // 나머지는 전부 인증 필요
                        .anyRequest().authenticated()
                )
                // (선택) 기본 인증/폼 로그인 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:4173",
                "https://logologolab.duckdns.org"
        ));
        cfg.setAllowedMethods(List.of("GET","POST", "PUT", "PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

}