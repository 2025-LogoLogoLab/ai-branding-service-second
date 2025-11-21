package com.example.logologolab.controller.auth;

import com.example.logologolab.domain.RoleType;
import com.example.logologolab.domain.User;
import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.security.JwtTokenProvider;
import com.example.logologolab.service.auth.RefreshTokenService;
import com.example.logologolab.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequiredArgsConstructor
@Tag(name = "01. 회원", description = "회원 관련 API")
public class TokenRefreshController {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

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


    @Operation(
            summary = "Access Token 재발급",
            description = """
        저장된 Refresh Token을 기반으로 새로운 Access Token을 발급합니다.
        
        - 클라이언트는 요청 시 `refresh-token`이라는 이름의 **HttpOnly 쿠키**를 함께 전송해야 합니다.
        - 쿠키에 담긴 Refresh Token이 유효하고 서버에 저장된 토큰과 일치하면 새로운 Access Token을 반환합니다.
        - 만료되었거나 위조된 경우 `401 Unauthorized`를 반환합니다.
        """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Access Token 재발급 성공"),
            @ApiResponse(responseCode = "401", description = "유효하지 않거나 일치하지 않는 Refresh Token", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류", content = @Content)
    })
    @PostMapping("/api/auth/refresh")
    public ResponseEntity<?> refreshAccessToken(
            @CookieValue(value = "refresh-token", required = false) String refreshToken
    ) {
        // 1. 유효성 검사
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token이 유효하지 않음");
        }

        // 2. 이메일 추출 및 저장된 토큰 비교
        String email = jwtTokenProvider.getEmail(refreshToken);
        ProviderType provider = ProviderType.valueOf(jwtTokenProvider.getProvider(refreshToken).toUpperCase());
        String savedToken = refreshTokenService.getRefreshToken(email, provider);

        if (savedToken == null || !savedToken.equals(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token 불일치 또는 만료");
        }

        // 3. DB에서 provider 가져와서 새 access token 생성
        User user = userService.findByEmailAndProvider(email, provider);
        RoleType role = user.getRole();
        String newAccessToken = jwtTokenProvider.createAccessToken(email, provider, role);

        // 기존 access-token의 옛 스코프들을 모두 삭제 후, 새 access-token만 굽기
        HttpHeaders headers = new HttpHeaders();
        addLegacyCookieDeletions(headers, "access-token");

        // 4. access token을 쿠키로 설정
        ResponseCookie accessTokenCookie = ResponseCookie.from("access-token", newAccessToken)
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/")
                .maxAge(Duration.ofMillis(jwtTokenProvider.getAccessTokenExpiration()))
                .build();

        return ResponseEntity.ok()
                .headers(headers)
                .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString())
                .build();
    }
}

