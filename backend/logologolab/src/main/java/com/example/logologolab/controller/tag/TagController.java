package com.example.logologolab.controller.tag;

import com.example.logologolab.dto.tag.TagRequest;
import com.example.logologolab.service.tag.TagService;
import io.swagger.v3.oas.annotations.Operation;
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

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "태그", description = "산출물 태깅 관련 API")
@SecurityRequirement(name = "bearerAuth") // 이 컨트롤러의 모든 API는 인증 필요
public class TagController {

    private final TagService tagService;

    @Operation(
            summary = "로고에 태그 할당 (덮어쓰기)",
            description = "특정 로고에 태그를 할당합니다. 기존에 할당된 태그는 모두 삭제되고 새로운 태그 목록으로 교체됩니다. 태그는 최대 5개까지 가능합니다."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "할당할 태그 이름 목록 (최대 5개)",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TagRequest.class),
                    examples = @ExampleObject(
                            name = "태그 할당 요청 예시",
                            value = """
                                    {
                                      "tagNames": ["#브랜딩", "#스타트업", "#미니멀"]
                                    }
                                    """
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "태그 할당 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"로고에 태그 달기가 완료되었습니다.\"}")
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 태그를 6개 이상 보내는 경우)", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 누락 또는 만료)", content = @Content),
            @ApiResponse(responseCode = "404", description = "로고를 찾을 수 없거나 현재 사용자의 소유가 아님", content = @Content)
    })
    @PostMapping("/api/logo/{id}/tags")
    public ResponseEntity<Map<String, String>> tagLogo(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        String message = tagService.assignTagsToLogo(id, request.tagNames());
        Map<String, String> response = Map.of("message", message);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "컬러 가이드에 태그 할당 (덮어쓰기)",
            description = "특정 컬러 가이드에 태그를 할당합니다. 기존 태그는 모두 삭제되고 새로운 목록으로 교체됩니다. 태그는 최대 5개까지 가능합니다."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "할당할 태그 이름 목록 (최대 5개)",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TagRequest.class),
                    examples = @ExampleObject(
                            name = "태그 할당 요청 예시",
                            value = """
                                    {
                                      "tagNames": ["#디자인", "#팔레트", "#UX"]
                                    }
                                    """
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "태그 할당 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"컬러 가이드에 태그 달기가 완료되었습니다.\"}")
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 태그를 6개 이상 보내는 경우)", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 누락 또는 만료)", content = @Content),
            @ApiResponse(responseCode = "404", description = "컬러 가이드를 찾을 수 없거나 현재 사용자의 소유가 아님", content = @Content)
    })
    @PostMapping("/api/color-guide/{id}/tags")
    public ResponseEntity<Map<String, String>> tagColorGuide(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        String message = tagService.assignTagsToColorGuide(id, request.tagNames());
        Map<String, String> response = Map.of("message", message);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "브랜딩 전략에 태그 할당 (덮어쓰기)",
            description = "특정 브랜딩 전략에 태그를 할당합니다. 기존 태그는 모두 삭제되고 새로운 목록으로 교체됩니다. 태그는 최대 5개까지 가능합니다."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "할당할 태그 이름 목록 (최대 5개)",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TagRequest.class),
                    examples = @ExampleObject(
                            name = "태그 할당 요청 예시",
                            value = """
                                    {
                                      "tagNames": ["#마케팅", "#사업전략"]
                                    }
                                    """
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "태그 할당 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"브랜딩 전략에 태그 달기가 완료되었습니다.\"}")
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 태그를 6개 이상 보내는 경우)", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 누락 또는 만료)", content = @Content),
            @ApiResponse(responseCode = "404", description = "브랜딩 전략을 찾을 수 없거나 현재 사용자의 소유가 아님", content = @Content)
    })
    @PostMapping("/api/brand-strategy/{id}/tags")
    public ResponseEntity<Map<String, String>> tagBrandStrategy(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        String message = tagService.assignTagsToBrandStrategy(id, request.tagNames());
        Map<String, String> response = Map.of("message", message);
        return ResponseEntity.ok(response);
    }
}