package com.example.logologolab.controller.auth;

import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.domain.RoleType;
import com.example.logologolab.domain.User;
import com.example.logologolab.dto.auth.LoginRequest;
import com.example.logologolab.dto.auth.LoginResponse;
import com.example.logologolab.dto.auth.SignUpRequest;
import com.example.logologolab.dto.auth.SocialLoginRequest;
import com.example.logologolab.dto.oauth.OAuthUserInfo;
import com.example.logologolab.security.JwtTokenProvider;
import com.example.logologolab.service.user.UserService;
import com.example.logologolab.service.auth.RefreshTokenService;
import com.example.logologolab.service.oauth.OAuth2UserInfoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequiredArgsConstructor
@Tag(name = "로그인", description = "로그인 관련 API")
public class AuthController {

    private final OAuth2UserInfoService oAuth2UserInfoService;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpiration; // ms 단위

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

    @Operation(summary = "회원가입", description = "일반 로그인 사용자 회원가입")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    })
    @PostMapping("/api/signup")
    public ResponseEntity<String> signUp(@Valid @RequestBody SignUpRequest request) {
        try {
            userService.registerLocalUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getNickname()
            );
            return ResponseEntity.status(201).body("회원가입 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @Operation(summary = "로그인", description = "로그인 요청")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping("/api/login")
    public ResponseEntity<LoginResponse> localLogin(@RequestBody LoginRequest request) {
        // 1. 사용자 조회 (provider: LOCAL)
        User user = userService.findByEmailAndProvider(request.getEmail(), ProviderType.LOCAL);

        // 2. 비밀번호 검증 (BCrypt 사용 가정)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).build();
        }

        // 3. access & refresh token 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getProvider(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

        // 4. refresh token Redis 저장
        refreshTokenService.saveRefreshToken(user.getEmail(), refreshToken, refreshTokenExpiration);

        // 응답 헤더에 과거 스코프 쿠키들 삭제 먼저 추가
        HttpHeaders headers = new HttpHeaders();
        addLegacyCookieDeletions(headers, "access-token");
        addLegacyCookieDeletions(headers, "refresh-token");

        // 5. 쿠키 생성
        // 표준 스코프(.duckdns.org, /, SameSite=None; Secure)로 재발급
        ResponseCookie accessCookie = ResponseCookie.from("access-token", accessToken)
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/")
                .maxAge(Duration.ofMillis(jwtTokenProvider.getAccessTokenExpiration()))
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh-token", refreshToken)
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/")
                .maxAge(Duration.ofMillis(refreshTokenExpiration))
                .build();

        return ResponseEntity.ok()
                .headers(headers)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new LoginResponse(user.getRole()));
    }


    @Operation(summary = "소셜 로그인", description = "소셜 로그인 요청")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping("/api/login/social")
    public ResponseEntity<LoginResponse> socialLogin(@RequestBody SocialLoginRequest request) {
        OAuthUserInfo userInfo;

        if ("KAKAO".equalsIgnoreCase(request.getProvider())) {
            userInfo = oAuth2UserInfoService.kakaoLogin(request.getCode());
        } else if ("NAVER".equalsIgnoreCase(request.getProvider())) {
            userInfo = oAuth2UserInfoService.naverLogin(request.getCode());
        } else {
            return ResponseEntity.badRequest().build();
        }

        // 1. 회원 등록 or 로그인
        User user = userService.registerOrLogin(userInfo);

        // 2. access & refresh token 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(), user.getProvider(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail());

        // 3. refresh token Redis 저장
        refreshTokenService.saveRefreshToken(user.getEmail(), refreshToken, refreshTokenExpiration);

        // 응답 헤더에 과거 스코프 쿠키들 삭제 먼저 추가
        HttpHeaders headers = new HttpHeaders();
        addLegacyCookieDeletions(headers, "access-token");
        addLegacyCookieDeletions(headers, "refresh-token");

        // 4. 쿠키 설정 (access + refresh)
        // 표준 스코프(.duckdns.org)로 재발급
        ResponseCookie accessCookie = ResponseCookie.from("access-token", accessToken)
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/")
                .maxAge(Duration.ofMillis(jwtTokenProvider.getAccessTokenExpiration()))
                .build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh-token", refreshToken)
                .httpOnly(true).secure(true).sameSite("None")
                .domain("logologolab.duckdns.org").path("/")
                .maxAge(Duration.ofMillis(refreshTokenExpiration))
                .build();

        return ResponseEntity.ok()
                .headers(headers) // ★ 변경: 삭제 쿠키들
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new LoginResponse(user.getRole()));
    }
}
