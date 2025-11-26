package com.example.logologolab.controller.admin;

import com.example.logologolab.dto.color.*;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.tag.TagRequest;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.service.admin.AdminColorService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "13. 관리자 컬러 가이드 관리", description = "관리자 전용 컬러 가이드 관리 및 태그 기능 API")
@SecurityRequirement(name = "bearerAuth")
public class AdminColorController {

    private final AdminColorService adminColorService;

    // 1. 생성
    @Operation(
            summary = "[관리자] 컬러 가이드 생성",
            description = "GPT를 이용해 컬러 가이드를 생성합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "컬러 가이드 요청 바디",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuideRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "텍스트만",
                                            summary = "텍스트만으로 컬러 가이드 생성",
                                            value = """
                        {
                          "briefKo": "프리미엄 캔들 브랜드. 조용한 럭셔리 톤, 선물용 패키지 강조, 웹/모바일 가독성 우선.",
                          "style": "luxury"
                        }
                        """
                                    ),
                                    @ExampleObject(
                                            name = "텍스트+이미지",
                                            summary = "로고 이미지 기반 컬러 가이드 생성",
                                            value = """
                        {
                          "briefKo": "첨부 로고 기반으로 버튼/본문/배경 용도를 포함해 컬러 가이드를 만들어줘.",
                          "style": "minimal",
                          "imageUrl": "https://example.com/logo.png"
                        }
                        """
                                    )
                            }
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "컬러 가이드 생성 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuideDTO.class),
                            examples = @ExampleObject(
                                    name = "성공 응답",
                                    value = """
                    {
                      "main": { "hex": "#1C3FAA", "description": "신뢰감 있는 메인 블루. 로고/헤더/강조 타이포에 사용." },
                      "sub": { "hex": "#11CDEF", "description": "산뜻한 보조 청록. 아이콘/보조 버튼/배지에 적합." },
                      "point": { "hex": "#FFB400", "description": "시선을 끄는 포인트 옐로. CTA 버튼/세일 라벨 등 제한적 사용." },
                      "background": { "hex": "#F7F9FC", "description": "저채도 라이트 배경. 카드/페이지 바탕에 사용, 가독성 강화." }
                    }
                    """
                            )
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping(value = "/api/admin/color-guide/generate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ColorGuideDTO> generate(@RequestBody ColorGuideRequest req) {
        return ResponseEntity.ok(adminColorService.generateColorGuide(req));
    }

    // 2. 저장
    @Operation(
            summary = "[관리자] 컬러 가이드 저장",
            description = "생성된 가이드를 관리자 계정으로 저장합니다.",
            security = @SecurityRequirement(name = "bearerAuth"),
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuidePersistRequest.class),
                            examples = @ExampleObject(
                                    name = "저장 요청 예시",
                                    value = """
                                    {
                                      "briefKo": "프리미엄 캔들 브랜드. 조용한 럭셔리 톤, 선물용 패키지 강조, 웹/모바일 가독성 우선.",
                                      "style": "luxury",
                                      "imageUrl": "https://s3.ap-northeast-2.amazonaws.com/your-bucket/logo.png",
                                      "projectId": 1,
                                      "guide": {
                                        "main": { "hex": "#1C3FAA", "description": "..." },
                                        "sub": { "hex": "#11CDEF", "description": "..." },
                                        "point": { "hex": "#FFB400", "description": "..." },
                                        "background": { "hex": "#F7F9FC", "description": "..." }
                                      }
                                    }"""
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "저장 성공 (Location 헤더 포함)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuideResponse.class),
                            examples = @ExampleObject(
                                    name = "저장 응답 예시",
                                    value = """
                                    {
                                      "id": 42,
                                      "briefKo": "프리미엄 캔들 브랜드...",
                                      "style": "luxury",
                                      "caseType": "WITH_LOGO",
                                      "sourceImage": "https://s3.ap-northeast-2.amazonaws.com/your-bucket/logo.png",
                                      "projectId": 1,
                                      "createdBy": "you@example.com",
                                      "createdAt": "2025-08-24T09:12:34.123456",
                                      "updatedAt": "2025-08-24T09:12:34.123456",
                                      "guide": {
                                        "main": { "hex": "#1C3FAA", "description": "..." },
                                        "sub": { "hex": "#11CDEF", "description": "..." },
                                        "point": { "hex": "#FFB400", "description": "..." },
                                        "background": { "hex": "#F7F9FC", "description": "..." }
                                      }
                                    }"""
                            ))),
            @ApiResponse(responseCode = "400", description = "유효성 오류(guide 누락/HEX 형식 등)"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping(value = "/api/admin/color-guide/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ColorGuideResponse> save(
            @RequestBody ColorGuidePersistRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        var saved = adminColorService.saveColorGuide(req, principal.getEmail(), principal.getProvider());
        return ResponseEntity.created(URI.create("/api/admin/color-guide/" + saved.id())).body(saved);
    }

    // 3. 리스트 조회
    @Operation(
            summary = "[관리자] 전체 컬러 가이드 리스트 조회",
            description = "모든 컬러 가이드를 최신순으로 조회합니다.",
            security = @SecurityRequirement(name = "bearerAuth"),
            parameters = {
                    @Parameter(name = "projectId", description = "Project ID (선택)"),
                    @Parameter(name = "page", description = "0-base 페이지 인덱스 (기본 0)"),
                    @Parameter(name = "size", description = "페이지 크기 (기본 12)")
            }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "목록 조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "content": [
                                                { "id": 42, "briefKo": "프리미엄 캔들...", "style": "luxury", "guide": {                                                                                                                 }, "createdAt": "2025-08-24T09:12:34.123456" }
                                              ],
                                              "page": 0,
                                              "size": 12,
                                              "totalElements": 1,
                                              "totalPages": 1,
                                              "last": true
                                            }"""
                            )))
    })
    @GetMapping("/api/admin/color-guides")
    public PageResponse<ColorGuideListItem> getAll(
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // projectId 전달
        Page<ColorGuideListItem> result = adminColorService.getAllColorGuides(projectId, pageable);

        return new PageResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // 4. 상세 조회
    @Operation(
            summary = "[관리자] 상세 조회",
            description = "ID로 컬러 가이드 상세 정보를 조회합니다.",
            parameters = @Parameter(name = "id", description = "ColorGuide ID", required = true)
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuideResponse.class))),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 ID")
    })
    @GetMapping("/api/admin/color-guide/{id}")
    public ResponseEntity<ColorGuideResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminColorService.getColorGuideDetail(id));
    }

    // 5. 수정
    @Operation(
            summary = "[관리자] 수정",
            description = "컬러 가이드의 내용을 수정합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuideResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "항목을 찾을 수 없거나 권한 없음")
    })
    @PatchMapping("/api/admin/color-guide/{id}")
    public ResponseEntity<ColorGuideResponse> update(
            @PathVariable Long id,
            @RequestBody ColorGuideUpdateRequest req
    ) {
        return ResponseEntity.ok(adminColorService.updateColorGuide(id, req));
    }

    // 6. 삭제
    @Operation(summary = "[관리자] 삭제", description = "컬러 가이드를 강제로 삭제합니다.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "항목을 찾을 수 없거나 권한 없음")
    })
    @DeleteMapping("/api/admin/color-guide/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        adminColorService.deleteColorGuideAny(id);
        return ResponseEntity.ok(Map.of("message", "관리자 권한으로 컬러 가이드가 삭제되었습니다."));
    }

    // 7. 태그 달기
    @Operation(
            summary = "[관리자] 태그 수정/할당",
            description = "컬러 가이드에 태그를 설정합니다 (기존 태그 덮어쓰기)."
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
    @PostMapping("/api/admin/color-guide/{id}/tags")
    public ResponseEntity<ColorGuideResponse> updateTags(
            @PathVariable Long id,
            @Valid @RequestBody TagRequest req
    ) {
        ColorGuideResponse response = adminColorService.updateTags(id, req.tagNames());
        return ResponseEntity.ok(response);
    }
}