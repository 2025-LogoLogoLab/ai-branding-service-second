package com.example.logologolab.controller.auth;

import com.example.logologolab.domain.User;
import com.example.logologolab.domain.RoleType;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "회원", description = "회원 관련 API")
public class ProtectedTestController {

    private final UserService userService;

    @Operation(summary = "JWT 토큰", description = "JWT 토큰 유효 확인")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JWT 토큰 유효"),
            @ApiResponse(responseCode = "401", description = "유효하지 않은 JWT access token", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @GetMapping("/api/protected")
    public ResponseEntity<ProtectedResponse> protectedApi(
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(new ProtectedResponse(
                "You have accessed a protected resource!",
                principal.getRole()   // ★ DB 조회 불필요
        ));
    }

    @Getter
    @AllArgsConstructor
    static class ProtectedResponse {
        private String message;
        private RoleType role;
    }
}
