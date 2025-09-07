package com.example.logologolab.controller.auth;

import com.example.logologolab.security.JwtTokenProvider;
import com.example.logologolab.service.auth.LogoutService;
import com.example.logologolab.service.auth.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;


@RestController
@RequiredArgsConstructor
@Tag(name = "로그아웃", description = "로그아웃 관련 API")
public class LogoutController {
    private final LogoutService logoutService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    // 과거 스코프 쿠키들을 한번에 삭제하기 위한 헬퍼
    private void addLegacyCookieDeletions(HttpHeaders headers, String name) {
        // host-only + /
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("None")
                .path("/").maxAge(0).build().toString());

        // domain=logologolab.duckdns.org + /
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/").maxAge(0)
                .build().toString());

        // domain=.duckdns.org + /
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("None")
                .domain(".duckdns.org").path("/").maxAge(0)
                .build().toString());

        // (선택) /api 경로 변형들
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("None")
                .path("/api").maxAge(0).build().toString());

        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/api").maxAge(0)
                .build().toString());

        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, "")
                .httpOnly(true).secure(true).sameSite("None")
                .domain(".duckdns.org").path("/api").maxAge(0)
                .build().toString());
    }

    @Operation(summary = "로그아웃", description = "로그아웃 요청")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
            @ApiResponse(responseCode = "400", description = "소셜 access token 누락 또는 provider 잘못됨", content = @Content),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "403", description = "이미 로그아웃 되었거나 무효한 사용자", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping("/api/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "access-token", required = false) String accessToken,
            @CookieValue(value = "refresh-token", required = false) String refreshToken
    ) {
        // 1. access token 유효성 검사 및 블랙리스트 등록
        if (accessToken != null && jwtTokenProvider.validateToken(accessToken)) {
            Date expiration = jwtTokenProvider.getExpirationDate(accessToken);
            long now = System.currentTimeMillis();
            long remainingMillis = expiration.getTime() - now;

            if (remainingMillis > 0) {
                logoutService.blacklistToken(accessToken, remainingMillis);
            }
        }

        // 2. refresh token 삭제
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            String email = jwtTokenProvider.getEmail(refreshToken);
            refreshTokenService.deleteRefreshToken(email);
        }

        // 모든 변형 스코프 삭제를 헤더에 일괄 추가
        HttpHeaders headers = new HttpHeaders();
        addLegacyCookieDeletions(headers, "access-token");
        addLegacyCookieDeletions(headers, "refresh-token");

        return ResponseEntity.ok()
                .headers(headers)
                .build();
    }
}