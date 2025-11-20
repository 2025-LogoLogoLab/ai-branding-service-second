package com.example.logologolab.controller.project;

import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.project.ProjectRequest;
import com.example.logologolab.dto.project.ProjectResponse;
import com.example.logologolab.service.project.ProjectService;

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
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "프로젝트 전략", description = "프로젝트 관련 API")
public class ProjectController {
    private final ProjectService projectService;


    @Operation(summary = "프로젝트 생성", description = "새로운 프로젝트를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "프로젝트 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content)
    })
    @PostMapping("/api/project/generate")
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest req) {
        ProjectResponse response = projectService.createProject(req);
        return ResponseEntity.created(URI.create("/api/projects/" + response.id())).body(response);
    }

    @Operation(summary = "프로젝트 상세 조회", description = "ID로 특정 프로젝트의 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/api/project/{projectId}")
    public ProjectResponse getProject(@PathVariable Long projectId) {
        return projectService.getProject(projectId);
    }

    @Operation(summary = "프로젝트 수정", description = "기존 프로젝트의 정보를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/api/project/{projectId}")
    public ProjectResponse updateProject(@PathVariable Long projectId, @Valid @RequestBody ProjectRequest req) {
        return projectService.updateProject(projectId, req);
    }

    @Operation(summary = "프로젝트 삭제", description = "ID로 특정 프로젝트를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공", content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class),
                    examples = @ExampleObject(value = "{\"message\": \"프로젝트 삭제가 완료되었습니다.\"}")
            )),
            @ApiResponse(responseCode = "401", description = "인증 실패", content = @Content),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/api/project/{projectId}")
    public ResponseEntity<Map<String, String>> deleteProject(
            @Parameter(description = "삭제할 프로젝트의 ID", required = true) @PathVariable Long projectId
    ) {
        projectService.deleteProject(projectId);

        Map<String, String> response = Map.of("message", "프로젝트 삭제가 완료되었습니다.");
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 프로젝트 리스트 조회", description = "로그인한 사용자의 프로젝트 목록을 페이징하여 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class),
                            examples = @ExampleObject(value = """
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
                                      "totalPages": 1,
                                      "last": true
                                    }""")
                    ))
    })
    @GetMapping("/api/projects")
    public PageResponse<ProjectResponse> listProjects(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 당 항목 수") @RequestParam(defaultValue = "10") int size
    ) {
        // 최신순(createdAt DESC) 정렬 기본 설정
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ProjectResponse> result = projectService.listMyProjects(pageable);

        return new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }
}