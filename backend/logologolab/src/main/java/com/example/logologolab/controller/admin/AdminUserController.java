package com.example.logologolab.controller.admin;

import com.example.logologolab.dto.admin.user.AdminUserCreateRequest;
import com.example.logologolab.dto.admin.user.AdminUserResponse;
import com.example.logologolab.dto.admin.user.AdminUserUpdateRequest;
import com.example.logologolab.service.admin.AdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "관리자 기능 - 사용자", description = "관리자 전용 사용자(User) 관리 API")
public class AdminUserController {

    private final AdminService adminService;

    @Operation(summary = "[어드민] 신규 사용자 생성")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "사용자 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터 (예: 이메일 중복)"),
            @ApiResponse(responseCode = "403", description = "관리자 권한이 아님")
    })
    @PostMapping("/api/admin/user")
    public ResponseEntity<AdminUserResponse> createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        AdminUserResponse createdUser = adminService.createUser(request);
        return ResponseEntity.created(URI.create("/api/admin/user/" + createdUser.getId()))
                .body(createdUser);
    }

    @Operation(summary = "[어드민] 모든 사용자 목록 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "사용자 목록 조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한이 아님", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류", content = @Content)
    })
    @GetMapping("/api/admin/users")
    public Page<AdminUserResponse> getAllUsers(@PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return adminService.getAllUsers(pageable);
    }

    @Operation(summary = "[어드민] 특정 사용자 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "사용자 상세 정보 조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한이 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 ID의 사용자를 찾을 수 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류", content = @Content)
    })
    @GetMapping("/api/admin/user/{userId}")
    public AdminUserResponse getUserById(@PathVariable Long userId) {
        return adminService.getUserById(userId);
    }

    @Operation(summary = "[어드민] 특정 사용자 정보 수정")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "사용자 정보 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "403", description = "관리자 권한이 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 ID의 사용자를 찾을 수 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류", content = @Content)
    })
    @PatchMapping("/api/admin/user/{userId}")
    public AdminUserResponse updateUser(@PathVariable Long userId, @RequestBody AdminUserUpdateRequest request) {
        return adminService.updateUser(userId, request);
    }

    @Operation(summary = "[어드민] 특정 사용자 삭제")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "사용자 삭제 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"사용자(123) 삭제가 완료되었습니다.\"}")
                    )),
            @ApiResponse(responseCode = "403", description = "관리자 권한이 아님", content = @Content),
            @ApiResponse(responseCode = "404", description = "해당 ID의 사용자를 찾을 수 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류", content = @Content)
    })
    @DeleteMapping("/api/admin/user/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "사용자(" + userId + ") 삭제가 완료되었습니다."));
    }
}