package com.example.logologolab.controller.color;

import com.example.logologolab.dto.color.ColorGuideDTO;
import com.example.logologolab.dto.color.ColorGuideRequest;
import com.example.logologolab.service.gpt.GptPromptService;
import com.example.logologolab.dto.color.*;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.service.color.ColorGuideService;
import com.example.logologolab.security.LoginUserProvider;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "컬러 가이드", description = "컬러 가이드 관련 API")
public class ColorController {

    private final GptPromptService gpt;
    private final ColorGuideService service;
    private final LoginUserProvider loginUserProvider;

    @Operation(
            summary = "컬러 가이드 생성",
            description = "브랜드 브리프(텍스트)만 또는 텍스트+로고 이미지(이미지 URL 또는 data:base64)를 입력하면 컬러 가이드를 JSON 스키마로 반환합니다.",
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
    @PostMapping(value="/api/color-guide/generate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ColorGuideDTO colorGuide(@RequestBody ColorGuideRequest req) {
        String style = req.style() == null ? "minimal" : req.style();

        String img = null;
        if (req.base64() != null && req.base64().startsWith("data:")) img = req.base64();
        else if (req.imageUrl() != null && !req.imageUrl().isBlank()) img = req.imageUrl();

        if (img != null) {
            return gpt.generateColorGuideFromImage(req.briefKo(), style, img);
        } else {
            return gpt.generateColorGuideTextOnly(req.briefKo(), style);
        }
    }

    @Operation(
            summary = "컬러가이드 저장(이미 생성된 결과 영속화)",
            description = "생성 API 응답(guide)을 포함하여 DB에 저장합니다.",
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
    @PostMapping(value = "/api/color-guide/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ColorGuideResponse> save(
            @RequestBody ColorGuidePersistRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        if (principal == null) {
            // Security Filter에서 처리되겠지만, 방어적으로 401 반환
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var saved = service.save(req, principal.getEmail(), principal.getProvider());
        return ResponseEntity.created(URI.create("/api/color-guide/" + saved.id())).body(saved);
    }

    @Operation(
            summary = "컬러가이드 상세 조회",
            parameters = @Parameter(name = "id", description = "ColorGuide ID", required = true)
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ColorGuideResponse.class))),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 ID")
    })
    @GetMapping(value = "/api/color-guide/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ColorGuideResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(
            summary = "컬러가이드 리스트 조회",
            description = "projectId가 있으면 프로젝트 기준, 없으면 내 데이터(createdBy) 기준으로 최신순 조회.",
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
                                        { "id": 42, "briefKo": "프리미엄 캔들...", "style": "luxury", "mainHex": "#1C3FAA", "pointHex": "#FFB400", "createdAt": "2025-08-24T09:12:34.123456" }
                                      ],
                                      "page": 0,
                                      "size": 12,
                                      "totalElements": 1,
                                      "totalPages": 1,
                                      "last": true
                                    }"""
                            )))
    })
    @GetMapping(value = "/api/color-guides", produces = MediaType.APPLICATION_JSON_VALUE)
    public PageResponse<ColorGuideListItem> list(
            @Parameter(description = "특정 프로젝트 ID (선택 사항)") @RequestParam(required = false) Long projectId,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 당 항목 수") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "'mine' 입력 시 내 가이드만 조회") @RequestParam(required = false) String filter,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ColorGuideListItem> p;

        if (projectId != null) {
            // 1. projectId가 있으면 프로젝트 기준으로 조회 (공개)
            p = service.listByProject(projectId, pageable);
        } else if ("mine".equalsIgnoreCase(filter)) {
            // 2. 'mine' 필터가 있으면 내 목록 조회 (로그인 필수)
            if (principal == null) {
                // 'mine'을 요청했으나 비로그인 상태
                p = Page.empty(pageable);
            } else {
                p = service.listMine(principal.getEmail(), principal.getProvider(), pageable);
            }
        } else {
            // 3. 그 외 모든 경우 전체 목록 조회
            p = service.listPublic(pageable);
        }

        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Operation(
            summary = "컬러 가이드 수정",
            description = "ID로 컬러 가이드를 찾아 guide 내용을 수정합니다. 본인의 데이터만 수정 가능합니다.",
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
    @PatchMapping("/api/color-guide/{id}")
    public ResponseEntity<ColorGuideResponse> update(
            @PathVariable Long id,
            @RequestBody ColorGuideUpdateRequest req
    ) {
        var updated = service.update(id, req);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "컬러 가이드 삭제", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "항목을 찾을 수 없거나 권한 없음")
    })
    @DeleteMapping("/api/color-guide/{id}")
    public ResponseEntity<Map<String, String>> deleteColorGuide(@PathVariable Long id) {
        service.deleteColorGuide(id);

        Map<String, String> response = Map.of("message", "컬러 가이드 삭제가 완료되었습니다.");

        return ResponseEntity.ok(response);
    }
}
