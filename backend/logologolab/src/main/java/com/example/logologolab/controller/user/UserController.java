package com.example.logologolab.controller.user;

import com.example.logologolab.domain.User;
import com.example.logologolab.domain.ProviderType;
import com.example.logologolab.dto.user.MyPageResponse;
import com.example.logologolab.dto.user.UserResponse;
import com.example.logologolab.dto.user.UserUpdateRequest;
import com.example.logologolab.dto.user.OtherUserResponse;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.security.JwtTokenProvider;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.service.user.UserService;
import com.example.logologolab.service.auth.RefreshTokenService;
import com.example.logologolab.support.ImageDataUriSupport;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

@RestController
@RequiredArgsConstructor
@Tag(name = "01. 회원", description = "회원 관련 API")
public class UserController {

    private final UserService userService;
    private final LoginUserProvider loginUserProvider;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "마이페이지", description = "마이페이지 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "마이페이지 조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 쿼리 파라미터", content = @Content),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @GetMapping("/api/users/me")
    public ResponseEntity<MyPageResponse> getMyProfile() {
        // 1. DB에서 최신 정보 조회
        User sessionUser = loginUserProvider.getLoginUser();
        User freshUser = userService.findByEmailAndProvider(sessionUser.getEmail(), sessionUser.getProvider());

        String src = freshUser.getProfileImageUrl();
        String dataUri = null;

        if (src != null) {
            if (src.startsWith("http")) {
                // 1) URL인 경우: 다운로드 후 변환
                dataUri = ImageDataUriSupport.toDataUriFromUrl(src);
            } else if (src.startsWith("data:")) {
                // 2) 이미 완성된 Base64인 경우: 그대로 사용
                dataUri = src;
            } else {
                // 3) 순수 Base64 문자열만 있는 경우: 헤더를 붙여준다 (기본값 jpeg로 가정)
                // 만약 png라면 "data:image/png;base64," 를 붙여야 함
                dataUri = "data:image/jpeg;base64," + src;
            }
        }

        // 4. 응답 생성
        MyPageResponse response = MyPageResponse.from(freshUser, dataUri);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "다른 회원 정보 조회", description = "회원 ID로 다른 회원 정보 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "다른 회원 조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "404", description = "회원 정보 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @GetMapping("/api/users/{id}")
    public ResponseEntity<OtherUserResponse> getOtherUserProfile(@PathVariable Long id) {
        User user = userService.findById(id);

        OtherUserResponse response = new OtherUserResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl()
        );

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 정보 수정", description = "로그인한 사용자의 닉네임, 프로필 이미지를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "회원 정보 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "404", description = "회원 정보 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PatchMapping("/api/users/me")
    public ResponseEntity<MyPageResponse> updateMyProfile(@RequestBody UserUpdateRequest request) {
        User loginUser = loginUserProvider.getLoginUser();

        // 이메일 변경 시도 가드(선택: 무시 대신 에러로 막아도 됨)
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(loginUser.getEmail())) {
            throw new IllegalArgumentException("이메일은 변경할 수 없습니다.");
        }

        User updated = userService.updateUser(
                loginUser.getEmail(),
                loginUser.getProvider(),
                request
        );

        // 응답은 마이페이지 포맷으로(요구 스펙과 동일)
        String src = updated.getProfileImageUrl();
        String dataUri = (src != null && src.startsWith("data:"))
                ? src
                : com.example.logologolab.support.ImageDataUriSupport.toDataUriFromUrl(src);

        MyPageResponse response = MyPageResponse.from(updated, dataUri);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 탈퇴", description = "현재 로그인한 회원 탈퇴")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "회원 탈퇴 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "404", description = "회원 정보 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @DeleteMapping("/api/users/me")
    public ResponseEntity<Void> deleteMyAccount(
            Authentication authentication,
            @CookieValue(value = "refresh-token", required = false) String refreshToken
    ) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        String email = principal.getEmail();
        ProviderType provider = principal.getProvider();

        // 1. 회원 삭제
        userService.deleteUserByEmailAndProvider(email, provider);

        // 2. refresh token 삭제
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            refreshTokenService.deleteRefreshToken(email, provider);
        }

        // 3. access-token 및 refresh-token 쿠키 삭제
        ResponseCookie deleteRefreshTokenCookie = ResponseCookie.from("refresh-token", "")
                .httpOnly(true)
                .secure(true)
                .domain("logologolab.duckdns.org")
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        ResponseCookie deleteAccessTokenCookie = ResponseCookie.from("access-token", "")
                .httpOnly(true)
                .secure(true)
                .domain("logologolab.duckdns.org")
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        // 4. 다중 쿠키 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, deleteRefreshTokenCookie.toString());
        headers.add(HttpHeaders.SET_COOKIE, deleteAccessTokenCookie.toString());

        // 5. 204 No Content 응답
        return ResponseEntity.noContent()
                .headers(headers)
                .build();
    }
}