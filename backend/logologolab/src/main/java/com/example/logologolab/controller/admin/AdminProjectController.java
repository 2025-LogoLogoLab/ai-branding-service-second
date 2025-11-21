package com.example.logologolab.controller.admin;

import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.project.ProjectListItem;
import com.example.logologolab.dto.project.ProjectRequest;
import com.example.logologolab.dto.project.ProjectResponse;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.service.admin.AdminProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "관리자 - 프로젝트", description = "관리자 전용 프로젝트 관리 API")
@SecurityRequirement(name = "bearerAuth")
public class AdminProjectController {

    private final AdminProjectService adminProjectService;

    @Operation(
            summary = "[관리자] 프로젝트 생성",
            description = "관리자 권한으로 프로젝트를 생성하고 에셋을 강제로 연결합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProjectRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                                    {
                                      "name": "새 프로젝트",
                                      "logoIds": [],
                                      "brandStrategyIds": [],
                                      "colorGuideIds": []
                                    }"""
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "프로젝트 생성 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ProjectResponse.class),
                            examples = @ExampleObject(
                                    name = "생성 성공 응답",
                                    value = """
                                    {
                                      "id": 5,
                                      "name": "새 프로젝트",
                                      "logoIds": [],
                                      "brandStrategyIds": [],
                                      "colorGuideIds": [],
                                      "createdAt": "2025-03-10T12:00:00Z",
                                      "updatedAt": "2025-03-10T12:00:00Z"
                                    }"""
                            ))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content)
    })
    @PostMapping("/api/admin/project/generate")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        ProjectResponse response = adminProjectService.createProject(req, principal.getEmail(), principal.getProvider());
        return ResponseEntity.created(URI.create("/api/admin/project/" + response.id())).body(response);
    }

    @Operation(summary = "[관리자] 전체 프로젝트 리스트 조회", description = "모든 사용자의 프로젝트를 최신순으로 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class),
                            examples = @ExampleObject(
                                    name = "리스트 조회 예시",
                                    value = """
                                    {
                                      "content": [
                                        {
                                          "id": 1,
                                          "name": "캠페인 A",
                                          "logoIds": [11, 12],
                                          "brandStrategyIds": [21],
                                          "colorGuideIds": [],
                                          "createdAt": "2025-03-01T10:00:00Z",
                                          "updatedAt": "2025-03-05T09:00:00Z"
                                        }
                                      ],
                                      "page": 0,
                                      "size": 10,
                                      "totalElements": 1,
                                      "totalPages": 2,
                                      "last": false
                                    }"""
                            )
                    ))
    })
    @GetMapping("/api/admin/projects")
    public PageResponse<ProjectListItem> getAllProjects(
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 사이즈") @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProjectListItem> result = adminProjectService.getAllProjects(pageable);

        return new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Operation(summary = "[관리자] 프로젝트 상세 조회", description = "ID로 임의의 프로젝트 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ProjectResponse.class),
                            examples = @ExampleObject(
                                    name = "상세 조회 예시",
                                    value = """
                                    {
                                      "id": 1,
                                      "name": "캠페인 A",
                                      "logoIds": [11, 12],
                                      "brandStrategyIds": [21],
                                      "colorGuideIds": [],
                                      "createdAt": "2025-03-01T10:00:00Z",
                                      "updatedAt": "2025-03-05T09:00:00Z"
                                    }"""
                            ))),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/api/admin/project/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(adminProjectService.getProject(id));
    }

    @Operation(
            summary = "[관리자] 프로젝트 수정",
            description = "프로젝트 이름 및 연결된 에셋을 강제로 수정합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProjectRequest.class),
                            examples = @ExampleObject(
                                    name = "수정 요청 예시",
                                    value = """
                                    {
                                      "name": "수정된 프로젝트 이름",
                                      "logoIds": [11, 13],
                                      "brandStrategyIds": [21],
                                      "colorGuideIds": [31]
                                    }"""
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ProjectResponse.class),
                            examples = @ExampleObject(
                                    name = "수정 응답 예시",
                                    value = """
                                    {
                                      "id": 1,
                                      "name": "수정된 프로젝트 이름",
                                      "logoIds": [11, 13],
                                      "brandStrategyIds": [21],
                                      "colorGuideIds": [31],
                                      "createdAt": "2025-03-01T10:00:00Z",
                                      "updatedAt": "2025-03-12T09:30:00Z"
                                    }"""
                            ))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/api/admin/project/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest req
    ) {
        return ResponseEntity.ok(adminProjectService.updateProject(id, req));
    }

    @Operation(summary = "[관리자] 프로젝트 삭제", description = "프로젝트를 강제로 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공", content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class),
                    examples = @ExampleObject(value = "{\"message\": \"프로젝트 삭제가 완료되었습니다.\"}")
            )),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/api/admin/project/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        adminProjectService.deleteProject(id);
        return ResponseEntity.ok(Map.of("message", "관리자 권한으로 프로젝트가 삭제되었습니다."));
    }
}