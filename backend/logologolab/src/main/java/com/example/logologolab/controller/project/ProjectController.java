package com.example.logologolab.controller.project;

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
        return ResponseEntity.created(URI.create("/api/projects/" + response.name())).body(response);
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
}